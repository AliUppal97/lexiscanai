import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DeviceTrustService } from './device-trust.service';
import { MfaService } from '../auth/mfa.service';

@Injectable()
export class ZeroTrustService {
  private readonly logger = new Logger(ZeroTrustService.name);

  constructor(
    private prisma: PrismaService,
    private deviceTrustService: DeviceTrustService,
    private mfaService: MfaService,
  ) {}

  /**
   * Evaluate access request with Zero Trust principles
   */
  async evaluateAccess(
    userId: string,
    resource: string,
    context: {
      deviceId?: string;
      ipAddress?: string;
      userAgent?: string;
      location?: string;
    },
  ): Promise<{ allowed: boolean; trustScore: number; requiresMfa: boolean }> {
    // Calculate trust score
    const trustScore = await this.calculateTrustScore(userId, context.deviceId);

    // Check device trust
    const deviceTrust = context.deviceId
      ? await this.deviceTrustService.getDeviceTrust(context.deviceId)
      : null;

    // Determine if MFA is required
    const requiresMfa = trustScore < 70 || !deviceTrust || deviceTrust.trustScore < 60;

    // Evaluate access based on trust score
    const allowed = trustScore >= 50; // Minimum trust score threshold

    return {
      allowed,
      trustScore,
      requiresMfa,
    };
  }

  /**
   * Calculate trust score for user
   */
  async calculateTrustScore(userId: string, deviceId?: string): Promise<number> {
    let score = 50; // Base score

    // Factor 1: Device trust (if device provided)
    if (deviceId) {
      const deviceTrust = await this.deviceTrustService.getDeviceTrust(deviceId);
      if (deviceTrust) {
        score += (deviceTrust.trustScore - 50) * 0.3; // 30% weight
      } else {
        score -= 20; // Unknown device penalty
      }
    }

    // Factor 2: User history (login frequency, etc.)
    const userHistory = await this.getUserHistory(userId);
    score += userHistory.score * 0.2; // 20% weight

    // Factor 3: MFA status
    const mfaEnabled = await this.mfaService.isMfaEnabled(userId);
    if (mfaEnabled) {
      score += 15; // MFA bonus
    }

    // Factor 4: Recent activity
    const recentActivity = await this.getRecentActivity(userId);
    score += recentActivity.score * 0.1; // 10% weight

    // Normalize to 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Require MFA based on context
   */
  async requireMfa(userId: string, context: any): Promise<boolean> {
    const trustScore = await this.calculateTrustScore(userId, context.deviceId);
    return trustScore < 70;
  }

  /**
   * Block access
   */
  async blockAccess(userId: string, reason: string): Promise<void> {
    // Create security incident
    await this.prisma.securityIncident.create({
      data: {
        type: 'UNAUTHORIZED_ACCESS',
        severity: 'HIGH',
        status: 'OPEN',
        details: {
          userId,
          reason,
          blocked: true,
        },
        tenantId: '', // Would get from user
      },
    });

    this.logger.warn(`Access blocked for user ${userId}: ${reason}`);
  }

  /**
   * Get user history score
   */
  private async getUserHistory(userId: string): Promise<{ score: number }> {
    // Simplified - would analyze user login patterns, etc.
    return { score: 20 };
  }

  /**
   * Get recent activity score
   */
  private async getRecentActivity(userId: string): Promise<{ score: number }> {
    // Simplified - would analyze recent user activity
    return { score: 10 };
  }
}

