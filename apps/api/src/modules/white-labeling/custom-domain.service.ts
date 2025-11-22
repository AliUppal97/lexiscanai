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

        // Request SSL certificate (Let's Encrypt)
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
   * Request SSL certificate (Let's Encrypt or AWS Certificate Manager)
   */
  private async requestSslCertificate(domain: string): Promise<void> {
    try {
      // Check if using AWS Certificate Manager
      const useACM = process.env.USE_AWS_ACM === 'true';
      
      if (useACM) {
        await this.requestAwsCertificate(domain);
      } else {
        await this.requestLetsEncryptCertificate(domain);
      }
    } catch (error) {
      this.logger.error(`Failed to request SSL certificate for ${domain}: ${error.message}`);
      // Still update with pending status
      await this.prisma.customDomain.updateMany({
        where: { domain },
        data: {
          sslCertificate: {
            domain,
            status: 'failed',
            error: error.message,
            requestedAt: new Date().toISOString(),
          },
        },
      });
    }
  }

  /**
   * Request SSL certificate from AWS Certificate Manager
   */
  private async requestAwsCertificate(domain: string): Promise<void> {
    // In production, use AWS SDK
    // const AWS = require('aws-sdk');
    // const acm = new AWS.ACM({ region: process.env.AWS_REGION });
    
    // const params = {
    //   DomainName: domain,
    //   ValidationMethod: 'DNS',
    //   SubjectAlternativeNames: [`*.${domain}`],
    // };
    
    // const result = await acm.requestCertificate(params).promise();
    
    // For now, simulate ACM certificate request
    this.logger.log(`Requesting AWS ACM certificate for ${domain}`);
    
    const certificateData = {
      domain,
      issuer: 'Amazon',
      certificateArn: `arn:aws:acm:us-east-1:123456789012:certificate/${Date.now()}`,
      validationMethod: 'DNS',
      status: 'pending_validation',
      validFrom: null,
      validTo: null,
      requestedAt: new Date().toISOString(),
      validationRecords: [
        {
          name: `_${Date.now()}.${domain}`,
          type: 'CNAME',
          value: `_${Date.now()}.acm-validations.aws.`,
        },
      ],
    };

    await this.prisma.customDomain.updateMany({
      where: { domain },
      data: { sslCertificate: certificateData },
    });

    this.logger.log(`AWS ACM certificate requested for ${domain}`);
  }

  /**
   * Request SSL certificate from Let's Encrypt
   */
  private async requestLetsEncryptCertificate(domain: string): Promise<void> {
    // In production, use greenlock or certbot
    // const greenlock = require('greenlock-express');
    
    // For now, simulate Let's Encrypt certificate request
    this.logger.log(`Requesting Let's Encrypt certificate for ${domain}`);
    
    // Generate verification token
    const verificationToken = `lexiscan-ssl-${Date.now()}`;
    
    const certificateData = {
      domain,
      issuer: 'Let\'s Encrypt',
      status: 'pending',
      validFrom: null,
      validTo: null,
      requestedAt: new Date().toISOString(),
      verificationToken,
      verificationUrl: `http://${domain}/.well-known/acme-challenge/${verificationToken}`,
      // Certificate will be valid for 90 days after issuance
      expectedValidTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    };

    await this.prisma.customDomain.updateMany({
      where: { domain },
      data: { sslCertificate: certificateData },
    });

    // In production, would:
    // 1. Create ACME challenge file
    // 2. Wait for DNS propagation
    // 3. Complete ACME challenge
    // 4. Receive certificate
    // 5. Install certificate on load balancer/CDN
    
    this.logger.log(`Let's Encrypt certificate requested for ${domain}. Verification token: ${verificationToken}`);
  }

  /**
   * Check domain health
   */
  async checkDomainHealth(domain: string): Promise<{
    healthy: boolean;
    issues: string[];
    sslValid: boolean;
    dnsConfigured: boolean;
  }> {
    const customDomain = await this.prisma.customDomain.findUnique({
      where: { domain },
    });

    if (!customDomain) {
      throw new Error(`Domain ${domain} not found`);
    }

    const issues: string[] = [];
    let sslValid = false;
    let dnsConfigured = false;

    // Check SSL certificate
    if (customDomain.sslCertificate) {
      const cert = customDomain.sslCertificate as any;
      if (cert.status === 'active' && new Date(cert.validTo) > new Date()) {
        sslValid = true;
      } else {
        issues.push('SSL certificate expired or invalid');
      }
    } else {
      issues.push('SSL certificate not configured');
    }

    // Check DNS configuration
    try {
      const records = await resolveTxt(domain);
      dnsConfigured = records.length > 0;
      if (!dnsConfigured) {
        issues.push('DNS records not configured');
      }
    } catch (error) {
      issues.push(`DNS check failed: ${error.message}`);
    }

    return {
      healthy: issues.length === 0,
      issues,
      sslValid,
      dnsConfigured,
    };
  }
}

