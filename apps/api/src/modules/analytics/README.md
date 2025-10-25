# LexiScan AI - Analytics Module

This module provides comprehensive analytics and data insights for the LexiScan AI platform, enabling data-driven decision making and business intelligence.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## 🎯 Overview

The Analytics module provides:

- **Usage Tracking**: Comprehensive user behavior and feature adoption tracking
- **Billing Analytics**: Revenue, subscription, and financial performance metrics
- **User Analytics**: User engagement, behavior patterns, and journey analytics
- **Document Analytics**: Document processing, AI performance, and content analysis
- **Dashboard Metrics**: Real-time KPIs, performance indicators, and business metrics

## 🏗️ Architecture

```
apps/api/src/modules/analytics/
├── usage-tracking.service.ts      # User behavior and feature tracking
├── billing-analytics.service.ts   # Financial and subscription analytics
├── user-analytics.service.ts      # User engagement and behavior analytics
├── document-analytics.service.ts  # Document processing and AI analytics
├── dashboard-metrics.service.ts   # Real-time metrics and KPIs
├── analytics.controller.ts        # API endpoints
├── analytics.module.ts            # Module configuration
└── dto/                          # Data Transfer Objects
    ├── analytics-query.dto.ts
    ├── usage-tracking.dto.ts
    ├── billing-analytics.dto.ts
    ├── user-analytics.dto.ts
    ├── document-analytics.dto.ts
    ├── dashboard-metrics.dto.ts
    └── index.ts
```

## 🔧 Services

### 1. Usage Tracking Service

**Purpose**: Tracks user interactions, feature usage, and system performance metrics.

**Key Features**:
- Real-time usage tracking
- Feature adoption analytics
- User behavior analysis
- Performance metrics collection
- Usage pattern identification
- Resource consumption tracking

**Methods**:
- `trackUserSession()`: Track user session activity
- `trackFeatureUsage()`: Track feature usage and adoption
- `trackAPIUsage()`: Track API calls and performance
- `trackDocumentProcessing()`: Track document processing metrics
- `getUsageStatistics()`: Get comprehensive usage statistics
- `getRealTimeMetrics()`: Get real-time usage metrics

### 2. Billing Analytics Service

**Purpose**: Provides financial insights and subscription analytics.

**Key Features**:
- Revenue tracking and forecasting
- Subscription analytics
- Payment pattern analysis
- Customer lifetime value (CLV)
- Churn prediction and analysis
- Financial performance metrics

**Methods**:
- `trackRevenue()`: Track revenue events
- `trackSubscriptionEvent()`: Track subscription lifecycle events
- `getRevenueAnalytics()`: Get comprehensive revenue analytics
- `getSubscriptionAnalytics()`: Get subscription metrics and trends
- `getFinancialMetrics()`: Get financial performance indicators

### 3. User Analytics Service

**Purpose**: Analyzes user engagement and behavioral patterns.

**Key Features**:
- User engagement tracking
- Behavioral pattern analysis
- Feature adoption metrics
- User journey mapping
- Retention and churn analysis
- User segmentation

**Methods**:
- `trackUserEngagement()`: Track user engagement metrics
- `trackUserBehavior()`: Track user behavior patterns
- `trackFeatureAdoption()`: Track feature adoption stages
- `trackUserJourney()`: Track user journey progression
- `getUserEngagementAnalytics()`: Get engagement analytics
- `getUserBehaviorAnalytics()`: Get behavior pattern analytics
- `getFeatureAdoptionAnalytics()`: Get feature adoption metrics
- `getUserJourneyAnalytics()`: Get user journey analytics

### 4. Document Analytics Service

**Purpose**: Tracks document processing and AI performance metrics.

**Key Features**:
- Document processing analytics
- AI performance tracking
- Content analysis metrics
- Document lifecycle tracking
- Processing efficiency metrics
- Quality and accuracy analytics

**Methods**:
- `trackDocumentProcessing()`: Track document processing events
- `trackContentAnalysis()`: Track content analysis results
- `trackDocumentLifecycle()`: Track document lifecycle stages
- `getDocumentProcessingAnalytics()`: Get processing analytics
- `getContentAnalysisAnalytics()`: Get content analysis metrics
- `getDocumentLifecycleAnalytics()`: Get lifecycle analytics

### 5. Dashboard Metrics Service

**Purpose**: Provides real-time metrics and KPIs for dashboards.

**Key Features**:
- Real-time dashboard metrics
- KPI tracking and monitoring
- Performance indicators
- Business intelligence metrics
- Custom dashboard widgets
- Data aggregation and summarization

**Methods**:
- `getDashboardMetrics()`: Get comprehensive dashboard metrics
- `getRealTimeMetrics()`: Get real-time system metrics
- `getKPIMetrics()`: Get key performance indicators
- `getDashboardWidgets()`: Get custom dashboard widgets

## 🌐 API Endpoints

### Analytics Controller

