import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CustomDomain } from '@prisma/client';
import * as dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);

@Injectable()
export class CustomDomainService {
  private readonly logger = new Logger(CustomDomainService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Add custom domain
   */
  async addDomain(tenantId: string, domain: string): Promise<CustomDomain> {
    // Validate domain format
    this.validateDomain(domain);

    // Check if domain already exists
    const existing = await this.prisma.customDomain.findUnique({
      where: { domain },
    });

    if (existing) {
      throw new BadRequestException(`Domain ${domain} is already in use`);
    }

    const customDomain = await this.prisma.customDomain.create({
      data: {
        tenantId,
        domain,
        verified: false,
      },
    });

    return customDomain;
  }

  /**
   * Verify domain ownership via DNS
   */
  async verifyDomain(tenantId: string, domain: string): Promise<boolean> {
    const customDomain = await this.prisma.customDomain.findFirst({
      where: { domain, tenantId },
    });

    if (!customDomain) {
      throw new BadRequestException(`Domain ${domain} not found`);
    }

    try {
      // Check for verification TXT record
      const verificationCode = `lexiscan-verify=${tenantId}`;
      const records = await resolveTxt(domain);

      const found = records.some((record) =>
        record.some((txt) => txt.includes(verificationCode)),
      );

      if (found) {
        await this.prisma.customDomain.update({
          where: { id: customDomain.id },
          data: {
            verified: true,
            verifiedAt: new Date(),
          },
        });

        // TODO: Request SSL certificate (Let's Encrypt)
        await this.requestSslCertificate(domain);

        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Failed to verify domain: ${error.message}`);
      return false;
    }
  }

  /**
   * Remove custom domain
   */
  async removeDomain(tenantId: string, domain: string): Promise<void> {
    await this.prisma.customDomain.deleteMany({
      where: { domain, tenantId },
    });
  }

  /**
   * Get SSL certificate
   */
  async getSslCertificate(domain: string): Promise<any> {
    const customDomain = await this.prisma.customDomain.findUnique({
      where: { domain },
    });

    return customDomain?.sslCertificate || null;
  }

  /**
   * Validate domain format
   */
  private validateDomain(domain: string): void {
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(domain)) {
      throw new BadRequestException(`Invalid domain format: ${domain}`);
    }
  }

  /**
   * Request SSL certificate (Let's Encrypt)
   */
  private async requestSslCertificate(domain: string): Promise<void> {
    // TODO: Integrate with Let's Encrypt or AWS Certificate Manager
    this.logger.debug(`Requesting SSL certificate for ${domain}`);
  }
}

