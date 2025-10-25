import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';
import { AnalyticsService } from '../../services/analytics.service';

/**
 * User Analytics Service
 * 
 * Provides comprehensive user analytics and behavioral insights for the LexiScan AI platform.
 * Tracks user engagement, behavior patterns, feature adoption, and user journey analytics.
 * 
 * Key Features:
 * - User engagement tracking
 * - Behavioral pattern analysis
 * - Feature adoption metrics
 * - User journey mapping
 * - Retention and churn analysis
 * - User segmentation
 * 
 * @author LexiScan AI Team
 * @version 1.0.0
 * @since 2024-01-01
 */
@Injectable()
export class UserAnalyticsService {
  private readonly logger = new Logger(UserAnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly analytics: AnalyticsService,
  ) {}

  /**
   * Track user engagement
   * 
   * @param tenantId - Tenant identifier
   * @param userId - User identifier
   * @param engagementData - User engagement data
   * @returns Promise<void>
   */
  async trackUserEngagement(
    tenantId: string,
    userId: string,
    engagementData: {
      sessionId: string;
      pageViews: number;
      timeOnSite: number;
      actions: number;
      features: string[];
      documentsProcessed: number;
      apiCalls: number;
      lastActivity: Date;
    },
  ): Promise<void> {
    try {
      // Store engagement data
      await this.prisma.userEngagement.create({
        data: {
          tenantId,
          userId,
          sessionId: engagementData.sessionId,
          pageViews: engagementData.pageViews,
          timeOnSite: engagementData.timeOnSite,
          actions: engagementData.actions,
          features: engagementData.features,
          documentsProcessed: engagementData.documentsProcessed,
          apiCalls: engagementData.apiCalls,
          lastActivity: engagementData.lastActivity,
          timestamp: new Date(),
        },
      });

      // Track engagement analytics
      await this.analytics.track({
        tenantId,
        userId,
        event: 'user_engagement',
        category: 'user_behavior',
        properties: {
          sessionId: engagementData.sessionId,
          pageViews: engagementData.pageViews,
          timeOnSite: engagementData.timeOnSite,
          actions: engagementData.actions,
          features: engagementData.features,
          documentsProcessed: engagementData.documentsProcessed,
          apiCalls: engagementData.apiCalls,
        },
      });

      // Update user engagement metrics
      await this.updateUserEngagementMetrics(tenantId, userId, engagementData);

      this.logger.log(`User engagement tracked for user ${userId} in tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to track user engagement: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Track user behavior patterns
   * 
   * @param tenantId - Tenant identifier
   * @param userId - User identifier
   * @param behaviorData - User behavior data
   * @returns Promise<void>
   */
  async trackUserBehavior(
    tenantId: string,
    userId: string,
    behaviorData: {
      action: string;
      context: string;
      duration: number;
      success: boolean;
      errorMessage?: string;
      deviceInfo: {
        userAgent: string;
        platform: string;
        browser: string;
        version: string;
      };
      location?: {
        country: string;
        region: string;
        city: string;
        timezone: string;
      };
    },
  ): Promise<void> {
    try {
      // Store behavior data
      await this.prisma.userBehavior.create({
        data: {
          tenantId,
          userId,
          action: behaviorData.action,
          context: behaviorData.context,
          duration: behaviorData.duration,
          success: behaviorData.success,
          errorMessage: behaviorData.errorMessage,
          deviceInfo: behaviorData.deviceInfo,
          location: behaviorData.location,
          timestamp: new Date(),
        },
      });

      // Track behavior analytics
      await this.analytics.track({
        tenantId,
        userId,
        event: 'user_behavior',
        category: 'user_behavior',
        properties: {
          action: behaviorData.action,
          context: behaviorData.context,
          duration: behaviorData.duration,
          success: behaviorData.success,
          platform: behaviorData.deviceInfo.platform,
          browser: behaviorData.deviceInfo.browser,
        },
      });

      // Update behavior pattern metrics
      await this.updateBehaviorPatternMetrics(tenantId, userId, behaviorData);

      this.logger.log(`User behavior tracked: ${behaviorData.action} for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to track user behavior: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Track feature adoption
   * 
   * @param tenantId - Tenant identifier
   * @param userId - User identifier
   * @param featureData - Feature adoption data
   * @returns Promise<void>
   */
  async trackFeatureAdoption(
    tenantId: string,
    userId: string,
    featureData: {
      feature: string;
      version: string;
      adoptionStage: 'discovery' | 'trial' | 'adoption' | 'mastery';
      timeToAdoption: number;
      usageFrequency: number;
      satisfaction: number;
      feedback?: string;
    },
  ): Promise<void> {
    try {
      // Store feature adoption data
      await this.prisma.featureAdoption.create({
        data: {
          tenantId,
          userId,
          feature: featureData.feature,
          version: featureData.version,
          adoptionStage: featureData.adoptionStage,
          timeToAdoption: featureData.timeToAdoption,
          usageFrequency: featureData.usageFrequency,
          satisfaction: featureData.satisfaction,
          feedback: featureData.feedback,
          timestamp: new Date(),
        },
      });

      // Track feature adoption analytics
      await this.analytics.track({
        tenantId,
        userId,
        event: 'feature_adoption',
        category: 'feature_adoption',
        properties: {
          feature: featureData.feature,
          version: featureData.version,
          adoptionStage: featureData.adoptionStage,
          timeToAdoption: featureData.timeToAdoption,
          usageFrequency: featureData.usageFrequency,
          satisfaction: featureData.satisfaction,
        },
      });

      // Update feature adoption metrics
      await this.updateFeatureAdoptionMetrics(tenantId, featureData.feature);

      this.logger.log(`Feature adoption tracked: ${featureData.feature} for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to track feature adoption: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Track user journey
   * 
   * @param tenantId - Tenant identifier
   * @param userId - User identifier
   * @param journeyData - User journey data
   * @returns Promise<void>
   */
  async trackUserJourney(
    tenantId: string,
    userId: string,
    journeyData: {
      journeyId: string;
      stage: string;
      step: number;
      action: string;
      duration: number;
      success: boolean;
      nextStage?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<void> {
    try {
      // Store journey data
      await this.prisma.userJourney.create({
        data: {
          tenantId,
          userId,
          journeyId: journeyData.journeyId,
          stage: journeyData.stage,
          step: journeyData.step,
          action: journeyData.action,
          duration: journeyData.duration,
          success: journeyData.success,
          nextStage: journeyData.nextStage,
          metadata: journeyData.metadata,
          timestamp: new Date(),
        },
      });

      // Track journey analytics
      await this.analytics.track({
        tenantId,
        userId,
        event: 'user_journey',
        category: 'user_journey',
        properties: {
          journeyId: journeyData.journeyId,
          stage: journeyData.stage,
          step: journeyData.step,
          action: journeyData.action,
          duration: journeyData.duration,
          success: journeyData.success,
          nextStage: journeyData.nextStage,
        },
      });

      // Update journey metrics
      await this.updateJourneyMetrics(tenantId, journeyData.journeyId);

      this.logger.log(`User journey tracked: ${journeyData.stage} for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to track user journey: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get user engagement analytics
   * 
   * @param tenantId - Tenant identifier
   * @param startDate - Start date for analytics
   * @param endDate - End date for analytics
   * @returns Promise<UserEngagementAnalytics>
   */
  async getUserEngagementAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalUsers: number;
    activeUsers: number;
    engagedUsers: number;
    averageSessionDuration: number;
    averagePageViews: number;
    averageActions: number;
    engagementRate: number;
    userSegments: Array<{
      segment: string;
      count: number;
      percentage: number;
      characteristics: string[];
    }>;
    engagementTrend: Array<{
      period: string;
      activeUsers: number;
      engagedUsers: number;
      engagementRate: number;
    }>;
    topFeatures: Array<{
      feature: string;
      users: number;
      usage: number;
      adoptionRate: number;
    }>;
  }> {
    try {
      const cacheKey = `user_engagement_analytics:${tenantId}:${startDate.toISOString()}:${endDate.toISOString()}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Get user engagement data
      const userEngagement = await this.prisma.userEngagement.findMany({
        where: {
          tenantId,
          timestamp: { gte: startDate, lte: endDate },
        },
      });

      // Get unique users
      const uniqueUsers = await this.prisma.userEngagement.findMany({
        where: {
          tenantId,
          timestamp: { gte: startDate, lte: endDate },
        },
        distinct: ['userId'],
      });

      // Calculate engagement metrics
      const totalUsers = uniqueUsers.length;
      const activeUsers = userEngagement.length;
      const engagedUsers = userEngagement.filter(engagement => engagement.actions > 5).length;
      const averageSessionDuration = userEngagement.reduce((sum, engagement) => sum + engagement.timeOnSite, 0) / activeUsers;
      const averagePageViews = userEngagement.reduce((sum, engagement) => sum + engagement.pageViews, 0) / activeUsers;
      const averageActions = userEngagement.reduce((sum, engagement) => sum + engagement.actions, 0) / activeUsers;
      const engagementRate = (engagedUsers / totalUsers) * 100;

      // Calculate user segments
      const userSegments = this.calculateUserSegments(userEngagement);

      // Calculate engagement trend
      const engagementTrend = this.calculateEngagementTrend(userEngagement);

      // Calculate top features
      const topFeatures = this.calculateTopFeatures(userEngagement);

      const analytics = {
        totalUsers,
        activeUsers,
        engagedUsers,
        averageSessionDuration,
        averagePageViews,
        averageActions,
        engagementRate,
        userSegments,
        engagementTrend,
        topFeatures,
      };

      // Cache for 1 hour
      await this.cache.set(cacheKey, JSON.stringify(analytics), 3600);

      return analytics;
    } catch (error) {
      this.logger.error(`Failed to get user engagement analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get user behavior analytics
   * 
   * @param tenantId - Tenant identifier
   * @param startDate - Start date for analytics
   * @param endDate - End date for analytics
   * @returns Promise<UserBehaviorAnalytics>
   */
  async getUserBehaviorAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    successRate: number;
    averageActionDuration: number;
    behaviorPatterns: Array<{
      pattern: string;
      frequency: number;
      users: number;
      successRate: number;
    }>;
    actionDistribution: Array<{
      action: string;
      count: number;
      percentage: number;
      averageDuration: number;
    }>;
    deviceAnalytics: Array<{
      platform: string;
      browser: string;
      users: number;
      actions: number;
      successRate: number;
    }>;
    locationAnalytics: Array<{
      country: string;
      region: string;
      users: number;
      actions: number;
      successRate: number;
    }>;
  }> {
    try {
      const cacheKey = `user_behavior_analytics:${tenantId}:${startDate.toISOString()}:${endDate.toISOString()}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Get user behavior data
      const userBehavior = await this.prisma.userBehavior.findMany({
        where: {
          tenantId,
          timestamp: { gte: startDate, lte: endDate },
        },
      });

      // Calculate behavior metrics
      const totalActions = userBehavior.length;
      const successfulActions = userBehavior.filter(behavior => behavior.success).length;
      const failedActions = totalActions - successfulActions;
      const successRate = (successfulActions / totalActions) * 100;
      const averageActionDuration = userBehavior.reduce((sum, behavior) => sum + behavior.duration, 0) / totalActions;

      // Calculate behavior patterns
      const behaviorPatterns = this.calculateBehaviorPatterns(userBehavior);

      // Calculate action distribution
      const actionDistribution = this.calculateActionDistribution(userBehavior);

      // Calculate device analytics
      const deviceAnalytics = this.calculateDeviceAnalytics(userBehavior);

      // Calculate location analytics
      const locationAnalytics = this.calculateLocationAnalytics(userBehavior);

      const analytics = {
        totalActions,
        successfulActions,
        failedActions,
        successRate,
        averageActionDuration,
        behaviorPatterns,
        actionDistribution,
        deviceAnalytics,
        locationAnalytics,
      };

      // Cache for 1 hour
      await this.cache.set(cacheKey, JSON.stringify(analytics), 3600);

      return analytics;
    } catch (error) {
      this.logger.error(`Failed to get user behavior analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get feature adoption analytics
   * 
   * @param tenantId - Tenant identifier
   * @param startDate - Start date for analytics
   * @param endDate - End date for analytics
   * @returns Promise<FeatureAdoptionAnalytics>
   */
  async getFeatureAdoptionAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalFeatures: number;
    adoptedFeatures: number;
    adoptionRate: number;
    averageTimeToAdoption: number;
    featureAdoptionStages: Array<{
      stage: string;
      count: number;
      percentage: number;
    }>;
    featurePerformance: Array<{
      feature: string;
      users: number;
      adoptionRate: number;
      satisfaction: number;
      usageFrequency: number;
    }>;
    adoptionTrend: Array<{
      period: string;
      newAdoptions: number;
      totalAdoptions: number;
      adoptionRate: number;
    }>;
  }> {
    try {
      const cacheKey = `feature_adoption_analytics:${tenantId}:${startDate.toISOString()}:${endDate.toISOString()}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Get feature adoption data
      const featureAdoption = await this.prisma.featureAdoption.findMany({
        where: {
          tenantId,
          timestamp: { gte: startDate, lte: endDate },
        },
      });

      // Calculate adoption metrics
      const totalFeatures = new Set(featureAdoption.map(adoption => adoption.feature)).size;
      const adoptedFeatures = featureAdoption.length;
      const adoptionRate = (adoptedFeatures / totalFeatures) * 100;
      const averageTimeToAdoption = featureAdoption.reduce((sum, adoption) => sum + adoption.timeToAdoption, 0) / adoptedFeatures;

      // Calculate adoption stages
      const featureAdoptionStages = this.calculateAdoptionStages(featureAdoption);

      // Calculate feature performance
      const featurePerformance = this.calculateFeaturePerformance(featureAdoption);

      // Calculate adoption trend
      const adoptionTrend = this.calculateAdoptionTrend(featureAdoption);

      const analytics = {
        totalFeatures,
        adoptedFeatures,
        adoptionRate,
        averageTimeToAdoption,
        featureAdoptionStages,
        featurePerformance,
        adoptionTrend,
      };

      // Cache for 1 hour
      await this.cache.set(cacheKey, JSON.stringify(analytics), 3600);

      return analytics;
    } catch (error) {
      this.logger.error(`Failed to get feature adoption analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get user journey analytics
   * 
   * @param tenantId - Tenant identifier
   * @param startDate - Start date for analytics
   * @param endDate - End date for analytics
   * @returns Promise<UserJourneyAnalytics>
   */
  async getUserJourneyAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalJourneys: number;
    completedJourneys: number;
    completionRate: number;
    averageJourneyDuration: number;
    journeyStages: Array<{
      stage: string;
      users: number;
      completionRate: number;
      averageDuration: number;
    }>;
    journeyPaths: Array<{
      path: string;
      users: number;
      completionRate: number;
      averageDuration: number;
    }>;
    dropOffPoints: Array<{
      stage: string;
      dropOffs: number;
      dropOffRate: number;
      reasons: string[];
    }>;
  }> {
    try {
      const cacheKey = `user_journey_analytics:${tenantId}:${startDate.toISOString()}:${endDate.toISOString()}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Get user journey data
      const userJourneys = await this.prisma.userJourney.findMany({
        where: {
          tenantId,
          timestamp: { gte: startDate, lte: endDate },
        },
      });

      // Calculate journey metrics
      const totalJourneys = new Set(userJourneys.map(journey => journey.journeyId)).size;
      const completedJourneys = userJourneys.filter(journey => journey.success).length;
      const completionRate = (completedJourneys / totalJourneys) * 100;
      const averageJourneyDuration = userJourneys.reduce((sum, journey) => sum + journey.duration, 0) / totalJourneys;

      // Calculate journey stages
      const journeyStages = this.calculateJourneyStages(userJourneys);

      // Calculate journey paths
      const journeyPaths = this.calculateJourneyPaths(userJourneys);

      // Calculate drop-off points
      const dropOffPoints = this.calculateDropOffPoints(userJourneys);

      const analytics = {
        totalJourneys,
        completedJourneys,
        completionRate,
        averageJourneyDuration,
        journeyStages,
        journeyPaths,
        dropOffPoints,
      };

      // Cache for 1 hour
      await this.cache.set(cacheKey, JSON.stringify(analytics), 3600);

      return analytics;
    } catch (error) {
      this.logger.error(`Failed to get user journey analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update user engagement metrics cache
   * 
   * @param tenantId - Tenant identifier
   * @param userId - User identifier
   * @param engagementData - Engagement data
   * @returns Promise<void>
   */
  private async updateUserEngagementMetrics(tenantId: string, userId: string, engagementData: any): Promise<void> {
    try {
      const cacheKey = `user_engagement_analytics:${tenantId}`;
      await this.cache.del(cacheKey);
    } catch (error) {
      this.logger.error(`Failed to update user engagement metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Update behavior pattern metrics cache
   * 
   * @param tenantId - Tenant identifier
   * @param userId - User identifier
   * @param behaviorData - Behavior data
   * @returns Promise<void>
   */
  private async updateBehaviorPatternMetrics(tenantId: string, userId: string, behaviorData: any): Promise<void> {
    try {
      const cacheKey = `user_behavior_analytics:${tenantId}`;
      await this.cache.del(cacheKey);
    } catch (error) {
      this.logger.error(`Failed to update behavior pattern metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Update feature adoption metrics cache
   * 
   * @param tenantId - Tenant identifier
   * @param feature - Feature name
   * @returns Promise<void>
   */
  private async updateFeatureAdoptionMetrics(tenantId: string, feature: string): Promise<void> {
    try {
      const cacheKey = `feature_adoption_analytics:${tenantId}`;
      await this.cache.del(cacheKey);
    } catch (error) {
      this.logger.error(`Failed to update feature adoption metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Update journey metrics cache
   * 
   * @param tenantId - Tenant identifier
   * @param journeyId - Journey identifier
   * @returns Promise<void>
   */
  private async updateJourneyMetrics(tenantId: string, journeyId: string): Promise<void> {
    try {
      const cacheKey = `user_journey_analytics:${tenantId}`;
      await this.cache.del(cacheKey);
    } catch (error) {
      this.logger.error(`Failed to update journey metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Calculate user segments
   * 
   * @param userEngagement - User engagement data
   * @returns User segments
   */
  private calculateUserSegments(userEngagement: any[]): Array<{
    segment: string;
    count: number;
    percentage: number;
    characteristics: string[];
  }> {
    const segments = new Map<string, { count: number; characteristics: string[] }>();
    const totalUsers = userEngagement.length;

    userEngagement.forEach(engagement => {
      let segment = 'low_engagement';
      const characteristics = [];

      if (engagement.actions > 20 && engagement.timeOnSite > 1800) {
        segment = 'high_engagement';
        characteristics.push('high_actions', 'long_sessions');
      } else if (engagement.actions > 10 && engagement.timeOnSite > 900) {
        segment = 'medium_engagement';
        characteristics.push('medium_actions', 'medium_sessions');
      } else {
        characteristics.push('low_actions', 'short_sessions');
      }

      if (engagement.documentsProcessed > 10) {
        characteristics.push('heavy_document_user');
      }

      if (engagement.apiCalls > 50) {
        characteristics.push('api_heavy_user');
      }

      const current = segments.get(segment) || { count: 0, characteristics: [] };
      segments.set(segment, {
        count: current.count + 1,
        characteristics: [...new Set([...current.characteristics, ...characteristics])],
      });
    });

    return Array.from(segments.entries()).map(([segment, data]) => ({
      segment,
      count: data.count,
      percentage: (data.count / totalUsers) * 100,
      characteristics: data.characteristics,
    }));
  }

  /**
   * Calculate engagement trend
   * 
   * @param userEngagement - User engagement data
   * @returns Engagement trend
   */
  private calculateEngagementTrend(userEngagement: any[]): Array<{
    period: string;
    activeUsers: number;
    engagedUsers: number;
    engagementRate: number;
  }> {
    // Group by day
    const dailyEngagement = new Map<string, { activeUsers: Set<string>; engagedUsers: Set<string> }>();
    
    userEngagement.forEach(engagement => {
      const day = engagement.timestamp.toISOString().substring(0, 10);
      if (!dailyEngagement.has(day)) {
        dailyEngagement.set(day, { activeUsers: new Set(), engagedUsers: new Set() });
      }
      
      const dayData = dailyEngagement.get(day);
      dayData.activeUsers.add(engagement.userId);
      
      if (engagement.actions > 5) {
        dayData.engagedUsers.add(engagement.userId);
      }
    });

    return Array.from(dailyEngagement.entries())
      .map(([period, data]) => ({
        period,
        activeUsers: data.activeUsers.size,
        engagedUsers: data.engagedUsers.size,
        engagementRate: data.activeUsers.size > 0 
          ? (data.engagedUsers.size / data.activeUsers.size) * 100 
          : 0,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Calculate top features
   * 
   * @param userEngagement - User engagement data
   * @returns Top features
   */
  private calculateTopFeatures(userEngagement: any[]): Array<{
    feature: string;
    users: number;
    usage: number;
    adoptionRate: number;
  }> {
    const featureMap = new Map<string, { users: Set<string>; usage: number }>();
    
    userEngagement.forEach(engagement => {
      engagement.features.forEach(feature => {
        if (!featureMap.has(feature)) {
          featureMap.set(feature, { users: new Set(), usage: 0 });
        }
        
        const featureData = featureMap.get(feature);
        featureData.users.add(engagement.userId);
        featureData.usage += 1;
      });
    });

    return Array.from(featureMap.entries())
      .map(([feature, data]) => ({
        feature,
        users: data.users.size,
        usage: data.usage,
        adoptionRate: (data.users.size / userEngagement.length) * 100,
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);
  }

  /**
   * Calculate behavior patterns
   * 
   * @param userBehavior - User behavior data
   * @returns Behavior patterns
   */
  private calculateBehaviorPatterns(userBehavior: any[]): Array<{
    pattern: string;
    frequency: number;
    users: number;
    successRate: number;
  }> {
    const patternMap = new Map<string, { frequency: number; users: Set<string>; successes: number }>();
    
    userBehavior.forEach(behavior => {
      const pattern = `${behavior.action}_${behavior.context}`;
      if (!patternMap.has(pattern)) {
        patternMap.set(pattern, { frequency: 0, users: new Set(), successes: 0 });
      }
      
      const patternData = patternMap.get(pattern);
      patternData.frequency += 1;
      patternData.users.add(behavior.userId);
      if (behavior.success) {
        patternData.successes += 1;
      }
    });

    return Array.from(patternMap.entries())
      .map(([pattern, data]) => ({
        pattern,
        frequency: data.frequency,
        users: data.users.size,
        successRate: (data.successes / data.frequency) * 100,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  /**
   * Calculate action distribution
   * 
   * @param userBehavior - User behavior data
   * @returns Action distribution
   */
  private calculateActionDistribution(userBehavior: any[]): Array<{
    action: string;
    count: number;
    percentage: number;
    averageDuration: number;
  }> {
    const actionMap = new Map<string, { count: number; totalDuration: number }>();
    
    userBehavior.forEach(behavior => {
      if (!actionMap.has(behavior.action)) {
        actionMap.set(behavior.action, { count: 0, totalDuration: 0 });
      }
      
      const actionData = actionMap.get(behavior.action);
      actionData.count += 1;
      actionData.totalDuration += behavior.duration;
    });

    const totalActions = userBehavior.length;

    return Array.from(actionMap.entries())
      .map(([action, data]) => ({
        action,
        count: data.count,
        percentage: (data.count / totalActions) * 100,
        averageDuration: data.totalDuration / data.count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate device analytics
   * 
   * @param userBehavior - User behavior data
   * @returns Device analytics
   */
  private calculateDeviceAnalytics(userBehavior: any[]): Array<{
    platform: string;
    browser: string;
    users: number;
    actions: number;
    successRate: number;
  }> {
    const deviceMap = new Map<string, { users: Set<string>; actions: number; successes: number }>();
    
    userBehavior.forEach(behavior => {
      const key = `${behavior.deviceInfo.platform}_${behavior.deviceInfo.browser}`;
      if (!deviceMap.has(key)) {
        deviceMap.set(key, { users: new Set(), actions: 0, successes: 0 });
      }
      
      const deviceData = deviceMap.get(key);
      deviceData.users.add(behavior.userId);
      deviceData.actions += 1;
      if (behavior.success) {
        deviceData.successes += 1;
      }
    });

    return Array.from(deviceMap.entries())
      .map(([key, data]) => {
        const [platform, browser] = key.split('_');
        return {
          platform,
          browser,
          users: data.users.size,
          actions: data.actions,
          successRate: (data.successes / data.actions) * 100,
        };
      })
      .sort((a, b) => b.actions - a.actions);
  }

  /**
   * Calculate location analytics
   * 
   * @param userBehavior - User behavior data
   * @returns Location analytics
   */
  private calculateLocationAnalytics(userBehavior: any[]): Array<{
    country: string;
    region: string;
    users: number;
    actions: number;
    successRate: number;
  }> {
    const locationMap = new Map<string, { users: Set<string>; actions: number; successes: number }>();
    
    userBehavior.forEach(behavior => {
      if (behavior.location) {
        const key = `${behavior.location.country}_${behavior.location.region}`;
        if (!locationMap.has(key)) {
          locationMap.set(key, { users: new Set(), actions: 0, successes: 0 });
        }
        
        const locationData = locationMap.get(key);
        locationData.users.add(behavior.userId);
        locationData.actions += 1;
        if (behavior.success) {
          locationData.successes += 1;
        }
      }
    });

    return Array.from(locationMap.entries())
      .map(([key, data]) => {
        const [country, region] = key.split('_');
        return {
          country,
          region,
          users: data.users.size,
          actions: data.actions,
          successRate: (data.successes / data.actions) * 100,
        };
      })
      .sort((a, b) => b.actions - a.actions);
  }

  /**
   * Calculate adoption stages
   * 
   * @param featureAdoption - Feature adoption data
   * @returns Adoption stages
   */
  private calculateAdoptionStages(featureAdoption: any[]): Array<{
    stage: string;
    count: number;
    percentage: number;
  }> {
    const stageMap = new Map<string, number>();
    const totalAdoptions = featureAdoption.length;

    featureAdoption.forEach(adoption => {
      const current = stageMap.get(adoption.adoptionStage) || 0;
      stageMap.set(adoption.adoptionStage, current + 1);
    });

    return Array.from(stageMap.entries())
      .map(([stage, count]) => ({
        stage,
        count,
        percentage: (count / totalAdoptions) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate feature performance
   * 
   * @param featureAdoption - Feature adoption data
   * @returns Feature performance
   */
  private calculateFeaturePerformance(featureAdoption: any[]): Array<{
    feature: string;
    users: number;
    adoptionRate: number;
    satisfaction: number;
    usageFrequency: number;
  }> {
    const featureMap = new Map<string, { users: Set<string>; satisfaction: number[]; usageFrequency: number[] }>();
    
    featureAdoption.forEach(adoption => {
      if (!featureMap.has(adoption.feature)) {
        featureMap.set(adoption.feature, { users: new Set(), satisfaction: [], usageFrequency: [] });
      }
      
      const featureData = featureMap.get(adoption.feature);
      featureData.users.add(adoption.userId);
      featureData.satisfaction.push(adoption.satisfaction);
      featureData.usageFrequency.push(adoption.usageFrequency);
    });

    return Array.from(featureMap.entries())
      .map(([feature, data]) => ({
        feature,
        users: data.users.size,
        adoptionRate: (data.users.size / featureAdoption.length) * 100,
        satisfaction: data.satisfaction.reduce((sum, s) => sum + s, 0) / data.satisfaction.length,
        usageFrequency: data.usageFrequency.reduce((sum, f) => sum + f, 0) / data.usageFrequency.length,
      }))
      .sort((a, b) => b.users - a.users);
  }

  /**
   * Calculate adoption trend
   * 
   * @param featureAdoption - Feature adoption data
   * @returns Adoption trend
   */
  private calculateAdoptionTrend(featureAdoption: any[]): Array<{
    period: string;
    newAdoptions: number;
    totalAdoptions: number;
    adoptionRate: number;
  }> {
    // Group by month
    const monthlyAdoptions = new Map<string, number>();
    
    featureAdoption.forEach(adoption => {
      const month = adoption.timestamp.toISOString().substring(0, 7);
      const current = monthlyAdoptions.get(month) || 0;
      monthlyAdoptions.set(month, current + 1);
    });

    const sortedMonths = Array.from(monthlyAdoptions.entries()).sort();
    let totalAdoptions = 0;

    return sortedMonths.map(([period, newAdoptions]) => {
      totalAdoptions += newAdoptions;
      return {
        period,
        newAdoptions,
        totalAdoptions,
        adoptionRate: (newAdoptions / totalAdoptions) * 100,
      };
    });
  }

  /**
   * Calculate journey stages
   * 
   * @param userJourneys - User journey data
   * @returns Journey stages
   */
  private calculateJourneyStages(userJourneys: any[]): Array<{
    stage: string;
    users: number;
    completionRate: number;
    averageDuration: number;
  }> {
    const stageMap = new Map<string, { users: Set<string>; completions: number; totalDuration: number }>();
    
    userJourneys.forEach(journey => {
      if (!stageMap.has(journey.stage)) {
        stageMap.set(journey.stage, { users: new Set(), completions: 0, totalDuration: 0 });
      }
      
      const stageData = stageMap.get(journey.stage);
      stageData.users.add(journey.userId);
      stageData.totalDuration += journey.duration;
      if (journey.success) {
        stageData.completions += 1;
      }
    });

    return Array.from(stageMap.entries())
      .map(([stage, data]) => ({
        stage,
        users: data.users.size,
        completionRate: (data.completions / data.users.size) * 100,
        averageDuration: data.totalDuration / data.users.size,
      }))
      .sort((a, b) => b.users - a.users);
  }

  /**
   * Calculate journey paths
   * 
   * @param userJourneys - User journey data
   * @returns Journey paths
   */
  private calculateJourneyPaths(userJourneys: any[]): Array<{
    path: string;
    users: number;
    completionRate: number;
    averageDuration: number;
  }> {
    // Group by journey ID and calculate paths
    const journeyMap = new Map<string, { users: Set<string>; completions: number; totalDuration: number }>();
    
    userJourneys.forEach(journey => {
      if (!journeyMap.has(journey.journeyId)) {
        journeyMap.set(journey.journeyId, { users: new Set(), completions: 0, totalDuration: 0 });
      }
      
      const journeyData = journeyMap.get(journey.journeyId);
      journeyData.users.add(journey.userId);
      journeyData.totalDuration += journey.duration;
      if (journey.success) {
        journeyData.completions += 1;
      }
    });

    return Array.from(journeyMap.entries())
      .map(([journeyId, data]) => ({
        path: journeyId,
        users: data.users.size,
        completionRate: (data.completions / data.users.size) * 100,
        averageDuration: data.totalDuration / data.users.size,
      }))
      .sort((a, b) => b.users - a.users);
  }

  /**
   * Calculate drop-off points
   * 
   * @param userJourneys - User journey data
   * @returns Drop-off points
   */
  private calculateDropOffPoints(userJourneys: any[]): Array<{
    stage: string;
    dropOffs: number;
    dropOffRate: number;
    reasons: string[];
  }> {
    const stageMap = new Map<string, { total: number; dropOffs: number; reasons: string[] }>();
    
    userJourneys.forEach(journey => {
      if (!stageMap.has(journey.stage)) {
        stageMap.set(journey.stage, { total: 0, dropOffs: 0, reasons: [] });
      }
      
      const stageData = stageMap.get(journey.stage);
      stageData.total += 1;
      if (!journey.success) {
        stageData.dropOffs += 1;
        if (journey.errorMessage) {
          stageData.reasons.push(journey.errorMessage);
        }
      }
    });

    return Array.from(stageMap.entries())
      .map(([stage, data]) => ({
        stage,
        dropOffs: data.dropOffs,
        dropOffRate: (data.dropOffs / data.total) * 100,
        reasons: [...new Set(data.reasons)],
      }))
      .sort((a, b) => b.dropOffs - a.dropOffs);
  }
}
