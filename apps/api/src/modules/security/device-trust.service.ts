import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DeviceTrust } from '@prisma/client';

@Injectable()
export class DeviceTrustService {
  private readonly logger = new Logger(DeviceTrustService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Register device
   */
  async registerDevice(userId: string, deviceId: string, deviceInfo: any): Promise<DeviceTrust> {
    const fingerprint = this.generateFingerprint(deviceInfo);
    const trustScore = this.calculateInitialTrustScore(deviceInfo);

    const device = await this.prisma.deviceTrust.upsert({
      where: {
        userId_deviceId: {
          userId,
          deviceId,
        },
      },
      update: {
        deviceFingerprint: fingerprint,
        trustScore,
        lastSeenAt: new Date(),
      },
      create: {
        userId,
        deviceId,
        deviceFingerprint: fingerprint,
        trustScore,
      },
    });

    return device;
  }

  /**
   * Evaluate device trust
   */
  async evaluateDevice(deviceId: string): Promise<DeviceTrust | null> {
    const device = await this.prisma.deviceTrust.findFirst({
      where: { deviceId },
    });

    if (!device) {
      return null;
    }

    // Update trust score based on recent activity
    const updatedScore = this.updateTrustScore(device);
    if (updatedScore !== device.trustScore) {
      return this.prisma.deviceTrust.update({
        where: { id: device.id },
        data: { trustScore: updatedScore, lastSeenAt: new Date() },
      });
    }

    return device;
  }

  /**
   * Revoke device
   */
  async revokeDevice(deviceId: string): Promise<void> {
    await this.prisma.deviceTrust.deleteMany({
      where: { deviceId },
    });
  }

  /**
   * Get device trust
   */
  async getDeviceTrust(deviceId: string): Promise<DeviceTrust | null> {
    return this.prisma.deviceTrust.findFirst({
      where: { deviceId },
    });
  }

  /**
   * Generate device fingerprint
   */
  private generateFingerprint(deviceInfo: any): any {
    return {
      userAgent: deviceInfo.userAgent,
      platform: deviceInfo.platform,
      language: deviceInfo.language,
      timezone: deviceInfo.timezone,
      screenResolution: deviceInfo.screenResolution,
      // Add more fingerprinting data
    };
  }

  /**
   * Calculate initial trust score
   */
  private calculateInitialTrustScore(deviceInfo: any): number {
    let score = 50; // Base score

    // Factor in device characteristics
    if (deviceInfo.isMobile) {
      score -= 10; // Mobile devices slightly less trusted
    }

    if (deviceInfo.isKnownDevice) {
      score += 20; // Known device bonus
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Update trust score based on activity
   */
  private updateTrustScore(device: DeviceTrust): number {
    let score = device.trustScore;

    // Increase trust if device seen recently
    const hoursSinceLastSeen = (Date.now() - device.lastSeenAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastSeen < 24) {
      score += 5; // Recent activity bonus
    } else if (hoursSinceLastSeen > 30 * 24) {
      score -= 10; // Stale device penalty
    }

    // Check risk factors
    const riskFactors = (device.riskFactors as any) || {};
    if (riskFactors.suspiciousActivity) {
      score -= 20;
    }
    if (riskFactors.locationChange) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }
}