```typescript
// Track events
POST /analytics/track
GET  /analytics/metrics
GET  /analytics/realtime
GET  /analytics/time-series
GET  /analytics/funnel
GET  /analytics/cohort
GET  /analytics/feature-usage
GET  /analytics/api-usage
GET  /analytics/export
```

### Usage Tracking Endpoints

```typescript
// User sessions
POST /analytics/usage/session
GET  /analytics/usage/statistics
GET  /analytics/usage/realtime

// Feature usage
POST /analytics/usage/feature
GET  /analytics/usage/features

// API usage
POST /analytics/usage/api
GET  /analytics/usage/api-performance

// Document processing
POST /analytics/usage/document
GET  /analytics/usage/document-processing
```

### Billing Analytics Endpoints

```typescript
// Revenue tracking
POST /analytics/billing/revenue
GET  /analytics/billing/revenue-analytics
GET  /analytics/billing/revenue-trend

// Subscription analytics
POST /analytics/billing/subscription
GET  /analytics/billing/subscription-analytics
GET  /analytics/billing/churn-analysis

// Financial metrics
GET  /analytics/billing/financial-metrics
GET  /analytics/billing/kpis
```

### User Analytics Endpoints

```typescript
// User engagement
POST /analytics/users/engagement
GET  /analytics/users/engagement-analytics
GET  /analytics/users/engagement-trend

// User behavior
POST /analytics/users/behavior
GET  /analytics/users/behavior-analytics
GET  /analytics/users/behavior-patterns

// Feature adoption
POST /analytics/users/feature-adoption
GET  /analytics/users/feature-adoption-analytics
GET  /analytics/users/adoption-trend

// User journey
POST /analytics/users/journey
GET  /analytics/users/journey-analytics
GET  /analytics/users/journey-paths
```

### Document Analytics Endpoints

```typescript
// Document processing
POST /analytics/documents/processing
GET  /analytics/documents/processing-analytics
GET  /analytics/documents/processing-trend

// Content analysis
POST /analytics/documents/content-analysis
GET  /analytics/documents/content-analytics
GET  /analytics/documents/content-insights

// Document lifecycle
POST /analytics/documents/lifecycle
GET  /analytics/documents/lifecycle-analytics
GET  /analytics/documents/lifecycle-stages
```

### Dashboard Metrics Endpoints

```typescript
// Dashboard metrics
GET  /analytics/dashboard/metrics
GET  /analytics/dashboard/realtime
GET  /analytics/dashboard/kpis

// Dashboard widgets
GET  /analytics/dashboard/widgets
POST /analytics/dashboard/widgets
PUT  /analytics/dashboard/widgets/:id
DELETE /analytics/dashboard/widgets/:id
```

## ⚙️ Configuration

### Environment Variables

```bash
# Analytics Configuration
ANALYTICS_ENABLED=true
ANALYTICS_RETENTION_DAYS=365
ANALYTICS_BATCH_SIZE=1000
ANALYTICS_FLUSH_INTERVAL=60000

# Cache Configuration
CACHE_TTL=3600
CACHE_MAX_SIZE=1000

# Real-time Analytics
REALTIME_ANALYTICS_ENABLED=true
REALTIME_ANALYTICS_INTERVAL=5000

# Dashboard Configuration
DASHBOARD_REFRESH_INTERVAL=30000
DASHBOARD_CACHE_TTL=300
```

### Service Configuration

```typescript
// Usage Tracking Configuration
const usageTrackingConfig = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  batchSize: 100,
  flushInterval: 60000, // 1 minute
  retentionDays: 365,
};

// Billing Analytics Configuration
const billingAnalyticsConfig = {
  revenueRetentionDays: 2555, // 7 years
  subscriptionRetentionDays: 2555,
  financialMetricsCache: 3600, // 1 hour
};

// User Analytics Configuration
const userAnalyticsConfig = {
  engagementThreshold: 5, // actions
  sessionDurationThreshold: 900, // 15 minutes
  featureAdoptionThreshold: 0.7, // 70%
};

// Document Analytics Configuration
const documentAnalyticsConfig = {
  processingTimeout: 300000, // 5 minutes
  accuracyThreshold: 0.8, // 80%
  confidenceThreshold: 0.7, // 70%
};

// Dashboard Metrics Configuration
const dashboardMetricsConfig = {
  refreshInterval: 30000, // 30 seconds
  cacheTTL: 300, // 5 minutes
  realTimeEnabled: true,
};
```

## 📊 Usage Examples

### Track User Session

```typescript
import { UsageTrackingService } from './usage-tracking.service';

// Track user session
await usageTrackingService.trackUserSession(tenantId, userId, {
  sessionId: 'session_123',
  startTime: new Date(),
  endTime: new Date(),
  duration: 1800, // 30 minutes
  pageViews: 15,
  actions: 25,
  deviceInfo: {
    userAgent: 'Mozilla/5.0...',
    platform: 'Windows',
    browser: 'Chrome',
    version: '91.0.4472.124',
  },
  location: {
    country: 'US',
    region: 'CA',
    city: 'San Francisco',
    timezone: 'America/Los_Angeles',
  },
});
```

