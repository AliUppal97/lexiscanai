import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SecurityService } from './security.service';

export interface SessionAnomalyCheck {
  sessionId: string;
  userId: string;
  tenantId: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: any;
}

@Injectable()
export class SessionAnomalyService {
  private readonly logger = new Logger(SessionAnomalyService.name);

  constructor(
    private prisma: PrismaService,
    private securityService: SecurityService,
  ) {}

  /**
   * Check for session anomalies and create anomaly records
   */
  async checkAnomalies(check: SessionAnomalyCheck): Promise<void> {
    const { sessionId, userId, tenantId, ipAddress, userAgent, deviceInfo } = check;

    // Get user's recent sessions
    const recentSessions = await this.prisma.session.findMany({
      where: {
        userId,
        tenantId,
        isActive: true,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Check for anomalies
    const anomalies: Array<{ type: string; severity: string; details: any }> = [];

    // 1. Check for new country (if IP geolocation available)
    if (ipAddress && recentSessions.length > 0) {
      const previousIp = recentSessions[0]?.ipAddress;
      if (previousIp && ipAddress !== previousIp) {
        // In production, use IP geolocation service
        anomalies.push({
          type: 'NEW_IP',
          severity: 'MEDIUM',
          details: { previousIp, currentIp: ipAddress },
        });
      }
    }

    // 2. Check for new device
    if (deviceInfo && recentSessions.length > 0) {
      const previousDevice = recentSessions[0]?.deviceInfo;
      if (previousDevice) {
        const currentFingerprint = deviceInfo.fingerprint || this.generateDeviceFingerprint(deviceInfo);
        const previousFingerprint = previousDevice.fingerprint || this.generateDeviceFingerprint(previousDevice);

        if (currentFingerprint !== previousFingerprint) {
          anomalies.push({
            type: 'NEW_DEVICE',
            severity: 'HIGH',
            details: {
              previousFingerprint,
              currentFingerprint,
            },
          });
        }
      }
    }

    // 3. Check for unusual time (outside normal hours)
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 22) {
      anomalies.push({
        type: 'UNUSUAL_TIME',
        severity: 'LOW',
        details: { hour: currentHour },
      });
    }

    // 4. Check for multiple simultaneous logins
    const activeSessions = await this.prisma.session.count({
      where: {
        userId,
        tenantId,
        isActive: true,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (activeSessions > 5) {
      anomalies.push({
        type: 'MULTIPLE_LOGINS',
        severity: 'MEDIUM',
        details: { activeSessions },
      });
    }

    // 5. Check for rapid session creation (potential attack)
    const recentSessionCount = await this.prisma.session.count({
      where: {
        userId,
        tenantId,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    });

    if (recentSessionCount > 10) {
      anomalies.push({
        type: 'RAPID_SESSION_CREATION',
        severity: 'CRITICAL',
        details: { recentSessionCount },
      });
    }

    // Create anomaly records
    for (const anomaly of anomalies) {
      await this.prisma.sessionAnomaly.create({
        data: {
          sessionId,
          userId,
          tenantId,
          anomalyType: anomaly.type,
          severity: anomaly.severity,
          details: anomaly.details,
          resolved: false,
        },
      });

      this.logger.warn(
        `Session anomaly detected: ${anomaly.type} (${anomaly.severity}) for session ${sessionId}`,
      );
    }
  }

  /**
   * Get anomalies for a session
   */
  async getSessionAnomalies(sessionId: string): Promise<any[]> {
    return this.prisma.sessionAnomaly.findMany({
      where: {
        sessionId,
        resolved: false,
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Resolve anomaly
   */
  async resolveAnomaly(anomalyId: string, userId: string, tenantId: string): Promise<void> {
    const anomaly = await this.prisma.sessionAnomaly.findFirst({
      where: {
        id: anomalyId,
        userId,
        tenantId,
      },
    });

    if (!anomaly) {
      return;
    }

    await this.prisma.sessionAnomaly.update({
      where: { id: anomalyId },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });

    this.logger.log(`Anomaly resolved: ${anomalyId}`);
  }

  /**
   * Generate device fingerprint
   */
  private generateDeviceFingerprint(deviceInfo: any): string {
    const components = [
      deviceInfo.userAgent || '',
      deviceInfo.acceptLanguage || '',
      deviceInfo.screenResolution || '',
      deviceInfo.timezone || '',
    ];

    return this.securityService.generateDeviceFingerprint({
      headers: {
        'user-agent': deviceInfo.userAgent,
        'accept-language': deviceInfo.acceptLanguage,
      },
    } as any);
  }
}

