import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { authenticator } from 'otplib';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

export interface SetupTotpResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface VerifyTotpDto {
  code: string;
  userId: string;
  tenantId: string;
}

export interface VerifyMfaDto {
  userId: string;
  tenantId: string;
  code: string;
  type?: 'TOTP' | 'SMS' | 'EMAIL';
}

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);
  private readonly issuerName: string;
  private readonly encryptionKey: string;
  private readonly backupCodeCount = 10;
  private readonly backupCodeLength = 8;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.issuerName = this.configService.get<string>('MFA_ISSUER_NAME', 'LexiScanAI');
    this.encryptionKey = this.configService.get<string>('MFA_ENCRYPTION_KEY') || this.generateEncryptionKey();
  }

  /**
   * Setup TOTP (Time-based One-Time Password) for user
   */
  async setupTotp(userId: string, tenantId: string, deviceName: string): Promise<SetupTotpResult> {
    // Check if user already has active TOTP
    const existingTotp = await this.prisma.mfaDevice.findFirst({
      where: {
        userId,
        tenantId,
        type: 'TOTP',
        isActive: true,
      },
    });

    if (existingTotp) {
      throw new BadRequestException('TOTP is already enabled for this user');
    }

    // Generate TOTP secret
    const secret = authenticator.generateSecret();
    const encryptedSecret = this.encryptSecret(secret);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Create TOTP device
    await this.prisma.mfaDevice.create({
      data: {
        userId,
        tenantId,
        type: 'TOTP',
        name: deviceName,
        secret: encryptedSecret,
        isActive: true,
      },
    });

    // Create backup code devices
    for (const code of backupCodes) {
      const hashedCode = await bcrypt.hash(code, 10);
      await this.prisma.mfaDevice.create({
        data: {
          userId,
          tenantId,
          type: 'BACKUP',
          name: 'Backup Code',
          secret: hashedCode,
          isActive: true,
        },
      });
    }

    // Generate QR code URL
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    const qrCodeUrl = authenticator.keyuri(user?.email || userId, this.issuerName, secret);

    return {
      secret, // Return plain secret for QR code generation (only shown once)
      qrCodeUrl,
      backupCodes, // Return plain backup codes (only shown once)
    };
  }

  /**
   * Verify TOTP code
   */
  async verifyTotp(dto: VerifyTotpDto): Promise<boolean> {
    const { code, userId, tenantId } = dto;

    // Find active TOTP device
    const totpDevice = await this.prisma.mfaDevice.findFirst({
      where: {
        userId,
        tenantId,
        type: 'TOTP',
        isActive: true,
      },
    });

    if (!totpDevice) {
      throw new UnauthorizedException('TOTP not set up for this user');
    }

    // Decrypt secret
    const secret = this.decryptSecret(totpDevice.secret);

    // Verify TOTP code
    const isValid = authenticator.verify({ token: code, secret });

    if (isValid) {
      // Update last used time
      await this.prisma.mfaDevice.update({
        where: { id: totpDevice.id },
        data: { lastUsedAt: new Date() },
      });
    }

    return isValid;
  }

  /**
   * Verify MFA code (TOTP, SMS, Email, or Backup)
   */
  async verifyMfa(dto: VerifyMfaDto): Promise<{ verified: boolean; type: string }> {
    const { userId, tenantId, code, type } = dto;

    // Try TOTP first if type not specified or type is TOTP
    if (!type || type === 'TOTP') {
      try {
        const isValid = await this.verifyTotp({ code, userId, tenantId });
        if (isValid) {
          return { verified: true, type: 'TOTP' };
        }
      } catch (error) {
        // Continue to other methods
      }
    }

    // Try backup codes
    if (!type || type === 'BACKUP') {
      const isValid = await this.verifyBackupCode(userId, tenantId, code);
      if (isValid) {
        return { verified: true, type: 'BACKUP' };
      }
    }

    // Try SMS
    if (!type || type === 'SMS') {
      const isValid = await this.verifySmsCode(userId, tenantId, code);
      if (isValid) {
        return { verified: true, type: 'SMS' };
      }
    }

    // Try Email
    if (!type || type === 'EMAIL') {
      const isValid = await this.verifyEmailCode(userId, tenantId, code);
      if (isValid) {
        return { verified: true, type: 'EMAIL' };
      }
    }

    return { verified: false, type: 'UNKNOWN' };
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, tenantId: string, code: string): Promise<boolean> {
    const backupDevices = await this.prisma.mfaDevice.findMany({
      where: {
        userId,
        tenantId,
        type: 'BACKUP',
        isActive: true,
      },
    });

    for (const device of backupDevices) {
      const isValid = await bcrypt.compare(code, device.secret);
      if (isValid) {
        // Remove used backup code
        await this.prisma.mfaDevice.delete({
          where: { id: device.id },
        });
        return true;
      }
    }

    return false;
  }

  /**
   * Send SMS verification code
   */
  async sendSmsCode(userId: string, tenantId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true },
    });

    if (!user?.phone) {
      throw new BadRequestException('Phone number not set for user');
    }

    const code = this.generateNumericCode(6);
    const hashedCode = await bcrypt.hash(code, 10);

    // Create or update SMS device
    await this.prisma.mfaDevice.upsert({
      where: {
        userId_tenantId_type: {
          userId,
          tenantId,
          type: 'SMS',
        },
      },
      create: {
        userId,
        tenantId,
        type: 'SMS',
        name: 'SMS Device',
        secret: hashedCode,
        isActive: true,
      },
      update: {
        secret: hashedCode,
        lastUsedAt: null,
      },
    });

    // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
    this.logger.log(`SMS code for ${user.phone}: ${code} (dev only - implement SMS provider)`);

    // In production, send SMS via provider
    // await this.smsService.send(user.phone, `Your verification code is: ${code}`);
  }

  /**
   * Send email verification code
   */
  async sendEmailCode(userId: string, tenantId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user?.email) {
      throw new BadRequestException('Email not set for user');
    }

    const code = this.generateNumericCode(6);
    const hashedCode = await bcrypt.hash(code, 10);

    // Create or update EMAIL device
    await this.prisma.mfaDevice.upsert({
      where: {
        userId_tenantId_type: {
          userId,
          tenantId,
          type: 'EMAIL',
        },
      },
      create: {
        userId,
        tenantId,
        type: 'EMAIL',
        name: 'Email Device',
        secret: hashedCode,
        isActive: true,
      },
      update: {
        secret: hashedCode,
        lastUsedAt: null,
      },
    });

    // TODO: Integrate with email service
    this.logger.log(`Email code for ${user.email}: ${code} (dev only - implement email service)`);

    // In production, send email via service
    // await this.emailService.send(user.email, 'Verification Code', `Your verification code is: ${code}`);
  }

  /**
   * Verify SMS code
   */
  async verifySmsCode(userId: string, tenantId: string, code: string): Promise<boolean> {
    const smsDevice = await this.prisma.mfaDevice.findFirst({
      where: {
        userId,
        tenantId,
        type: 'SMS',
        isActive: true,
      },
    });

    if (!smsDevice) {
      return false;
    }

    // Codes expire after 10 minutes
    if (smsDevice.lastUsedAt && new Date().getTime() - smsDevice.lastUsedAt.getTime() > 10 * 60 * 1000) {
      return false;
    }

    const isValid = await bcrypt.compare(code, smsDevice.secret);

    if (isValid) {
      await this.prisma.mfaDevice.update({
        where: { id: smsDevice.id },
        data: { lastUsedAt: new Date() },
      });
    }

    return isValid;
  }

  /**
   * Verify email code
   */
  async verifyEmailCode(userId: string, tenantId: string, code: string): Promise<boolean> {
    const emailDevice = await this.prisma.mfaDevice.findFirst({
      where: {
        userId,
        tenantId,
        type: 'EMAIL',
        isActive: true,
      },
    });

    if (!emailDevice) {
      return false;
    }

    // Codes expire after 10 minutes
    if (emailDevice.lastUsedAt && new Date().getTime() - emailDevice.lastUsedAt.getTime() > 10 * 60 * 1000) {
      return false;
    }

    const isValid = await bcrypt.compare(code, emailDevice.secret);

    if (isValid) {
      await this.prisma.mfaDevice.update({
        where: { id: emailDevice.id },
        data: { lastUsedAt: new Date() },
      });
    }

    return isValid;
  }

  /**
   * Disable MFA for user
   */
  async disableMfa(userId: string, tenantId: string, type?: 'TOTP' | 'SMS' | 'EMAIL'): Promise<void> {
    const where: any = {
      userId,
      tenantId,
      isActive: true,
    };

    if (type) {
      where.type = type;
    }

    await this.prisma.mfaDevice.updateMany({
      where,
      data: {
        isActive: false,
      },
    });
  }

  /**
   * Get MFA status for user
   */
  async getMfaStatus(userId: string, tenantId: string): Promise<{
    totpEnabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    backupCodesRemaining: number;
  }> {
    const devices = await this.prisma.mfaDevice.findMany({
      where: {
        userId,
        tenantId,
        isActive: true,
      },
    });

    return {
      totpEnabled: devices.some((d) => d.type === 'TOTP'),
      smsEnabled: devices.some((d) => d.type === 'SMS'),
      emailEnabled: devices.some((d) => d.type === 'EMAIL'),
      backupCodesRemaining: devices.filter((d) => d.type === 'BACKUP').length,
    };
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string, tenantId: string): Promise<string[]> {
    // Delete existing backup codes
    await this.prisma.mfaDevice.deleteMany({
      where: {
        userId,
        tenantId,
        type: 'BACKUP',
      },
    });

    // Generate new backup codes
    const backupCodes = this.generateBackupCodes();

    // Create new backup code devices
    for (const code of backupCodes) {
      const hashedCode = await bcrypt.hash(code, 10);
      await this.prisma.mfaDevice.create({
        data: {
          userId,
          tenantId,
          type: 'BACKUP',
          name: 'Backup Code',
          secret: hashedCode,
          isActive: true,
        },
      });
    }

    return backupCodes;
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.backupCodeCount; i++) {
      codes.push(this.generateAlphanumericCode(this.backupCodeLength));
    }
    return codes;
  }

  /**
   * Generate alphanumeric code
   */
  private generateAlphanumericCode(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar characters
    return Array.from(crypto.randomBytes(length))
      .map((byte) => chars[byte % chars.length])
      .join('');
  }

  /**
   * Generate numeric code
   */
  private generateNumericCode(length: number): string {
    return Array.from(crypto.randomBytes(length))
      .map((byte) => (byte % 10).toString())
      .join('');
  }

  /**
   * Encrypt secret (simple encryption - use proper encryption in production)
   */
  private encryptSecret(secret: string): string {
    // In production, use proper encryption (AES-256-GCM)
    // For now, return base64 encoded secret
    return Buffer.from(secret).toString('base64');
  }

  /**
   * Decrypt secret
   */
  private decryptSecret(encrypted: string): string {
    // In production, use proper decryption
    // For now, decode base64
    return Buffer.from(encrypted, 'base64').toString('utf-8');
  }

  /**
   * Generate encryption key (fallback)
   */
  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