### Track Feature Usage

```typescript
import { UsageTrackingService } from './usage-tracking.service';

// Track feature usage
await usageTrackingService.trackFeatureUsage(tenantId, userId, {
  feature: 'document_analysis',
  action: 'analyze_document',
  context: { documentType: 'contract' },
  duration: 5000, // 5 seconds
  success: true,
});
```

### Get Revenue Analytics

```typescript
import { BillingAnalyticsService } from './billing-analytics.service';

// Get revenue analytics
const revenueAnalytics = await billingAnalyticsService.getRevenueAnalytics(
  tenantId,
  new Date('2024-01-01'),
  new Date('2024-12-31')
);

console.log(revenueAnalytics);
// {
//   totalRevenue: 125000,
//   monthlyRecurringRevenue: 10416.67,
//   annualRecurringRevenue: 125000,
//   revenueGrowth: 25.3,
//   revenueByType: [...],
//   revenueByPlan: [...],
//   revenueTrend: [...],
//   paymentMethods: [...]
// }
```

### Get User Engagement Analytics

```typescript
import { UserAnalyticsService } from './user-analytics.service';

// Get user engagement analytics
const engagementAnalytics = await userAnalyticsService.getUserEngagementAnalytics(
  tenantId,
  new Date('2024-01-01'),
  new Date('2024-12-31')
);

console.log(engagementAnalytics);
// {
//   totalUsers: 1500,
//   activeUsers: 1200,
//   engagedUsers: 900,
//   averageSessionDuration: 1800,
//   averagePageViews: 12,
//   averageActions: 25,
//   engagementRate: 75.0,
//   userSegments: [...],
//   engagementTrend: [...],
//   topFeatures: [...]
// }
```

### Get Document Processing Analytics

```typescript
import { DocumentAnalyticsService } from './document-analytics.service';

// Get document processing analytics
const processingAnalytics = await documentAnalyticsService.getDocumentProcessingAnalytics(
  tenantId,
  new Date('2024-01-01'),
  new Date('2024-12-31')
);

console.log(processingAnalytics);
// {
//   totalDocuments: 5000,
//   processedDocuments: 4800,
//   failedDocuments: 200,
//   successRate: 96.0,
//   averageProcessingTime: 45.5,
//   averageAITime: 30.2,
//   processingEfficiency: 66.4,
//   documentTypes: [...],
//   processingTrend: [...],
//   featureUsage: [...],
//   accuracyMetrics: {...}
// }
```

### Get Dashboard Metrics

```typescript
import { DashboardMetricsService } from './dashboard-metrics.service';

// Get dashboard metrics
const dashboardMetrics = await dashboardMetricsService.getDashboardMetrics(
  tenantId,
  new Date('2024-01-01'),
  new Date('2024-12-31')
);

console.log(dashboardMetrics);
// {
//   overview: {...},
//   performance: {...},
//   business: {...},
//   technical: {...},
//   trends: {...},
//   alerts: [...]
// }
```

## 🎯 Best Practices

### Performance Optimization

1. **Caching**: Use Redis caching for frequently accessed analytics data
2. **Batch Processing**: Process analytics events in batches to improve performance
3. **Data Retention**: Implement appropriate data retention policies
4. **Indexing**: Ensure proper database indexing for analytics queries

### Data Privacy

1. **PII Protection**: Implement proper PII detection and anonymization
2. **Data Encryption**: Encrypt sensitive analytics data
3. **Access Control**: Implement proper access controls for analytics data
4. **Audit Logging**: Log all analytics data access and modifications

### Monitoring

1. **Real-time Monitoring**: Monitor analytics service performance
2. **Error Tracking**: Track and alert on analytics service errors
3. **Data Quality**: Monitor data quality and completeness
4. **Performance Metrics**: Track analytics service performance metrics

### Security

1. **Authentication**: Ensure proper authentication for analytics endpoints
2. **Authorization**: Implement role-based access control
3. **Data Validation**: Validate all incoming analytics data
4. **Rate Limiting**: Implement rate limiting for analytics endpoints

## 🔧 Troubleshooting

### Common Issues

1. **Performance Issues**: Check cache configuration and database indexing
2. **Data Quality**: Verify data collection and processing logic
3. **Memory Usage**: Monitor memory usage for large analytics queries
4. **Cache Misses**: Check cache configuration and TTL settings

### Debugging

1. **Enable Debug Logging**: Set log level to debug for detailed information
2. **Check Service Health**: Monitor service health and performance
3. **Verify Data Flow**: Check data flow from collection to storage
4. **Test Endpoints**: Use API testing tools to verify endpoint functionality

## 📚 Additional Resources

- [Analytics Service Documentation](./SERVICES_DOCUMENTATION.md)
- [API Reference](./API_REFERENCE.md)
- [Configuration Guide](./CONFIGURATION.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

For more information about the analytics module, contact the development team or refer to the individual service documentation.
