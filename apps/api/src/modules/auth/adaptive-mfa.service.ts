import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { MfaService } from './mfa.service';
import { SessionAnomalyService } from './session-anomaly.service';

export interface RiskAssessment {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: string[];
  score: number; // 0-100
}

export interface MfaRequirement {
  required: boolean;
  methods: string[]; // ['TOTP', 'SMS', 'EMAIL', 'FIDO2']
  reason?: string;
}

@Injectable()
export class AdaptiveMfaService {
  private readonly logger = new Logger(AdaptiveMfaService.name);
  private readonly riskThresholds = {
    LOW: 0,
    MEDIUM: 30,
    HIGH: 60,
    CRITICAL: 80,
  };

  constructor(
    private prisma: PrismaService,
    private mfaService: MfaService,
    private sessionAnomalyService: SessionAnomalyService,
  ) {}

  /**
   * Assess risk level for authentication attempt
   */
  async assessRisk(context: {
    userId?: string;
    tenantId?: string;
    email?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: any;
    isNewDevice?: boolean;
    isNewLocation?: boolean;
    isUnusualTime?: boolean;
    previousFailures?: number;
  }): Promise<RiskAssessment> {
    let riskScore = 0;
    const factors: string[] = [];

    // Factor 1: New device (30 points)
    if (context.isNewDevice) {
      riskScore += 30;
      factors.push('NEW_DEVICE');
    }

    // Factor 2: New location/IP (25 points)
    if (context.isNewLocation) {
      riskScore += 25;
      factors.push('NEW_LOCATION');
    }

    // Factor 3: Unusual time (15 points)
    if (context.isUnusualTime) {
      riskScore += 15;
      factors.push('UNUSUAL_TIME');
    }

    // Factor 4: Previous failed attempts (20 points)
    if (context.previousFailures && context.previousFailures > 0) {
      riskScore += Math.min(context.previousFailures * 5, 20);
      factors.push(`FAILED_ATTEMPTS_${context.previousFailures}`);
    }

    // Factor 5: Check for active anomalies (30 points)
    if (context.userId && context.tenantId) {
      // This would check session anomalies - simplified for now
      // In production, query SessionAnomaly table
    }

    // Factor 6: Admin/privileged user (10 points)
    if (context.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: context.userId },
        include: {
          userRoles: {
            include: { role: true },
          },
        },
      });

      if (user) {
        const isAdmin = user.userRoles.some((ur) =>
          ['ADMIN', 'SUPER_ADMIN', 'TENANT_ADMIN'].includes(ur.role.name.toUpperCase()),
        );
        if (isAdmin) {
          riskScore += 10;
          factors.push('PRIVILEGED_USER');
        }
      }
    }

    // Determine risk level
    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (riskScore >= this.riskThresholds.CRITICAL) {
      level = 'CRITICAL';
    } else if (riskScore >= this.riskThresholds.HIGH) {
      level = 'HIGH';
    } else if (riskScore >= this.riskThresholds.MEDIUM) {
      level = 'MEDIUM';
    } else {
      level = 'LOW';
    }

    return {
      level,
      factors,
      score: Math.min(riskScore, 100),
    };
  }

  /**
   * Determine MFA requirements based on risk assessment
   */
  async getMfaRequirement(
    userId: string,
    tenantId: string,
    riskAssessment: RiskAssessment,
  ): Promise<MfaRequirement> {
    // Get user's MFA status
    const mfaStatus = await this.mfaService.getMfaStatus(userId, tenantId);

    // Always require MFA for critical risk
    if (riskAssessment.level === 'CRITICAL') {
      return {
        required: true,
        methods: this.getAvailableMethods(mfaStatus),
        reason: 'Critical risk detected - MFA required',
      };
    }

    // Require MFA for high risk
    if (riskAssessment.level === 'HIGH') {
      return {
        required: true,
        methods: this.getAvailableMethods(mfaStatus),
        reason: 'High risk detected - MFA required',
      };
    }

    // Optional MFA for medium risk (prompt but don't require)
    if (riskAssessment.level === 'MEDIUM') {
      return {
        required: false,
        methods: this.getAvailableMethods(mfaStatus),
        reason: 'Medium risk detected - MFA recommended',
      };
    }

    // No MFA required for low risk
    return {
      required: false,
      methods: [],
      reason: 'Low risk - MFA not required',
    };
  }

  /**
   * Get available MFA methods for user
   */
  private getAvailableMethods(mfaStatus: {
    totpEnabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
    backupCodesRemaining: number;
  }): string[] {
    const methods: string[] = [];

    if (mfaStatus.totpEnabled) {
      methods.push('TOTP');
    }

    if (mfaStatus.smsEnabled) {
      methods.push('SMS');
    }

    if (mfaStatus.emailEnabled) {
      methods.push('EMAIL');
    }

    // Check for FIDO2/WebAuthn
    // This would query WebAuthnCredential table
    // For now, assume it's available if TOTP is enabled

    if (mfaStatus.backupCodesRemaining > 0) {
      methods.push('BACKUP');
    }

    return methods;
  }

  /**
   * Check if MFA should be required for operation
   */
  async shouldRequireMfaForOperation(
    userId: string,
    tenantId: string,
    operation: string, // e.g., 'password_change', 'sensitive_data_access'
  ): Promise<boolean> {
    // Always require MFA for sensitive operations
    const sensitiveOperations = [
      'password_change',
      'email_change',
      'mfa_disable',
      'api_key_create',
      'api_key_delete',
      'billing_update',
      'admin_access',
    ];

    if (sensitiveOperations.includes(operation)) {
      return true;
    }

    // Check user's role - admins always need MFA for sensitive ops
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (user) {
      const isAdmin = user.userRoles.some((ur) =>
        ['ADMIN', 'SUPER_ADMIN', 'TENANT_ADMIN'].includes(ur.role.name.toUpperCase()),
      );

      if (isAdmin && sensitiveOperations.includes(operation)) {
        return true;
      }
    }

    return false;
  }
}

