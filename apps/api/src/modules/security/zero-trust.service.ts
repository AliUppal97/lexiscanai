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
   * Get user history score (analyzes login patterns, behavior)
   */
  private async getUserHistory(userId: string): Promise<{ score: number }> {
    // Analyze login frequency and patterns
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30, // Last 30 sessions
    });

    if (sessions.length === 0) {
      return { score: 0 }; // No history
    }

    // Calculate score based on:
    // 1. Login frequency (more frequent = higher score)
    // 2. Consistent login times (more consistent = higher score)
    // 3. Account age (older = higher score)

    const daysSinceFirstLogin = (Date.now() - sessions[sessions.length - 1].createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const loginFrequency = sessions.length / Math.max(1, daysSinceFirstLogin / 30); // Logins per month

    let score = 0;
    score += Math.min(30, loginFrequency * 5); // Up to 30 points for frequency
    score += Math.min(20, daysSinceFirstLogin / 30); // Up to 20 points for account age

    // Check for consistent login times (simplified)
    const loginHours = sessions.map((s) => s.createdAt.getHours());
    const avgHour = loginHours.reduce((sum, h) => sum + h, 0) / loginHours.length;
    const variance = loginHours.reduce((sum, h) => sum + Math.pow(h - avgHour, 2), 0) / loginHours.length;
    if (variance < 4) {
      score += 10; // Consistent login times
    }

    return { score: Math.min(100, score) };
  }

  /**
   * Get recent activity score
   */
  private async getRecentActivity(userId: string): Promise<{ score: number }> {
    // Analyze recent user activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Check document activity
    const recentDocuments = await this.prisma.document.count({
      where: {
        userId,
        createdAt: { gte: oneDayAgo },
      },
    });

    // Check session activity
    const recentSessions = await this.prisma.session.count({
      where: {
        userId,
        createdAt: { gte: oneDayAgo },
      },
    });

    let score = 0;
    score += Math.min(30, recentDocuments * 5); // Up to 30 points for document activity
    score += Math.min(20, recentSessions * 10); // Up to 20 points for session activity

    return { score: Math.min(100, score) };
  }

  /**
   * Continuous monitoring
   */
  async monitorAccess(userId: string, resource: string, context: any): Promise<void> {
    const trustScore = await this.calculateTrustScore(userId, context.deviceId);

    // Log access attempt
    this.logger.debug(`Access attempt: user=${userId}, resource=${resource}, trustScore=${trustScore}`);

    // If trust score drops below threshold, require additional verification
    if (trustScore < 50) {
      await this.prisma.securityIncident.create({
        data: {
          type: 'SUSPICIOUS_ACTIVITY',
          severity: 'MEDIUM',
          status: 'OPEN',
          details: {
            userId,
            resource,
            trustScore,
            context,
          },
          tenantId: '', // Would get from user
        },
      });
    }
  }
}

