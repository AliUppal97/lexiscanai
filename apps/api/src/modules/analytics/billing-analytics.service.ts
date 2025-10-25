import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';
import { AnalyticsService } from '../../services/analytics.service';

/**
 * Billing Analytics Service
 * 
 * Provides comprehensive billing analytics and financial insights for the LexiScan AI platform.
 * Tracks revenue, subscription metrics, payment patterns, and financial performance.
 * 
 * Key Features:
 * - Revenue tracking and forecasting
 * - Subscription analytics
 * - Payment pattern analysis
 * - Customer lifetime value (CLV)
 * - Churn prediction and analysis
 * - Financial performance metrics
 * 
 * @author LexiScan AI Team
 * @version 1.0.0
 * @since 2024-01-01
 */
@Injectable()
export class BillingAnalyticsService {
  private readonly logger = new Logger(BillingAnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly analytics: AnalyticsService,
  ) {}

  /**
   * Track revenue events
   * 
   * @param tenantId - Tenant identifier
   * @param revenueData - Revenue event data
   * @returns Promise<void>
   */
  async trackRevenue(
    tenantId: string,
    revenueData: {
      subscriptionId: string;
      amount: number;
      currency: string;
      revenueType: 'subscription' | 'usage' | 'addon' | 'refund';
      paymentMethod: string;
      success: boolean;
      timestamp: Date;
    },
  ): Promise<void> {
    try {
      // Store revenue data
      await this.prisma.revenueEvent.create({
        data: {
          tenantId,
          subscriptionId: revenueData.subscriptionId,
          amount: revenueData.amount,
          currency: revenueData.currency,
          revenueType: revenueData.revenueType,
          paymentMethod: revenueData.paymentMethod,
          success: revenueData.success,
          timestamp: revenueData.timestamp,
        },
      });

      // Track revenue analytics
      await this.analytics.track({
        tenantId,
        userId: null,
        event: 'revenue_event',
        category: 'billing',
        properties: {
          subscriptionId: revenueData.subscriptionId,
          amount: revenueData.amount,
          currency: revenueData.currency,
          revenueType: revenueData.revenueType,
          paymentMethod: revenueData.paymentMethod,
          success: revenueData.success,
        },
      });

      // Update revenue metrics
      await this.updateRevenueMetrics(tenantId, revenueData);

      this.logger.log(`Revenue tracked: ${revenueData.amount} ${revenueData.currency} for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to track revenue: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Track subscription events
   * 
   * @param tenantId - Tenant identifier
   * @param subscriptionData - Subscription event data
   * @returns Promise<void>
   */
  async trackSubscriptionEvent(
    tenantId: string,
    subscriptionData: {
      subscriptionId: string;
      eventType: 'created' | 'updated' | 'cancelled' | 'renewed' | 'expired';
      planId: string;
      planName: string;
      amount: number;
      currency: string;
      billingCycle: 'monthly' | 'yearly';
      status: 'active' | 'cancelled' | 'expired' | 'suspended';
      timestamp: Date;
    },
  ): Promise<void> {
    try {
      // Store subscription event data
      await this.prisma.subscriptionEvent.create({
        data: {
          tenantId,
          subscriptionId: subscriptionData.subscriptionId,
          eventType: subscriptionData.eventType,
          planId: subscriptionData.planId,
          planName: subscriptionData.planName,
          amount: subscriptionData.amount,
          currency: subscriptionData.currency,
          billingCycle: subscriptionData.billingCycle,
          status: subscriptionData.status,
          timestamp: subscriptionData.timestamp,
        },
      });

      // Track subscription analytics
      await this.analytics.track({
        tenantId,
        userId: null,
        event: 'subscription_event',
        category: 'billing',
        properties: {
          subscriptionId: subscriptionData.subscriptionId,
          eventType: subscriptionData.eventType,
          planId: subscriptionData.planId,
          planName: subscriptionData.planName,
          amount: subscriptionData.amount,
          currency: subscriptionData.currency,
          billingCycle: subscriptionData.billingCycle,
          status: subscriptionData.status,
        },
      });

      // Update subscription metrics
      await this.updateSubscriptionMetrics(tenantId, subscriptionData);

      this.logger.log(`Subscription event tracked: ${subscriptionData.eventType} for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to track subscription event: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get revenue analytics for a tenant
   * 
   * @param tenantId - Tenant identifier
   * @param startDate - Start date for analytics
   * @param endDate - End date for analytics
   * @returns Promise<RevenueAnalytics>
   */
  async getRevenueAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    annualRecurringRevenue: number;
    revenueGrowth: number;
    revenueByType: Array<{
      type: string;
      amount: number;
      percentage: number;
    }>;
    revenueByPlan: Array<{
      planId: string;
      planName: string;
      amount: number;
      percentage: number;
    }>;
    revenueTrend: Array<{
      period: string;
      revenue: number;
      growth: number;
    }>;
    paymentMethods: Array<{
      method: string;
      amount: number;
      percentage: number;
    }>;
  }> {
    try {
      const cacheKey = `revenue_analytics:${tenantId}:${startDate.toISOString()}:${endDate.toISOString()}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Get revenue events
      const revenueEvents = await this.prisma.revenueEvent.findMany({
        where: {
          tenantId,
          timestamp: { gte: startDate, lte: endDate },
          success: true,
        },
      });

      // Get subscription events
      const subscriptionEvents = await this.prisma.subscriptionEvent.findMany({
        where: {
          tenantId,
          timestamp: { gte: startDate, lte: endDate },
        },
      });

      // Calculate total revenue
      const totalRevenue = revenueEvents.reduce((sum, event) => sum + event.amount, 0);

      // Calculate MRR and ARR
      const monthlyRecurringRevenue = this.calculateMRR(subscriptionEvents);
      const annualRecurringRevenue = monthlyRecurringRevenue * 12;

      // Calculate revenue growth
      const previousPeriodRevenue = await this.getPreviousPeriodRevenue(tenantId, startDate, endDate);
      const revenueGrowth = previousPeriodRevenue > 0 
        ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
        : 0;

      // Calculate revenue by type
      const revenueByType = this.calculateRevenueByType(revenueEvents);

      // Calculate revenue by plan
      const revenueByPlan = this.calculateRevenueByPlan(subscriptionEvents);

      // Calculate revenue trend
      const revenueTrend = this.calculateRevenueTrend(revenueEvents);

      // Calculate payment methods
      const paymentMethods = this.calculatePaymentMethods(revenueEvents);

      const analytics = {
        totalRevenue,
        monthlyRecurringRevenue,
        annualRecurringRevenue,
        revenueGrowth,
        revenueByType,
        revenueByPlan,
        revenueTrend,
        paymentMethods,
      };

      // Cache for 1 hour
      await this.cache.set(cacheKey, JSON.stringify(analytics), 3600);

      return analytics;
    } catch (error) {
      this.logger.error(`Failed to get revenue analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get subscription analytics for a tenant
   * 
   * @param tenantId - Tenant identifier
   * @param startDate - Start date for analytics
   * @param endDate - End date for analytics
   * @returns Promise<SubscriptionAnalytics>
   */
  async getSubscriptionAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    newSubscriptions: number;
    churnRate: number;
    retentionRate: number;
    averageRevenuePerUser: number;
    customerLifetimeValue: number;
    subscriptionDistribution: Array<{
      planId: string;
      planName: string;
      count: number;
      percentage: number;
    }>;
    churnAnalysis: Array<{
      reason: string;
      count: number;
      percentage: number;
    }>;
    retentionCohorts: Array<{
      cohort: string;
      users: number;
      retention: Array<{
        period: number;
        rate: number;
      }>;
    }>;
  }> {
    try {
      const cacheKey = `subscription_analytics:${tenantId}:${startDate.toISOString()}:${endDate.toISOString()}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Get subscription events
      const subscriptionEvents = await this.prisma.subscriptionEvent.findMany({
        where: {
          tenantId,
          timestamp: { gte: startDate, lte: endDate },
        },
      });

      // Get current subscriptions
      const currentSubscriptions = await this.prisma.subscription.findMany({
        where: { tenantId },
      });

      // Calculate subscription metrics
      const totalSubscriptions = subscriptionEvents.filter(e => e.eventType === 'created').length;
      const activeSubscriptions = currentSubscriptions.filter(s => s.status === 'active').length;
      const cancelledSubscriptions = subscriptionEvents.filter(e => e.eventType === 'cancelled').length;
      const newSubscriptions = subscriptionEvents.filter(e => e.eventType === 'created').length;

      // Calculate churn rate
      const churnRate = totalSubscriptions > 0 ? (cancelledSubscriptions / totalSubscriptions) * 100 : 0;
      const retentionRate = 100 - churnRate;

      // Calculate ARPU
      const totalRevenue = subscriptionEvents.reduce((sum, event) => sum + event.amount, 0);
      const averageRevenuePerUser = activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0;

      // Calculate CLV
      const customerLifetimeValue = this.calculateCLV(activeSubscriptions, averageRevenuePerUser, churnRate);

      // Calculate subscription distribution
      const subscriptionDistribution = this.calculateSubscriptionDistribution(currentSubscriptions);

      // Calculate churn analysis
      const churnAnalysis = this.calculateChurnAnalysis(subscriptionEvents);

      // Calculate retention cohorts
      const retentionCohorts = await this.calculateRetentionCohorts(tenantId, startDate, endDate);

      const analytics = {
        totalSubscriptions,
        activeSubscriptions,
        cancelledSubscriptions,
        newSubscriptions,
        churnRate,
        retentionRate,
        averageRevenuePerUser,
        customerLifetimeValue,
        subscriptionDistribution,
        churnAnalysis,
        retentionCohorts,
      };

      // Cache for 1 hour
      await this.cache.set(cacheKey, JSON.stringify(analytics), 3600);

      return analytics;
    } catch (error) {
      this.logger.error(`Failed to get subscription analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get financial performance metrics
   * 
   * @param tenantId - Tenant identifier
   * @param startDate - Start date for metrics
   * @param endDate - End date for metrics
   * @returns Promise<FinancialMetrics>
   */
  async getFinancialMetrics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    revenue: {
      total: number;
      growth: number;
      forecast: number;
    };
    costs: {
      total: number;
      breakdown: Array<{
        category: string;
        amount: number;
        percentage: number;
      }>;
    };
    profitability: {
      grossMargin: number;
      netMargin: number;
      ebitda: number;
    };
    cashFlow: {
      operating: number;
      investing: number;
      financing: number;
      net: number;
    };
    kpis: {
      customerAcquisitionCost: number;
      customerLifetimeValue: number;
      ltvCacRatio: number;
      paybackPeriod: number;
    };
  }> {
    try {
      const cacheKey = `financial_metrics:${tenantId}:${startDate.toISOString()}:${endDate.toISOString()}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Get revenue data
      const revenueEvents = await this.prisma.revenueEvent.findMany({
        where: {
          tenantId,
          timestamp: { gte: startDate, lte: endDate },
          success: true,
        },
      });

      // Get cost data (this would come from a costs table in a real implementation)
      const costs = await this.getCosts(tenantId, startDate, endDate);

      // Calculate revenue metrics
      const totalRevenue = revenueEvents.reduce((sum, event) => sum + event.amount, 0);
      const revenueGrowth = await this.calculateRevenueGrowth(tenantId, startDate, endDate);
      const revenueForecast = await this.calculateRevenueForecast(tenantId, totalRevenue);

      // Calculate cost breakdown
      const costBreakdown = this.calculateCostBreakdown(costs);

      // Calculate profitability metrics
      const grossMargin = this.calculateGrossMargin(totalRevenue, costs.total);
      const netMargin = this.calculateNetMargin(totalRevenue, costs.total);
      const ebitda = this.calculateEBITDA(totalRevenue, costs.total);

      // Calculate cash flow
      const cashFlow = this.calculateCashFlow(revenueEvents, costs);

      // Calculate KPIs
      const kpis = await this.calculateKPIs(tenantId, startDate, endDate);

      const metrics = {
        revenue: {
          total: totalRevenue,
          growth: revenueGrowth,
          forecast: revenueForecast,
        },
        costs: {
          total: costs.total,
          breakdown: costBreakdown,
        },
        profitability: {
          grossMargin,
          netMargin,
          ebitda,
        },
        cashFlow,
        kpis,
      };

      // Cache for 1 hour
      await this.cache.set(cacheKey, JSON.stringify(metrics), 3600);

      return metrics;
    } catch (error) {
      this.logger.error(`Failed to get financial metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update revenue metrics cache
   * 
   * @param tenantId - Tenant identifier
   * @param revenueData - Revenue data
   * @returns Promise<void>
   */
  private async updateRevenueMetrics(tenantId: string, revenueData: any): Promise<void> {
    try {
      const cacheKey = `revenue_analytics:${tenantId}`;
      await this.cache.del(cacheKey);
    } catch (error) {
      this.logger.error(`Failed to update revenue metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Update subscription metrics cache
   * 
   * @param tenantId - Tenant identifier
   * @param subscriptionData - Subscription data
   * @returns Promise<void>
   */
  private async updateSubscriptionMetrics(tenantId: string, subscriptionData: any): Promise<void> {
    try {
      const cacheKey = `subscription_analytics:${tenantId}`;
      await this.cache.del(cacheKey);
    } catch (error) {
      this.logger.error(`Failed to update subscription metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Calculate Monthly Recurring Revenue (MRR)
   * 
   * @param subscriptionEvents - Subscription events
   * @returns MRR value
   */
  private calculateMRR(subscriptionEvents: any[]): number {
    const activeSubscriptions = subscriptionEvents.filter(e => e.status === 'active');
    return activeSubscriptions.reduce((sum, sub) => {
      const monthlyAmount = sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount;
      return sum + monthlyAmount;
    }, 0);
  }

  /**
   * Calculate Customer Lifetime Value (CLV)
   * 
   * @param activeSubscriptions - Number of active subscriptions
   * @param arpu - Average Revenue Per User
   * @param churnRate - Churn rate percentage
   * @returns CLV value
   */
  private calculateCLV(activeSubscriptions: number, arpu: number, churnRate: number): number {
    if (churnRate === 0) return 0;
    return arpu / (churnRate / 100);
  }

  /**
   * Calculate revenue by type
   * 
   * @param revenueEvents - Revenue events
   * @returns Revenue by type breakdown
   */
  private calculateRevenueByType(revenueEvents: any[]): Array<{
    type: string;
    amount: number;
    percentage: number;
  }> {
    const typeMap = new Map<string, number>();
    const totalRevenue = revenueEvents.reduce((sum, event) => sum + event.amount, 0);

    revenueEvents.forEach(event => {
      const current = typeMap.get(event.revenueType) || 0;
      typeMap.set(event.revenueType, current + event.amount);
    });

    return Array.from(typeMap.entries()).map(([type, amount]) => ({
      type,
      amount,
      percentage: (amount / totalRevenue) * 100,
    }));
  }

  /**
   * Calculate revenue by plan
   * 
   * @param subscriptionEvents - Subscription events
   * @returns Revenue by plan breakdown
   */
  private calculateRevenueByPlan(subscriptionEvents: any[]): Array<{
    planId: string;
    planName: string;
    amount: number;
    percentage: number;
  }> {
    const planMap = new Map<string, { name: string; amount: number }>();
    const totalRevenue = subscriptionEvents.reduce((sum, event) => sum + event.amount, 0);

    subscriptionEvents.forEach(event => {
      const current = planMap.get(event.planId) || { name: event.planName, amount: 0 };
      planMap.set(event.planId, {
        name: current.name,
        amount: current.amount + event.amount,
      });
    });

    return Array.from(planMap.entries()).map(([planId, data]) => ({
      planId,
      planName: data.name,
      amount: data.amount,
      percentage: (data.amount / totalRevenue) * 100,
    }));
  }

  /**
   * Calculate revenue trend
   * 
   * @param revenueEvents - Revenue events
   * @returns Revenue trend data
   */
  private calculateRevenueTrend(revenueEvents: any[]): Array<{
    period: string;
    revenue: number;
    growth: number;
  }> {
    // Group by month
    const monthlyRevenue = new Map<string, number>();
    
    revenueEvents.forEach(event => {
      const month = event.timestamp.toISOString().substring(0, 7);
      const current = monthlyRevenue.get(month) || 0;
      monthlyRevenue.set(month, current + event.amount);
    });

    const sortedMonths = Array.from(monthlyRevenue.entries()).sort();
    const trend = sortedMonths.map(([period, revenue], index) => {
      const previousRevenue = index > 0 ? sortedMonths[index - 1][1] : 0;
      const growth = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;
      
      return {
        period,
        revenue,
        growth,
      };
    });

    return trend;
  }

  /**
   * Calculate payment methods
   * 
   * @param revenueEvents - Revenue events
   * @returns Payment methods breakdown
   */
  private calculatePaymentMethods(revenueEvents: any[]): Array<{
    method: string;
    amount: number;
    percentage: number;
  }> {
    const methodMap = new Map<string, number>();
    const totalRevenue = revenueEvents.reduce((sum, event) => sum + event.amount, 0);

    revenueEvents.forEach(event => {
      const current = methodMap.get(event.paymentMethod) || 0;
      methodMap.set(event.paymentMethod, current + event.amount);
    });

    return Array.from(methodMap.entries()).map(([method, amount]) => ({
      method,
      amount,
      percentage: (amount / totalRevenue) * 100,
    }));
  }

  /**
   * Calculate subscription distribution
   * 
   * @param subscriptions - Current subscriptions
   * @returns Subscription distribution
   */
  private calculateSubscriptionDistribution(subscriptions: any[]): Array<{
    planId: string;
    planName: string;
    count: number;
    percentage: number;
  }> {
    const planMap = new Map<string, { name: string; count: number }>();
    const totalSubscriptions = subscriptions.length;

    subscriptions.forEach(sub => {
      const current = planMap.get(sub.planId) || { name: sub.planName, count: 0 };
      planMap.set(sub.planId, {
        name: current.name,
        count: current.count + 1,
      });
    });

    return Array.from(planMap.entries()).map(([planId, data]) => ({
      planId,
      planName: data.name,
      count: data.count,
      percentage: (data.count / totalSubscriptions) * 100,
    }));
  }

  /**
   * Calculate churn analysis
   * 
   * @param subscriptionEvents - Subscription events
   * @returns Churn analysis
   */
  private calculateChurnAnalysis(subscriptionEvents: any[]): Array<{
    reason: string;
    count: number;
    percentage: number;
  }> {
    // This would require additional data about cancellation reasons
    // For now, return a placeholder
    return [
      { reason: 'Price', count: 0, percentage: 0 },
      { reason: 'Features', count: 0, percentage: 0 },
      { reason: 'Support', count: 0, percentage: 0 },
      { reason: 'Other', count: 0, percentage: 0 },
    ];
  }

  /**
   * Calculate retention cohorts
   * 
   * @param tenantId - Tenant identifier
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Retention cohorts
   */
  private async calculateRetentionCohorts(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{
    cohort: string;
    users: number;
    retention: Array<{
      period: number;
      rate: number;
    }>;
  }>> {
    // This would require complex cohort analysis
    // For now, return a placeholder
    return [
      {
        cohort: '2024-01',
        users: 0,
        retention: [
          { period: 1, rate: 0 },
          { period: 2, rate: 0 },
          { period: 3, rate: 0 },
        ],
      },
    ];
  }

  /**
   * Get costs for a tenant
   * 
   * @param tenantId - Tenant identifier
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Costs data
   */
  private async getCosts(tenantId: string, startDate: Date, endDate: Date): Promise<{
    total: number;
    breakdown: Array<{ category: string; amount: number }>;
  }> {
    // This would come from a costs table in a real implementation
    return {
      total: 0,
      breakdown: [],
    };
  }

  /**
   * Calculate revenue growth
   * 
   * @param tenantId - Tenant identifier
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Revenue growth percentage
   */
  private async calculateRevenueGrowth(tenantId: string, startDate: Date, endDate: Date): Promise<number> {
    // This would compare with previous period
    return 0;
  }

  /**
   * Calculate revenue forecast
   * 
   * @param tenantId - Tenant identifier
   * @param currentRevenue - Current revenue
   * @returns Revenue forecast
   */
  private async calculateRevenueForecast(tenantId: string, currentRevenue: number): Promise<number> {
    // This would use historical data to forecast
    return currentRevenue * 1.1; // 10% growth assumption
  }

  /**
   * Calculate cost breakdown
   * 
   * @param costs - Costs data
   * @returns Cost breakdown
   */
  private calculateCostBreakdown(costs: any): Array<{
    category: string;
    amount: number;
    percentage: number;
  }> {
    return costs.breakdown.map((item: any) => ({
      category: item.category,
      amount: item.amount,
      percentage: (item.amount / costs.total) * 100,
    }));
  }

  /**
   * Calculate gross margin
   * 
   * @param revenue - Total revenue
   * @param costs - Total costs
   * @returns Gross margin percentage
   */
  private calculateGrossMargin(revenue: number, costs: number): number {
    return revenue > 0 ? ((revenue - costs) / revenue) * 100 : 0;
  }

  /**
   * Calculate net margin
   * 
   * @param revenue - Total revenue
   * @param costs - Total costs
   * @returns Net margin percentage
   */
  private calculateNetMargin(revenue: number, costs: number): number {
    return revenue > 0 ? ((revenue - costs) / revenue) * 100 : 0;
  }

  /**
   * Calculate EBITDA
   * 
   * @param revenue - Total revenue
   * @param costs - Total costs
   * @returns EBITDA value
   */
  private calculateEBITDA(revenue: number, costs: number): number {
    return revenue - costs;
  }

  /**
   * Calculate cash flow
   * 
   * @param revenueEvents - Revenue events
   * @param costs - Costs data
   * @returns Cash flow data
   */
  private calculateCashFlow(revenueEvents: any[], costs: any): {
    operating: number;
    investing: number;
    financing: number;
    net: number;
  } {
    const operating = revenueEvents.reduce((sum, event) => sum + event.amount, 0);
    const investing = 0; // Would come from investment data
    const financing = 0; // Would come from financing data
    const net = operating - costs.total;

    return {
      operating,
      investing,
      financing,
      net,
    };
  }

  /**
   * Calculate KPIs
   * 
   * @param tenantId - Tenant identifier
   * @param startDate - Start date
   * @param endDate - End date
   * @returns KPI data
   */
  private async calculateKPIs(tenantId: string, startDate: Date, endDate: Date): Promise<{
    customerAcquisitionCost: number;
    customerLifetimeValue: number;
    ltvCacRatio: number;
    paybackPeriod: number;
  }> {
    // These would be calculated from actual data
    return {
      customerAcquisitionCost: 0,
      customerLifetimeValue: 0,
      ltvCacRatio: 0,
      paybackPeriod: 0,
    };
  }

  /**
   * Get previous period revenue
   * 
   * @param tenantId - Tenant identifier
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Previous period revenue
   */
  private async getPreviousPeriodRevenue(tenantId: string, startDate: Date, endDate: Date): Promise<number> {
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = new Date(startDate.getTime() - 1);

    const revenueEvents = await this.prisma.revenueEvent.findMany({
      where: {
        tenantId,
        timestamp: { gte: previousStartDate, lte: previousEndDate },
        success: true,
      },
    });

    return revenueEvents.reduce((sum, event) => sum + event.amount, 0);
  }
}
