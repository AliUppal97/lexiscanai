# 🏆 Enterprise-Grade Feature Completion Prompts
## One-Shot Implementation Prompts for Billion-Dollar Product Standards

**Prepared By:** Senior Enterprise Software Engineer (Billion-Dollar Product Experience)  
**Target:** LexiScan AI - Enterprise SaaS Platform  
**Standards:** Security, Efficiency, Scalability, Reliability, Compliance, Best Practices  
**Approach:** Production-Ready, Battle-Tested Implementation Patterns

---

## 🎯 **Implementation Philosophy & Standards**

### **Core Principles**

As an enterprise software engineer with experience building billion-dollar SaaS products, these prompts follow these core principles:

1. **Security First** - Every feature must be secure by design, not as an afterthought
2. **Performance Critical** - Sub-100ms response times, handle 1000+ concurrent requests
3. **Scalability Built-In** - Horizontal scaling, no single points of failure
4. **Reliability Guaranteed** - 99.9% uptime, graceful degradation, comprehensive error handling
5. **Compliance Ready** - SOC 2, HIPAA, GDPR compliant from day one
6. **Code Quality** - 90%+ test coverage, TypeScript strict mode, comprehensive documentation

### **Architectural Patterns**

Each implementation follows these battle-tested patterns:

#### **1. Multi-Tenant Isolation**
```typescript
// Always filter by tenantId
const data = await this.prisma.model.findMany({
  where: { tenantId, ...filters },
});
```

#### **2. Row-Level Security**
```typescript
// Use Prisma middleware for automatic tenant filtering
prisma.$use(async (params, next) => {
  if (params.model && !params.args.where.tenantId) {
    params.args.where.tenantId = request.tenantId;
  }
  return next(params);
});
```

#### **3. Caching Strategy**
```typescript
// Cache with TTL, invalidate on updates
const cacheKey = `resource:${tenantId}:${id}`;
const cached = await this.cache.get(cacheKey);
if (cached) return cached;
const data = await this.fetchFromDB();
await this.cache.set(cacheKey, data, 300); // 5min TTL
```

#### **4. Error Handling**
```typescript
try {
  return await this.operation();
} catch (error) {
  this.logger.error(`Operation failed: ${error.message}`, { context });
  if (error instanceof KnownError) {
    throw error; // Re-throw known errors
  }
  throw new InternalServerErrorException('Operation failed');
}
```

#### **5. Rate Limiting**
```typescript
// Use decorator pattern
@Throttle({ default: { limit: 100, ttl: 60000 } })
@Get('endpoint')
async endpoint() { ... }
```

#### **6. Audit Logging**
```typescript
// Log all critical operations
await this.auditService.log({
  action: 'RESOURCE_CREATED',
  resource: 'Document',
  resourceId: document.id,
  userId: request.userId,
  tenantId: request.tenantId,
  details: { ... },
});
```

#### **7. Input Validation**
```typescript
// Use DTOs with class-validator
export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
```

#### **8. Async Processing**
```typescript
// Use BullMQ for background jobs
await this.queue.add('process-document', {
  documentId,
  tenantId,
}, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
});
```

### **Technology Stack Standards**

- **Language:** TypeScript (strict mode)
- **Framework:** NestJS (enterprise patterns)
- **Database:** PostgreSQL with Prisma ORM
- **Cache:** Redis (caching, queues, real-time)
- **Queue:** BullMQ (background jobs)
- **Monitoring:** Prometheus + Grafana
- **Logging:** Winston/Pino (structured logs)
- **Testing:** Jest (unit), Supertest (integration), Playwright (E2E)

### **Security Standards**

1. **Authentication:** JWT with RS256, refresh tokens, MFA
2. **Authorization:** RBAC + ABAC, permission checks at service level
3. **Data Protection:** Encryption at rest (AES-256), in transit (TLS 1.3)
4. **Input Validation:** All inputs validated, SQL injection prevention
5. **Rate Limiting:** Per-user, per-tenant, per-IP limits
6. **Audit Logging:** All critical operations logged
7. **Compliance:** SOC 2, HIPAA, GDPR ready

### **Performance Standards**

1. **Response Times:** <100ms for cached, <500ms for DB queries
2. **Throughput:** Handle 1000+ concurrent requests
3. **Scalability:** Horizontal scaling, stateless services
4. **Caching:** Aggressive caching with proper invalidation
5. **Database:** Optimized queries, proper indexes, connection pooling

### **Reliability Standards**

1. **Uptime:** 99.9% availability target
2. **Error Handling:** Comprehensive error handling, graceful degradation
3. **Retries:** Exponential backoff for transient failures
4. **Circuit Breakers:** Prevent cascading failures
5. **Monitoring:** Real-time monitoring, alerting, dashboards

### **Code Quality Standards**

1. **TypeScript:** Strict mode, no `any` types
2. **Testing:** 90%+ coverage, unit + integration + E2E
3. **Documentation:** JSDoc for all public methods, OpenAPI for APIs
4. **Linting:** ESLint + Prettier, no warnings
5. **Code Review:** All code reviewed before merge

---

## 📋 Table of Contents

### **Core Feature Completions**
1. [A/B Testing Service - Statistical Analysis](#1-ab-testing-service---statistical-analysis)
2. [Feature Flag Analytics Service](#2-feature-flag-analytics-service)
3. [API Versioning - Usage Tracking & Migration](#3-api-versioning---usage-tracking--migration)
4. [GraphQL - Complete Resolver Implementation](#4-graphql---complete-resolver-implementation)
5. [Real-Time Collaboration - Document Change Tracking](#5-real-time-collaboration---document-change-tracking)
6. [Advanced Analytics & BI - Report Builder & Query Engine](#6-advanced-analytics--bi---report-builder--query-engine)
7. [Workflow Automation Engine - Complete Implementation](#7-workflow-automation-engine---complete-implementation)
8. [Advanced Security - DLP, Zero Trust, SOAR](#8-advanced-security---dlp-zero-trust-soar)
9. [White-Labeling Services - Complete Implementation](#9-white-labeling-services---complete-implementation)
10. [Customer Success Tools - ML Models & Services](#10-customer-success-tools---ml-models--services)
11. [Platform Marketplace - Sandboxing & SDK](#11-platform-marketplace---sandboxing--sdk)
12. [AI Models Infrastructure - Training & Deployment](#12-ai-models-infrastructure---training--deployment)

### **Supporting Feature Completions**
13. [API Key Authentication Guard - Complete Implementation](#13-api-key-authentication-guard---complete-implementation)
14. [Quota Alert Notifications - Multi-Channel Integration](#14-quota-alert-notifications---multi-channel-integration)
15. [Usage Tracker - Redis Real-Time Integration](#15-usage-tracker---redis-real-time-integration)
16. [Report Query Builder - Complete SQL Engine](#16-report-query-builder---complete-sql-engine)

---

## 1. A/B Testing Service - Statistical Analysis

### **Enterprise-Grade Implementation Prompt:**

```
As a Senior Enterprise Software Engineer with experience building billion-dollar SaaS products, complete the A/B Testing Service statistical analysis implementation for LexiScan AI. This must meet production standards for statistical rigor, performance, and reliability.

CONTEXT:
- Existing ABTestService has basic variant assignment and event tracking
- Database schema: ABTest model with flagKeys, variants, successMetrics
- Missing: Statistical significance calculation, conversion rate analysis, experiment results dashboard

REQUIREMENTS:

1. STATISTICAL ANALYSIS ENGINE:
   - Implement statistical significance testing (Chi-square, t-test, Bayesian)
   - Calculate conversion rates per variant with confidence intervals
   - Support multiple success metrics (conversion, revenue, engagement)
   - Handle sample size calculations and minimum detectable effect (MDE)
   - Implement sequential testing (optional stopping) with proper corrections
   - Support multi-variate testing (MVT) analysis

2. EVENT TRACKING SYSTEM:
   - Create ABTestEvent model: id, experimentId, userId, variant, eventType, eventValue, timestamp, metadata
   - Implement efficient event storage (consider time-series DB or optimized PostgreSQL)
   - Batch event processing for performance
   - Real-time event aggregation using Redis
   - Event deduplication and validation

3. ANALYSIS SERVICE METHODS:
   - analyzeResults(experimentId): Complete statistical analysis
     * Calculate variant distributions
     * Compute conversion rates with 95% confidence intervals
     * Perform statistical significance tests (p-value, effect size)
     * Calculate sample size requirements
     * Detect early winners/losers with proper corrections
   - getVariantPerformance(experimentId, variant): Get detailed variant metrics
   - getConversionFunnel(experimentId): Analyze conversion funnel per variant
   - calculateSampleSize(experimentId, mde, power, alpha): Calculate required sample size
   - checkStatisticalSignificance(experimentId): Determine if results are significant

4. PERFORMANCE OPTIMIZATIONS:
   - Use Redis for real-time metrics aggregation
   - Pre-aggregate daily/hourly statistics
   - Implement materialized views for complex queries
   - Cache analysis results (5min TTL)
   - Use database indexes: (experimentId, variant, timestamp), (experimentId, eventType)

5. SECURITY & COMPLIANCE:
   - Row-level security: Filter by tenantId
   - Audit logging: Log all analysis operations
   - Data privacy: Anonymize user data in results
   - Rate limiting: Prevent analysis abuse
   - Input validation: Validate all statistical parameters

6. ERROR HANDLING & RELIABILITY:
   - Handle edge cases: insufficient data, zero conversions, single variant
   - Graceful degradation: Return partial results if analysis fails
   - Retry logic: Retry failed aggregations
   - Circuit breaker: Prevent cascading failures
   - Comprehensive logging: Log all analysis steps

7. TESTING REQUIREMENTS:
   - Unit tests: Statistical functions (90%+ coverage)
   - Integration tests: End-to-end analysis flow
   - Statistical tests: Validate correctness of calculations
   - Performance tests: Handle 1M+ events efficiently
   - Edge case tests: Zero data, single variant, etc.

8. API ENDPOINTS:
   - GET /api/v1/ab-tests/:id/results: Get complete analysis
   - GET /api/v1/ab-tests/:id/variants/:variant/performance: Get variant performance
   - GET /api/v1/ab-tests/:id/conversion-funnel: Get conversion funnel
   - POST /api/v1/ab-tests/:id/events: Track conversion event (optimized)
   - GET /api/v1/ab-tests/:id/sample-size: Calculate required sample size

IMPLEMENTATION STANDARDS:
- Use established statistical libraries (e.g., jstat, ml-matrix) for calculations
- Follow industry standards: 95% confidence intervals, p < 0.05 significance
- Implement proper multiple comparison corrections (Bonferroni, FDR)
- Support both frequentist and Bayesian approaches
- Document all statistical methods with references
- Ensure numerical stability (avoid division by zero, handle edge cases)

CODE QUALITY:
- TypeScript strict mode
- Comprehensive JSDoc comments
- Error handling with custom exceptions
- Input validation with class-validator
- Logging with structured logs (Winston/Pino)
- Metrics with Prometheus

FILE STRUCTURE:
apps/api/src/modules/feature-flags/
├── ab-test.service.ts (enhance existing)
├── ab-test-analysis.service.ts (new)
├── ab-test-events.service.ts (new)
├── statistics/
│   ├── significance-calculator.ts (new)
│   ├── conversion-calculator.ts (new)
│   └── sample-size-calculator.ts (new)
└── dto/
    ├── ab-test-results.dto.ts (new)
    └── ab-test-event.dto.ts (new)
```

---

## 2. Feature Flag Analytics Service

### **Enterprise-Grade Implementation Prompt:**

```
As a Senior Enterprise Software Engineer, complete the Feature Flag Analytics Service for LexiScan AI. This service must provide comprehensive analytics, metrics, and insights for feature flag usage, performance, and impact analysis.

CONTEXT:
- FeatureFlagsAnalyticsService exists but incomplete
- Database: FeatureFlagEvaluation model tracks evaluations
- Missing: Comprehensive analytics, metrics aggregation, impact analysis

REQUIREMENTS:

1. ANALYTICS ENGINE:
   - Aggregate evaluation data by flag, variant, tenant, time period
   - Calculate flag adoption rates and trends
   - Track flag performance metrics (latency, error rates)
   - Analyze variant distribution and consistency
   - Detect flag anomalies and issues
   - Calculate feature flag ROI and impact

2. METRICS COLLECTION:
   - Real-time metrics: Active flags, evaluation rate, variant distribution
   - Historical metrics: Adoption trends, performance over time
   - User metrics: Flags per user, most used flags
   - Performance metrics: Evaluation latency, cache hit rate
   - Error metrics: Failed evaluations, fallback usage

3. ANALYTICS SERVICE METHODS:
   - getFlagMetrics(flagKey, startDate, endDate): Comprehensive flag metrics
     * Evaluation counts by variant
     * Adoption rate and trends
     * Performance metrics (latency, errors)
     * User distribution
   - getVariantDistribution(flagKey): Variant distribution analysis
   - getFlagTrends(flagKey, period): Trend analysis over time
   - getFlagImpact(flagKey): Impact analysis (conversions, revenue)
   - getTopFlags(tenantId, limit): Most used flags
   - getFlagHealth(flagKey): Health score and anomalies

4. PERFORMANCE OPTIMIZATIONS:
   - Pre-aggregate metrics hourly/daily
   - Use Redis for real-time counters
   - Materialized views for complex aggregations
   - Cache analytics results (5min TTL)
   - Batch processing for historical analysis
   - Database indexes: (flagKey, evaluatedAt), (tenantId, flagKey)

5. SECURITY & COMPLIANCE:
   - Row-level security: Filter by tenantId
   - Data privacy: Aggregate user data
   - Audit logging: Log analytics access
   - Rate limiting: Prevent abuse
   - Access control: Check permissions

6. RELIABILITY:
   - Handle missing data gracefully
   - Fallback to cached data if DB unavailable
   - Retry failed aggregations
   - Circuit breaker for external dependencies
   - Comprehensive error handling

7. API ENDPOINTS:
   - GET /api/v1/feature-flags/:key/analytics: Get flag analytics
   - GET /api/v1/feature-flags/:key/metrics: Get flag metrics
   - GET /api/v1/feature-flags/:key/variants/distribution: Get variant distribution
   - GET /api/v1/feature-flags/:key/trends: Get trends
   - GET /api/v1/feature-flags/analytics/top: Get top flags
   - GET /api/v1/feature-flags/analytics/health: Get health scores

IMPLEMENTATION STANDARDS:
- Use time-series aggregation patterns
- Implement proper data sampling for large datasets
- Support multiple time granularities (hour, day, week, month)
- Calculate percentiles (p50, p95, p99) for performance metrics
- Use statistical methods for trend detection

CODE QUALITY:
- TypeScript strict mode
- Comprehensive error handling
- Input validation
- Structured logging
- Prometheus metrics
- JSDoc documentation
```

---

## 3. API Versioning - Usage Tracking & Migration

### **Enterprise-Grade Implementation Prompt:**

```
As a Senior Enterprise Software Engineer, complete the API Versioning usage tracking and migration guide system for LexiScan AI. This must enable proper API lifecycle management, deprecation workflows, and migration support.

CONTEXT:
- VersionGuard, VersionInterceptor, VersionService exist
- Database: ApiVersion, ApiVersionUsage models
- Missing: Comprehensive usage tracking, migration guides, deprecation workflows

REQUIREMENTS:

1. USAGE TRACKING SYSTEM:
   - Track API version usage per tenant, endpoint, time period
   - Aggregate usage statistics (request count, error rate, latency)
   - Detect deprecated version usage
   - Identify tenants using deprecated versions
   - Generate usage reports and analytics

2. MIGRATION GUIDE SYSTEM:
   - Create migration guide templates
   - Generate version-specific migration guides
   - Track migration progress per tenant
   - Provide code examples and snippets
   - Support multiple formats (Markdown, HTML, PDF)

3. DEPRECATION WORKFLOW:
   - Automated deprecation warnings in responses
   - Deprecation timeline management
   - Sunset date tracking and enforcement
   - Migration deadline notifications
   - Graceful version retirement

4. VERSION SERVICE ENHANCEMENTS:
   - trackVersionUsage(version, tenantId, endpoint): Track usage
   - getUsageStatistics(version, period): Get usage stats
   - getDeprecatedVersionUsers(version): Get tenants using deprecated version
   - createMigrationGuide(fromVersion, toVersion, changes): Generate guide
   - getMigrationProgress(tenantId, version): Track migration progress
   - checkDeprecationStatus(version): Check if deprecated/sunset

5. PERFORMANCE:
   - Batch usage tracking (every 30 seconds)
   - Use Redis for real-time counters
   - Pre-aggregate statistics
   - Cache migration guides
   - Database indexes: (version, tenantId, endpoint), (version, lastUsedAt)

6. SECURITY & COMPLIANCE:
   - Audit logging: Log all version changes
   - Access control: Admin-only version management
   - Rate limiting: Prevent abuse
   - Data privacy: Aggregate tenant data

7. API ENDPOINTS:
   - GET /api/versions/:version/usage: Get usage statistics
   - GET /api/versions/:version/users: Get tenants using version
   - GET /api/versions/:version/migration-guide: Get migration guide
   - POST /api/versions/:version/deprecate: Deprecate version (admin)
   - GET /api/versions/:version/migration-progress: Get migration progress
   - GET /api/versions/deprecated: List deprecated versions

IMPLEMENTATION STANDARDS:
- Follow semantic versioning (SemVer)
- Support backward compatibility windows (12 months minimum)
- Implement proper deprecation timelines (3-6-12 months)
- Generate changelogs automatically from git commits
- Support version aliases (latest, stable)

CODE QUALITY:
- TypeScript strict mode
- Comprehensive error handling
- Input validation
- Structured logging
- Prometheus metrics
- JSDoc documentation
```

---

## 4. GraphQL - Complete Resolver Implementation

### **Enterprise-Grade Implementation Prompt:**

```
As a Senior Enterprise Software Engineer, complete the GraphQL API Gateway implementation for LexiScan AI. Extend beyond Document resolver to include User, Organization, Billing, and all core entities with proper DataLoaders, subscriptions, and performance optimizations.

CONTEXT:
- GraphQL module exists with Document resolver
- Document DataLoader implemented
- Missing: User, Organization, Billing, Analytics resolvers

REQUIREMENTS:

1. COMPLETE RESOLVER SET:
   - UserResolver: Queries, mutations, subscriptions
   - OrganizationResolver: Queries, mutations
   - BillingResolver: Queries, mutations
   - AnalyticsResolver: Queries (aggregations)
   - DocumentResolver: Enhance existing
   - AuditResolver: Queries (read-only)

2. DATALOADER IMPLEMENTATION:
   - UserDataLoader: Batch load users by IDs
   - OrganizationDataLoader: Batch load organizations
   - BillingDataLoader: Batch load billing records
   - DocumentDataLoader: Enhance existing
   - RoleDataLoader: Batch load roles
   - PermissionDataLoader: Batch load permissions

3. SUBSCRIPTIONS:
   - Real-time document updates
   - Real-time user presence
   - Real-time billing events
   - Real-time audit events
   - Use Redis pub/sub for scaling

4. PERFORMANCE OPTIMIZATIONS:
   - Query complexity analysis (max depth: 10, max complexity: 1000)
   - Query cost analysis and limiting
   - Field-level caching
   - Query batching
   - Persisted queries support
   - Query analysis and slow query detection

5. SECURITY:
   - GraphQLAuthGuard: JWT authentication
   - Field-level permissions
   - Tenant isolation
   - Input validation
   - Rate limiting per user/tenant
   - Query timeout (30s)

6. ERROR HANDLING:
   - GraphQL error format
   - Error codes and messages
   - Error masking in production
   - Comprehensive error logging

7. API ENDPOINTS:
   - POST /graphql: GraphQL endpoint
   - GET /graphql: GraphQL Playground (dev only)
   - GET /graphql/schema: Schema introspection
   - POST /graphql/persisted: Persisted queries

IMPLEMENTATION STANDARDS:
- Use @nestjs/graphql with code-first approach
- Implement proper N+1 prevention with DataLoaders
- Support GraphQL federation (future-ready)
- Use graphql-query-complexity for complexity analysis
- Implement proper error handling and logging

CODE QUALITY:
- TypeScript strict mode
- Comprehensive error handling
- Input validation with class-validator
- Structured logging
- Prometheus metrics
- JSDoc documentation
- Unit tests (90%+ coverage)
```

---

## 5. Real-Time Collaboration - Document Change Tracking

### **Enterprise-Grade Implementation Prompt:**

```
As a Senior Enterprise Software Engineer, complete the Real-Time Collaboration document change tracking system for LexiScan AI. This must support operational transform (OT) or CRDT for conflict-free collaborative editing with proper performance and reliability.

CONTEXT:
- CollaborationGateway, CollaborationService, ConflictResolutionService exist
- Database: CollaborationSession, DocumentChange, Comment, Presence models
- Missing: Refined change tracking, operational transform implementation, comment threading

REQUIREMENTS:

1. OPERATIONAL TRANSFORM ENGINE:
   - Implement OT algorithms for text editing
   - Support insert, delete, update operations
   - Handle concurrent edits with conflict resolution
   - Maintain document version history
   - Support undo/redo functionality
   - Use Yjs or ShareJS library for OT

2. CHANGE TRACKING REFINEMENT:
   - Track changes at character/word level
   - Support rich text formatting changes
   - Track metadata changes (title, tags)
   - Efficient change compression
   - Change batching for performance
   - Change replay for synchronization

3. COMMENT THREADING:
   - Support nested comment threads
   - Track comment replies and reactions
   - Comment resolution workflow
   - Comment notifications
   - Comment search and filtering
   - Comment export

4. COLLABORATION SERVICE ENHANCEMENTS:
   - applyChange(documentId, change, userId): Apply change with OT
   - getChangeHistory(documentId, startVersion, endVersion): Get change history
   - replayChanges(documentId, fromVersion, toVersion): Replay changes
   - resolveConflict(documentId, change1, change2): Resolve conflicts
   - createComment(documentId, comment, position): Create comment
   - getCommentThread(documentId, threadId): Get comment thread
   - resolveComment(commentId): Resolve comment

5. PERFORMANCE:
   - Use Redis for real-time change broadcasting
   - Batch changes (every 100ms or 10 changes)
   - Compress change payloads
   - Cache document state
   - Database indexes: (documentId, version), (documentId, timestamp)

6. SECURITY & COMPLIANCE:
   - Permission checks: Check document permissions
   - Rate limiting: Prevent abuse
   - Input validation: Validate all changes
   - Audit logging: Log all changes
   - Data privacy: Handle PII in comments

7. RELIABILITY:
   - Handle disconnections gracefully
   - Reconnection with state sync
   - Conflict resolution fallback
   - Change persistence (durable storage)
   - Error recovery

8. API ENDPOINTS:
   - POST /api/v1/documents/:id/changes: Apply change
   - GET /api/v1/documents/:id/changes: Get change history
   - POST /api/v1/documents/:id/comments: Create comment
   - GET /api/v1/documents/:id/comments: Get comments
   - GET /api/v1/documents/:id/comments/:threadId: Get thread
   - PUT /api/v1/documents/:id/comments/:commentId/resolve: Resolve comment

IMPLEMENTATION STANDARDS:
- Use Yjs for CRDT or ShareJS for OT
- Support document locking for exclusive editing
- Implement proper version vectors
- Handle network partitions gracefully
- Support offline mode with sync

CODE QUALITY:
- TypeScript strict mode
- Comprehensive error handling
- Input validation
- Structured logging
- Prometheus metrics
- JSDoc documentation
- Unit tests (90%+ coverage)
- Load tests (100+ concurrent users)
```

---

## 6. Advanced Analytics & BI - Report Builder & Query Engine

### **Enterprise-Grade Implementation Prompt:**

```
As a Senior Enterprise Software Engineer, complete the Advanced Analytics & BI Dashboard system for LexiScan AI. This must include a visual report builder, SQL query engine, dashboard service, and report scheduling with enterprise-grade performance and security.

CONTEXT:
- Database models: Report, Dashboard, ReportTemplate, ScheduledReport exist
- Missing: Report builder service, query builder, dashboard service, scheduler

REQUIREMENTS:

1. REPORT BUILDER SERVICE:
   - Visual report builder with drag-and-drop interface
   - Support multiple data sources (documents, users, billing, analytics)
   - Field selection and grouping
   - Filter builder (AND/OR logic, multiple conditions)
   - Aggregation functions (SUM, AVG, COUNT, MIN, MAX, GROUP BY)
   - Sorting and pagination
   - Report templates library
   - Report versioning

2. QUERY BUILDER ENGINE:
   - Build SQL queries from report configuration
   - Support complex joins across tables
   - Parameterized queries (prevent SQL injection)
   - Query optimization (index hints, query plans)
   - Query validation and sanitization
   - Support for subqueries and CTEs
   - Query caching

3. DASHBOARD SERVICE:
   - Create interactive dashboards
   - Widget types: Charts, tables, gauges, heatmaps
   - Dashboard layout management (grid system)
   - Real-time dashboard updates
   - Dashboard sharing and permissions
   - Dashboard templates

4. REPORT SCHEDULER:
   - Cron-based scheduling
   - Multiple recipients (email, webhook)
   - Multiple formats (PDF, Excel, CSV, JSON)
   - Report generation queue (BullMQ)
   - Retry logic for failed reports
   - Report delivery tracking

5. VISUALIZATION TYPES:
   - Line charts (time series)
   - Bar charts (categorical)
   - Pie charts (distribution)
   - Tables (detailed data)
   - Gauges (KPIs)
   - Heatmaps (correlation)

6. REPORT BUILDER METHODS:
   - createReport(dto): Create custom report
   - buildQuery(reportConfig): Build SQL from config
   - validateQuery(query): Validate query safety
   - optimizeQuery(query): Optimize query performance
   - executeReport(reportId, filters): Execute report
   - getReportData(reportId, filters): Get report data
   - createDashboard(dto): Create dashboard
   - scheduleReport(reportId, schedule): Schedule report

7. PERFORMANCE:
   - Query result caching (5min TTL)
   - Async report execution for large datasets
   - Data aggregation at database level
   - Pagination for large results
   - Connection pooling
   - Query timeout (5 minutes)

8. SECURITY & COMPLIANCE:
   - Row-level security: Filter by tenantId
   - SQL injection prevention: Parameterized queries only
   - Access control: Check report permissions
   - Data masking: Mask sensitive data
   - Audit logging: Log all report executions
   - Rate limiting: Prevent abuse

9. API ENDPOINTS:
   - GET /api/v1/reports: List reports
   - POST /api/v1/reports: Create report
   - GET /api/v1/reports/:id: Get report
   - PUT /api/v1/reports/:id: Update report
   - POST /api/v1/reports/:id/execute: Execute report
   - GET /api/v1/reports/:id/data: Get report data
   - GET /api/v1/dashboards: List dashboards
   - POST /api/v1/dashboards: Create dashboard
   - GET /api/v1/report-templates: List templates
   - GET /api/v1/scheduled-reports: List scheduled reports

IMPLEMENTATION STANDARDS:
- Use Chart.js or D3.js for visualization
- Use BullMQ for async report execution
- Use Redis for caching
- Support real-time dashboards with WebSocket
- Implement proper query sanitization
- Use Prisma query builder for safety

CODE QUALITY:
- TypeScript strict mode
- Comprehensive error handling
- Input validation
- Structured logging
- Prometheus metrics
- JSDoc documentation
- Unit tests (90%+ coverage)
- Security tests (SQL injection, XSS)
```

---

## 7. Workflow Automation Engine - Complete Implementation

### **Enterprise-Grade Implementation Prompt:**

```
As a Senior Enterprise Software Engineer, complete the Workflow Automation Engine for LexiScan AI. This must support visual workflow builder, complex automation rules, conditional logic, error handling, and reliable execution with enterprise-grade performance.

CONTEXT:
- Database: Workflow, WorkflowExecution, WorkflowStep, AutomationRule models exist
- WorkflowExecutorService partially implemented
- Missing: Complete workflow engine, builder, visual interface, error handling

REQUIREMENTS:

1. WORKFLOW ENGINE SERVICE:
   - Execute workflows step-by-step
   - Support parallel step execution
   - Handle conditional branching (if/then/else, switch)
   - Support loops and iterations
   - Error handling and retry logic
   - Workflow state management
   - Workflow versioning

2. WORKFLOW BUILDER SERVICE:
   - Validate workflow definition (DAG validation)
   - Compile workflow to executable format
   - Optimize workflow (remove dead code, merge steps)
   - Support workflow templates
   - Import/export workflows (JSON format)
   - Workflow testing and debugging

3. AUTOMATION RULES ENGINE:
   - Rule evaluation engine
   - Event-based triggers
   - Condition evaluation (complex logic)
   - Action execution
   - Rule priority and ordering
   - Rule conflict detection

4. WORKFLOW COMPONENTS:
   - Triggers: Webhook, Schedule (cron), Event, Manual, API
   - Actions: Send Email, Create Document, Update Record, Call API, Notify, Webhook, Delay
   - Conditions: If/Then/Else, Switch, Loop, Filter
   - Data Transformations: Map, Filter, Aggregate, Transform
   - Integrations: External API calls, webhook triggers

5. WORKFLOW EXECUTOR ENHANCEMENTS:
   - executeWorkflow(workflowId, input): Execute workflow
   - executeStep(step, context): Execute workflow step
   - handleCondition(condition, context): Evaluate condition
   - handleAction(action, context): Execute action
   - handleError(error, context): Handle errors
   - pauseWorkflow(executionId): Pause execution
   - resumeWorkflow(executionId): Resume execution
   - cancelWorkflow(executionId): Cancel execution

6. PERFORMANCE:
   - Use BullMQ for workflow execution
   - Use Redis for workflow state
   - Step result caching
   - Parallel step execution
   - Workflow queuing
   - Database indexes: (workflowId, status), (tenantId, status)

7. SECURITY & COMPLIANCE:
   - Permission checks: Check workflow permissions
   - Input validation: Validate all inputs
   - Sandbox execution: Sandbox workflow execution
   - Rate limiting: Prevent abuse
   - Audit logging: Log all executions
   - Access control: Check permissions

8. RELIABILITY:
   - Retry logic for failed steps
   - Circuit breaker for external calls
   - Workflow state persistence
   - Error recovery
   - Timeout handling
   - Dead letter queue for failed workflows

9. API ENDPOINTS:
   - GET /api/v1/workflows: List workflows
   - POST /api/v1/workflows: Create workflow
   - GET /api/v1/workflows/:id: Get workflow
   - PUT /api/v1/workflows/:id: Update workflow
   - POST /api/v1/workflows/:id/execute: Execute workflow
   - POST /api/v1/workflows/:id/pause: Pause workflow
   - POST /api/v1/workflows/:id/resume: Resume workflow
   - GET /api/v1/workflows/:id/executions: Get executions
   - GET /api/v1/workflow-templates: List templates
   - GET /api/v1/automation-rules: List rules
   - POST /api/v1/automation-rules: Create rule

IMPLEMENTATION STANDARDS:
- Use BullMQ for workflow execution
- Use Redis for workflow state
- Support workflow versioning
- Implement proper error handling
- Support workflow debugging
- Use workflow DSL (JSON-based)

CODE QUALITY:
- TypeScript strict mode
- Comprehensive error handling
- Input validation
- Structured logging
- Prometheus metrics
- JSDoc documentation
- Unit tests (90%+ coverage)
- Integration tests (full workflow flows)
```

---

## 8. Advanced Security - DLP, Zero Trust, SOAR

### **Enterprise-Grade Implementation Prompt:**

```
As a Senior Enterprise Software Engineer, complete the Advanced Security features (DLP, Zero Trust, SOAR) for LexiScan AI. This must meet enterprise security standards with comprehensive data protection, zero trust architecture, and security orchestration.

CONTEXT:
- Database: DlpPolicy, DocumentClassification, DeviceTrust, SecurityIncident, SoarPlaybook models exist
- DlpService, ZeroTrustService, SoarService partially implemented
- Missing: Complete DLP scanning, zero trust evaluation, SOAR automation, data classification

REQUIREMENTS:

1. DLP SERVICE COMPLETION:
   - Complete document content scanning
   - Support multiple content types (text, PDF, images with OCR)
   - Pattern matching (regex, keywords, ML-based)
   - Data pattern detection (SSN, credit cards, emails, PII)
   - File type and size restrictions
   - Location-based restrictions
   - Real-time and batch scanning

2. DATA CLASSIFICATION SERVICE:
   - Automatic document classification (PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED)
   - ML-based classification (use pre-trained models)
   - Manual classification override
   - Classification confidence scoring
   - Classification-based access control
   - Classification labels and tags

3. ZERO TRUST SERVICE:
   - Access evaluation engine (never trust, always verify)
   - Context-aware access decisions
   - Device trust scoring
   - User behavior analysis
   - Risk-based authentication
   - Continuous monitoring
   - Access revocation

4. DEVICE TRUST SERVICE:
   - Device fingerprinting
   - Device registration and management
   - Trust score calculation
   - Risk factor detection
   - Device anomaly detection
   - Device revocation

5. SOAR SERVICE:
   - Security playbook execution
   - Automated incident response
   - Threat intelligence integration
   - Incident correlation
   - Automated remediation
   - Playbook templates

6. SECURITY INCIDENT MANAGEMENT:
   - Incident creation and tracking
   - Severity classification
   - Incident assignment
   - Incident resolution workflow
   - Incident reporting
   - Compliance reporting

7. DLP SERVICE METHODS:
   - scanDocument(documentId): Complete document scanning
   - evaluatePolicy(document, content): Evaluate DLP policy
   - handleViolation(violation): Handle DLP violation
   - createPolicy(dto): Create DLP policy
   - classifyDocument(documentId): Classify document
   - getClassification(documentId): Get classification

8. ZERO TRUST METHODS:
   - evaluateAccess(userId, resource, context): Evaluate access
   - calculateTrustScore(userId, deviceId): Calculate trust score
   - requireMfa(userId, context): Require MFA
   - blockAccess(userId, reason): Block access
   - getDeviceTrust(deviceId): Get device trust

9. PERFORMANCE:
   - Async document scanning (BullMQ)
   - Batch processing for large documents
   - Caching trust scores (5min TTL)
   - Distributed scanning (scale horizontally)
   - Database indexes: (documentId), (tenantId, classification)

10. SECURITY & COMPLIANCE:
    - Encryption: Encrypt sensitive data
    - Audit logging: Log all security events
    - Rate limiting: Prevent abuse
    - Input validation: Validate all inputs
    - Compliance: SOC 2, HIPAA, GDPR ready
    - Data privacy: Handle PII properly

11. API ENDPOINTS:
    - GET /api/v1/security/dlp-policies: List DLP policies
    - POST /api/v1/security/dlp-policies: Create policy
    - POST /api/v1/security/dlp-policies/:id/evaluate: Evaluate policy
    - POST /api/v1/security/documents/:id/scan: Scan document
    - GET /api/v1/security/classifications: List classifications
    - POST /api/v1/security/classifications: Classify document
    - GET /api/v1/security/device-trust: Get device trust
    - GET /api/v1/security/incidents: List incidents
    - POST /api/v1/security/soar-playbooks: Create playbook
    - POST /api/v1/security/incidents/:id/resolve: Resolve incident

IMPLEMENTATION STANDARDS:
- Use machine learning for classification (TensorFlow.js or external API)
- Integrate with threat intelligence feeds
- Support compliance frameworks (SOC 2, HIPAA, GDPR)
- Implement proper encryption
- Use established security patterns
- Follow OWASP guidelines

CODE QUALITY:
- TypeScript strict mode
- Comprehensive error handling
- Input validation
- Structured logging
- Prometheus metrics
- JSDoc documentation
- Security tests (penetration testing)
- Compliance tests
```

---

## 9. White-Labeling Services - Complete Implementation

### **Enterprise-Grade Implementation Prompt:**

```
As a Senior Enterprise Software Engineer, complete the White-Labeling & Customization services for LexiScan AI. This must support custom branding, custom domains with SSL, theme management, and email template customization with enterprise-grade reliability.

CONTEXT:
- Database: BrandingConfig, CustomDomain, Theme, EmailTemplate models exist
- Services partially implemented with TODOs
- Missing: Complete branding service, domain verification, SSL management, theme engine

REQUIREMENTS:

1. BRANDING SERVICE:
   - Get branding configuration for tenant
   - Update branding (logo, colors, fonts, CSS, JS)
   - Apply branding to responses (inject CSS/JS)
   - Generate branding preview
   - Validate branding assets (size, format)
   - CDN integration for asset delivery

2. CUSTOM DOMAIN SERVICE:
   - Add custom domain for tenant
   - Domain verification (DNS TXT record)
   - SSL certificate management (Let's Encrypt integration)
   - Domain routing (route domains to tenants)
   - Subdomain support
   - Domain health monitoring

3. THEME SERVICE:
   - Create and manage themes
   - Apply themes to tenants
   - Theme preview
   - Theme templates library
   - Dark/light theme support
   - Theme variables (CSS custom properties)

4. EMAIL TEMPLATE SERVICE:
   - Create and manage email templates
   - Template variables and rendering
   - Template preview
   - Template versioning
   - Multi-language support
   - Template testing

5. BRANDING SERVICE METHODS:
   - getBranding(tenantId): Get branding config
   - updateBranding(tenantId, dto): Update branding
   - applyBranding(tenantId, request): Apply branding to response
   - generateBrandingPreview(tenantId): Generate preview
   - validateBrandingAssets(assets): Validate assets

6. CUSTOM DOMAIN METHODS:
   - addDomain(tenantId, domain): Add custom domain
   - verifyDomain(tenantId, domain): Verify domain (DNS check)
   - getSslCertificate(domain): Get SSL certificate
   - removeDomain(tenantId, domain): Remove domain
   - checkDomainHealth(domain): Check domain health

7. PERFORMANCE:
   - CDN for branding assets
   - Cache branding configs (5min TTL)
   - Lazy load themes
   - Optimize images (compression, formats)
   - Database indexes: (tenantId), (domain)

8. SECURITY & COMPLIANCE:
   - CSS sanitization (prevent XSS)
   - JS sandboxing (prevent code injection)
   - Domain validation (prevent domain hijacking)
   - SSL validation
   - Asset validation (file type, size)
   - Rate limiting

9. API ENDPOINTS:
   - GET /api/v1/branding: Get branding
   - PUT /api/v1/branding: Update branding
   - POST /api/v1/branding/preview: Generate preview
   - GET /api/v1/custom-domains: List domains
   - POST /api/v1/custom-domains: Add domain
   - POST /api/v1/custom-domains/:id/verify: Verify domain
   - DELETE /api/v1/custom-domains/:id: Remove domain
   - GET /api/v1/themes: List themes
   - POST /api/v1/themes: Create theme
   - GET /api/v1/email-templates: List templates
   - POST /api/v1/email-templates: Create template

IMPLEMENTATION STANDARDS:
- Use CSS-in-JS for theming
- Support CSS custom properties
- Use DOMPurify for HTML sanitization
- Use VM2 or similar for JS sandboxing
- Integrate with Let's Encrypt for SSL
- Use CDN (CloudFront, Cloudflare) for assets

CODE QUALITY:
- TypeScript strict mode
- Comprehensive error handling
- Input validation
- Structured logging
- Prometheus metrics
- JSDoc documentation
- Security tests (XSS, code injection)
```

---

## 10. Customer Success Tools - ML Models & Services

### **Enterprise-Grade Implementation Prompt:**

```
As a Senior Enterprise Software Engineer, complete the Customer Success Tools for LexiScan AI. This must include customer health scoring, churn prediction ML models, success metrics tracking, and automated playbooks with enterprise-grade accuracy and performance.

CONTEXT:
- Database: CustomerHealthScore, ChurnPrediction, SuccessMetric, CustomerPlaybook models exist
- Services partially implemented with TODOs
- Missing: ML models, complete health scoring, churn prediction algorithms, playbook automation

REQUIREMENTS:

1. CUSTOMER HEALTH SCORING SERVICE:
   - Calculate health score (0-100) based on multiple factors
   - Health factors: Login frequency, feature usage, support tickets, payment history, contract value, engagement
   - Trend analysis (IMPROVING, STABLE, DECLINING)
   - Health score history
   - Health score alerts
   - Health score dashboard

2. CHURN PREDICTION SERVICE:
   - ML-based churn prediction model
   - Features: Login frequency, feature usage, support tickets, payment issues, contract expiration, competitor mentions
   - Churn probability (0-100%)
   - Risk factors identification
   - Churn risk alerts
   - Model retraining (monthly)
   - Model accuracy tracking

3. SUCCESS METRICS SERVICE:
   - Track success metrics (LOGIN_FREQUENCY, FEATURE_USAGE, SUPPORT_TICKETS, PAYMENT_HISTORY, CONTRACT_VALUE, ENGAGEMENT)
   - Metric aggregation and trends
   - Metric comparison (vs. average, vs. cohort)
   - Metric alerts
   - Metric dashboards

4. CUSTOMER PLAYBOOK SERVICE:
   - Create automated playbooks
   - Playbook triggers (health score decline, churn risk, etc.)
   - Playbook actions (send email, create task, assign CSM, etc.)
   - Playbook execution tracking
   - Playbook A/B testing
   - Playbook effectiveness measurement

5. ML MODEL IMPLEMENTATION:
   - Churn prediction model (scikit-learn or TensorFlow)
   - Health score model
   - Engagement model
   - Model training pipeline
   - Model versioning
   - Model monitoring (accuracy, drift)

6. CUSTOMER SUCCESS METHODS:
   - calculateHealthScore(tenantId): Calculate health score
   - getHealthScore(tenantId): Get health score
   - getHealthTrend(tenantId): Get health trend
   - predictChurn(tenantId): Predict churn probability
   - getChurnRisk(tenantId): Get churn risk
   - getRiskFactors(tenantId): Get risk factors
   - trackMetric(tenantId, metricType, value): Track metric
   - executePlaybook(playbookId, tenantId): Execute playbook

7. PERFORMANCE:
   - Cache health scores (1 hour TTL)
   - Async ML model inference
   - Batch metric processing
   - Database indexes: (tenantId), (calculatedAt)

8. SECURITY & COMPLIANCE:
   - Data privacy: Aggregate customer data
   - Audit logging: Log all calculations
   - Access control: Check permissions
   - Rate limiting: Prevent abuse

9. API ENDPOINTS:
   - GET /api/v1/customer-success/health/:tenantId: Get health score
   - GET /api/v1/customer-success/churn/:tenantId: Get churn prediction
   - GET /api/v1/customer-success/metrics/:tenantId: Get metrics
   - POST /api/v1/customer-success/playbooks: Create playbook
   - GET /api/v1/customer-success/journey/:tenantId: Get journey
   - GET /api/v1/customer-success/engagement/:tenantId: Get engagement

IMPLEMENTATION STANDARDS:
- Use scikit-learn or TensorFlow for ML models
- Retrain models monthly
- Support A/B testing of playbooks
- Use proper ML evaluation metrics (precision, recall, F1)
- Implement model versioning
- Monitor model performance

CODE QUALITY:
- TypeScript strict mode
- Comprehensive error handling
- Input validation
- Structured logging
- Prometheus metrics
- JSDoc documentation
- ML model validation tests
```

---

## 11. Platform Marketplace - Sandboxing & SDK

### **Enterprise-Grade Implementation Prompt:**

```
As a Senior Enterprise Software Engineer, complete the Platform Ecosystem (Marketplace) for LexiScan AI. This must include app sandboxing, developer SDK, app execution engine, and revenue management with enterprise-grade security and scalability.

CONTEXT:
- Database: MarketplaceApp, AppInstallation, DeveloperAccount, AppReview, AppTransaction models exist
- Services partially implemented with TODOs
- Missing: App sandboxing, developer SDK, complete execution engine, revenue service

REQUIREMENTS:

1. APP SANDBOXING SYSTEM:
   - Docker-based sandboxing for app execution
   - Resource limits (CPU, memory, disk)
   - Network isolation
   - File system isolation
   - Timeout handling
   - Security scanning (code analysis, dependency scanning)
   - Sandbox monitoring

2. DEVELOPER SDK:
   - TypeScript SDK for developers
   - API authentication (API keys)
   - Webhook support
   - SDK documentation
   - Code examples and tutorials
   - SDK versioning

3. APP EXECUTION SERVICE:
   - Execute apps in sandbox
   - Validate app code
   - Handle app errors
   - App performance monitoring
   - App logging
   - App metrics collection

4. REVENUE SERVICE:
   - Calculate platform commission
   - Process payments
   - Track developer revenue
   - Payout management
   - Revenue reporting
   - Tax handling

5. MARKETPLACE SERVICE METHODS:
   - listApps(filters): List apps with filtering
   - getApp(id): Get app details
   - installApp(appId, tenantId): Install app
   - uninstallApp(appId, tenantId): Uninstall app
   - searchApps(query): Search apps
   - validateApp(appId): Validate app code
   - executeApp(appId, input): Execute app in sandbox

6. DEVELOPER PLATFORM METHODS:
   - registerDeveloper(dto): Register developer
   - createApp(dto): Create app
   - updateApp(id, dto): Update app
   - publishApp(id): Publish app
   - getDeveloperApps(developerId): Get developer apps
   - getDeveloperRevenue(developerId): Get revenue

7. PERFORMANCE:
   - App caching (5min TTL)
   - CDN for app assets
   - Async app execution
   - Load balancing for app execution
   - Database indexes: (developerId), (status), (category)

8. SECURITY & COMPLIANCE:
   - App sandboxing: Isolate app execution
   - Code validation: Validate app code
   - Permission checks: Check app permissions
   - Rate limiting: Prevent abuse
   - Security scanning: Scan apps for vulnerabilities
   - Audit logging: Log all app executions

9. API ENDPOINTS:
   - GET /api/v1/marketplace/apps: List apps
   - GET /api/v1/marketplace/apps/:id: Get app
   - POST /api/v1/marketplace/apps/:id/install: Install app
   - DELETE /api/v1/marketplace/apps/:id/uninstall: Uninstall app
   - GET /api/v1/developer/apps: List developer apps
   - POST /api/v1/developer/apps: Create app
   - PUT /api/v1/developer/apps/:id: Update app
   - POST /api/v1/developer/apps/:id/publish: Publish app
   - GET /api/v1/developer/revenue: Get revenue

IMPLEMENTATION STANDARDS:
- Use Docker for app sandboxing
- Support app versioning
- Implement proper security scanning
- Use established SDK patterns
- Support app analytics
- Implement proper revenue sharing

CODE QUALITY:
- TypeScript strict mode
- Comprehensive error handling
- Input validation
- Structured logging
- Prometheus metrics
- JSDoc documentation
- Security tests (sandbox escape, code injection)
```

---

## 12. AI Models Infrastructure - Training & Deployment

### **Enterprise-Grade Implementation Prompt:**

```
As a Senior Enterprise Software Engineer, complete the Proprietary AI Models Infrastructure for LexiScan AI. This must support model training, deployment, inference, and monitoring with enterprise-grade MLops practices and performance.

CONTEXT:
- Database: AIModel, ModelTraining, ModelDeployment, ModelVersion, ModelUsage models exist
- Services partially implemented with TODOs
- Missing: Complete training pipeline, deployment system, inference service, monitoring

REQUIREMENTS:

1. MODEL TRAINING SERVICE:
   - Training job management
   - Distributed training support (multi-GPU)
   - Training data pipeline (ETL)
   - Model checkpointing
   - Training metrics tracking (MLflow integration)
   - Training job monitoring
   - Training job cancellation

2. MODEL DEPLOYMENT SERVICE:
   - Model deployment to staging/production
   - Canary deployments (traffic percentage)
   - Model rollback
   - Model versioning
   - Deployment health checks
   - Auto-scaling (Kubernetes)
   - Load balancing

3. MODEL INFERENCE SERVICE:
   - Model inference API
   - Batch inference support
   - Inference caching
   - Inference performance optimization
   - Model A/B testing
   - Inference metrics collection

4. MODEL MONITORING SERVICE:
   - Model performance monitoring (accuracy, latency)
   - Data drift detection
   - Model anomaly detection
   - Model health alerts
   - Model usage analytics
   - Model cost tracking

5. MODEL TRAINING METHODS:
   - trainModel(dto): Start training job
   - getTrainingStatus(trainingId): Get training status
   - cancelTraining(trainingId): Cancel training
   - getTrainingMetrics(trainingId): Get training metrics
   - getTrainingLogs(trainingId): Get training logs

6. MODEL DEPLOYMENT METHODS:
   - deployModel(modelId, environment): Deploy model
   - updateTraffic(modelId, percentage): Update traffic
   - rollbackModel(modelId): Rollback model
   - getDeploymentStatus(modelId): Get deployment status
   - healthCheck(modelId): Health check

7. MODEL INFERENCE METHODS:
   - predict(modelId, input): Run prediction
   - batchPredict(modelId, inputs): Batch prediction
   - getModelMetrics(modelId): Get metrics
   - cachePrediction(modelId, input, output): Cache prediction

8. PERFORMANCE:
   - Model caching (predictions)
   - Batch processing
   - Load balancing
   - Auto-scaling
   - Database indexes: (modelId), (status), (environment)

9. SECURITY & COMPLIANCE:
   - Model encryption: Encrypt models at rest
   - Access control: Control model access
   - Input validation: Validate inputs
   - Output sanitization: Sanitize outputs
   - Audit logging: Log all model usage

10. API ENDPOINTS:
    - GET /api/v1/ai-models: List models
    - POST /api/v1/ai-models: Create model
    - GET /api/v1/ai-models/:id: Get model
    - POST /api/v1/ai-models/:id/train: Train model
    - POST /api/v1/ai-models/:id/deploy: Deploy model
    - POST /api/v1/ai-models/:id/predict: Run prediction
    - GET /api/v1/ai-models/:id/metrics: Get metrics

IMPLEMENTATION STANDARDS:
- Use PyTorch/TensorFlow for training
- Use Kubernetes for deployment
- Support model A/B testing
- Implement model explainability
- Use MLflow for experiment tracking
- Support federated learning (future)

CODE QUALITY:
- TypeScript strict mode
- Comprehensive error handling
- Input validation
- Structured logging
- Prometheus metrics
- JSDoc documentation
- Model validation tests
```

---

## 13. API Key Authentication Guard - Complete Implementation

### **Enterprise-Grade Implementation Prompt:**

```
As a Senior Enterprise Software Engineer, complete the API Key Authentication Guard implementation for LexiScan AI. This is critical for secure server-to-server API access and must follow enterprise security standards.

CONTEXT:
- ApiKeyAuthGuard exists in enhanced-auth.guard.ts with TODO placeholders
- API Keys module exists with ApiKeysService
- Missing: Complete API key verification, request context injection, rate limiting integration

REQUIREMENTS:

1. API KEY VERIFICATION:
   - Hash API key using SHA-256 (match ApiKeysService implementation)
   - Lookup API key in database (ApiKey model)
   - Verify key is active and not expired
   - Check key scopes/permissions
   - Validate tenant association
   - Cache verification results (1min TTL) to reduce DB load

2. REQUEST CONTEXT INJECTION:
   - Attach verified API key info to request object
   - Set request.userId from API key owner
   - Set request.tenantId from API key tenant
   - Set request.apiKey object with key details
   - Set request.scopes array for permission checking

3. SECURITY ENHANCEMENTS:
   - Rate limiting per API key (different from user rate limits)
   - API key usage tracking (log every request)
   - Detect suspicious activity (unusual patterns)
   - Support key rotation without downtime
   - Handle key revocation immediately

4. ERROR HANDLING:
   - Return 401 Unauthorized for invalid keys
   - Return 403 Forbidden for insufficient scopes
   - Return 429 Too Many Requests for rate limit exceeded
   - Log all authentication failures
   - Prevent key enumeration attacks (same error for invalid/missing keys)

5. PERFORMANCE:
   - Cache verified keys in Redis (1min TTL)
   - Use connection pooling for DB queries
   - Batch key lookups if possible
   - Minimize database hits

6. INTEGRATION:
   - Integrate with existing ApiKeysService
   - Use existing CacheService for caching
   - Use existing RateLimitService for rate limiting
   - Use existing AuditService for logging

IMPLEMENTATION CODE STRUCTURE:

```typescript
async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();
  const apiKey = this.extractApiKey(request);

  if (!apiKey) {
    throw new UnauthorizedException('API key required');
  }

  try {
    // Verify API key
    const verification = await this.verifyApiKey(apiKey);
    
    if (!verification.valid) {
      this.logger.warn(`Invalid API key attempt: ${apiKey.substring(0, 8)}...`);
      throw new UnauthorizedException('Invalid API key');
    }

    // Check rate limits
    await this.checkRateLimit(verification.keyId);

    // Attach to request
    request.apiKey = verification.apiKey;
    request.userId = verification.userId;
    request.tenantId = verification.tenantId;
    request.scopes = verification.scopes;

    // Track usage
    await this.trackUsage(verification.keyId, request);

    return true;
  } catch (error) {
    if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
      throw error;
    }
    this.logger.error(`API key authentication failed: ${error.message}`);
    throw new UnauthorizedException('Authentication failed');
  }
}

private async verifyApiKey(apiKey: string): Promise<VerificationResult> {
  // Check cache first
  const cacheKey = `api_key:${this.hashKey(apiKey)}`;
  const cached = await this.cache.get<VerificationResult>(cacheKey);
  if (cached) return cached;

  // Hash key for lookup
  const keyHash = this.hashKey(apiKey);
  
  // Lookup in database
  const apiKeyRecord = await this.prisma.apiKey.findFirst({
    where: {
      keyHash,
      isActive: true,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: { select: { id: true, tenantId: true } },
    },
  });

  if (!apiKeyRecord) {
    return { valid: false };
  }

  const result: VerificationResult = {
    valid: true,
    keyId: apiKeyRecord.id,
    userId: apiKeyRecord.userId,
    tenantId: apiKeyRecord.user.tenantId,
    scopes: apiKeyRecord.scopes || [],
    apiKey: apiKeyRecord,
  };

  // Cache result
  await this.cache.set(cacheKey, result, 60); // 1min TTL

  return result;
}
```

CODE QUALITY:
- TypeScript strict mode
- Comprehensive error handling
- Input validation
- Structured logging
- Prometheus metrics
- Security tests (key enumeration, injection)
```

---

## 14. Quota Alert Notifications - Multi-Channel Integration

### **Enterprise-Grade Implementation Prompt:**

```
As a Senior Enterprise Software Engineer, complete the Quota Alert notification system for LexiScan AI. This must integrate with email, Slack, webhooks, and in-app notifications with proper templating and delivery tracking.

CONTEXT:
- QuotaAlertService exists with sendAlertNotification method (TODO)
- Notification infrastructure exists (EmailService, NotificationService, WebhookService)
- Missing: Complete notification integration, templating, delivery tracking

REQUIREMENTS:

1. MULTI-CHANNEL NOTIFICATION:
   - Email notifications (via EmailService)
   - Slack notifications (via Slack webhook integration)
   - In-app notifications (via NotificationService)
   - Webhook notifications (via WebhookService)
   - SMS notifications (optional, via SmsService)

2. NOTIFICATION TEMPLATING:
   - Email templates with HTML formatting
   - Slack message formatting (rich blocks)
   - In-app notification formatting
   - Support template variables (tenant name, quota type, usage, limit, percentage)
   - Multi-language support

3. DELIVERY TRACKING:
   - Track notification delivery status
   - Retry failed deliveries (exponential backoff)
   - Delivery confirmation (email opened, webhook acknowledged)
   - Notification history per alert

4. ALERT THROTTLING:
   - Prevent alert spam (max 1 alert per threshold per hour)
   - Escalation rules (critical alerts bypass throttling)
   - Alert grouping (multiple thresholds in one notification)

5. INTEGRATION:
   - Integrate with existing EmailService
   - Integrate with existing NotificationService
   - Integrate with existing WebhookService
   - Use existing tenant configuration for notification preferences

IMPLEMENTATION CODE STRUCTURE:

```typescript
async sendAlertNotification(alert: QuotaAlert, quotaConfig: QuotaConfig): Promise<void> {
  const tenant = await this.getTenant(alert.tenantId);
  const usage = await this.getCurrentUsage(alert.tenantId, quotaConfig.resourceType);
  const percentage = (Number(usage) / Number(quotaConfig.limit)) * 100;

  const templateData = {
    tenantName: tenant.name,
    resourceType: quotaConfig.resourceType,
    currentUsage: usage.toString(),
    limit: quotaConfig.limit.toString(),
    percentage: percentage.toFixed(2),
    alertType: alert.alertType,
    threshold: alert.thresholdPercentage,
  };

  // Send via configured channels
  const promises: Promise<any>[] = [];

  if (tenant.notificationPreferences?.emailEnabled) {
    promises.push(this.sendEmailNotification(alert, templateData));
  }

  if (tenant.notificationPreferences?.slackEnabled) {
    promises.push(this.sendSlackNotification(alert, templateData));
  }

  if (tenant.notificationPreferences?.inAppEnabled) {
    promises.push(this.sendInAppNotification(alert, templateData));
  }

  if (tenant.notificationPreferences?.webhookEnabled) {
    promises.push(this.sendWebhookNotification(alert, templateData));
  }

  await Promise.allSettled(promises);
}
```

CODE QUALITY:
- TypeScript strict mode
- Comprehensive error handling
- Retry logic with exponential backoff
- Delivery tracking
- Structured logging
- Prometheus metrics
```

---

## 15. Usage Tracker - Redis Real-Time Integration

### **Enterprise-Grade Implementation Prompt:**

```
As a Senior Enterprise Software Engineer, complete the Usage Tracker Redis integration for LexiScan AI. This must provide real-time usage tracking with atomic operations, batching, and reliable persistence.

CONTEXT:
- UsageTrackerService exists but needs Redis integration
- Redis infrastructure exists (CacheService)
- Missing: Real-time counters, atomic operations, batch persistence

REQUIREMENTS:

1. REDIS COUNTERS:
   - Use Redis INCR for atomic counter increments
   - Key format: `usage:{tenantId}:{resourceType}:{period}:{timestamp}`
   - Support multiple periods (daily, monthly, yearly)
   - Handle counter expiration (auto-cleanup)

2. ATOMIC OPERATIONS:
   - Use Redis transactions (MULTI/EXEC) for consistency
   - Use Redis Lua scripts for complex operations
   - Handle race conditions properly
   - Support distributed locking if needed

3. BATCH PERSISTENCE:
   - Batch write to PostgreSQL every 30 seconds
   - Aggregate Redis counters before writing
   - Handle batch failures with retry
   - Maintain consistency between Redis and PostgreSQL

4. REAL-TIME QUERIES:
   - Get current usage from Redis (fast)
   - Fallback to PostgreSQL if Redis unavailable
   - Support usage history queries (from PostgreSQL)

5. PERFORMANCE:
   - Sub-millisecond Redis operations
   - Batch writes reduce DB load
   - Efficient key patterns
   - Connection pooling

IMPLEMENTATION CODE STRUCTURE:

```typescript
async trackUsage(
  tenantId: string,
  resourceType: ResourceType,
  quantity: bigint = BigInt(1),
  metadata?: Record<string, any>,
): Promise<void> {
  const now = new Date();
  const period = this.getCurrentPeriod(now);
  
  // Redis key
  const redisKey = `usage:${tenantId}:${resourceType}:${period}:${this.getTimestampKey(now)}`;
  
  // Atomic increment in Redis
  await this.redis.incrby(redisKey, Number(quantity));
  
  // Set expiration (keep for 90 days)
  await this.redis.expire(redisKey, 90 * 24 * 60 * 60);
  
  // Queue for batch persistence
  await this.queueBatchWrite({
    tenantId,
    resourceType,
    quantity,
    timestamp: now,
    metadata,
  });
}

private async batchWriteToDatabase(): Promise<void> {
  const batch = await this.getBatchQueue();
  
  if (batch.length === 0) return;

  // Aggregate by tenant/resource/period
  const aggregated = this.aggregateUsage(batch);
  
  // Bulk insert to PostgreSQL
  await this.prisma.usageRecord.createMany({
    data: aggregated,
    skipDuplicates: true,
  });
  
  // Clear batch queue
  await this.clearBatchQueue();
}
```

CODE QUALITY:
- TypeScript strict mode
- Comprehensive error handling
- Atomic operations
- Batch processing
- Structured logging
- Prometheus metrics
- Load tests (1000+ concurrent increments)
```

---

## 16. Report Query Builder - Complete SQL Engine

### **Enterprise-Grade Implementation Prompt:**

```
As a Senior Enterprise Software Engineer, complete the Report Query Builder SQL engine for LexiScan AI. This must safely build parameterized SQL queries from report configurations with proper validation, optimization, and security.

CONTEXT:
- QueryBuilderService exists with basic structure
- ReportBuilderService uses simplified query building
- Missing: Complete SQL generation, join support, subqueries, proper parameterization

REQUIREMENTS:

1. SQL QUERY GENERATION:
   - Build SELECT queries with proper field selection
   - Support JOINs (INNER, LEFT, RIGHT, FULL)
   - Support WHERE clauses with complex conditions (AND/OR/NOT)
   - Support GROUP BY with HAVING clauses
   - Support ORDER BY with multiple fields
   - Support LIMIT and OFFSET
   - Support aggregations (SUM, AVG, COUNT, MIN, MAX, DISTINCT)
   - Support subqueries and CTEs (Common Table Expressions)

2. PARAMETERIZATION:
   - Use parameterized queries (prevent SQL injection)
   - Proper type handling (strings, numbers, dates, booleans)
   - Array parameter handling (IN clauses)
   - NULL handling
   - Date range handling

3. QUERY VALIDATION:
   - Validate field names against schema
   - Validate table names
   - Prevent dangerous operations (DROP, DELETE, etc.)
   - Validate data types
   - Check query complexity (prevent DoS)

4. QUERY OPTIMIZATION:
   - Suggest indexes
   - Optimize JOIN order
   - Add LIMIT if missing for large tables
   - Use EXPLAIN to analyze queries
   - Cache query plans

5. SECURITY:
   - SQL injection prevention (parameterized queries only)
   - Field name whitelisting
   - Table name whitelisting
   - Query complexity limits
   - Row-level security (tenant filtering)

IMPLEMENTATION CODE STRUCTURE:

```typescript
buildQuery(config: ReportConfig): { query: string; params: any[] } {
  // Validate configuration
  this.validateConfig(config);
  
  // Build SELECT clause
  const selectClause = this.buildSelectClause(config.fields, config.aggregations);
  
  // Build FROM clause with JOINs
  const fromClause = this.buildFromClause(config.dataSource, config.joins);
  
  // Build WHERE clause with parameterization
  const { whereClause, params } = this.buildWhereClause(config.filters, config.tenantId);
  
  // Build GROUP BY clause
  const groupByClause = this.buildGroupByClause(config.groupBy);
  
  // Build HAVING clause
  const havingClause = this.buildHavingClause(config.having);
  
  // Build ORDER BY clause
  const orderByClause = this.buildOrderByClause(config.orderBy);
  
  // Build LIMIT/OFFSET clause
  const limitClause = this.buildLimitClause(config.limit, config.offset);
  
  // Combine query
  const query = [
    selectClause,
    fromClause,
    whereClause,
    groupByClause,
    havingClause,
    orderByClause,
    limitClause,
  ].filter(Boolean).join(' ');
  
  // Validate query safety
  const validation = this.validateQuery(query);
  if (!validation.valid) {
    throw new BadRequestException(`Invalid query: ${validation.errors.join(', ')}`);
  }
  
  return { query, params };
}

private buildWhereClause(filters: Filter[], tenantId: string): { clause: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;
  
  // Always add tenant filter for security
  conditions.push(`tenant_id = $${paramIndex++}`);
  params.push(tenantId);
  
  // Process filters
  for (const filter of filters) {
    const { condition, param } = this.buildFilterCondition(filter, paramIndex);
    conditions.push(condition);
    params.push(param);
    paramIndex++;
  }
  
  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}
```

CODE QUALITY:
- TypeScript strict mode
- Comprehensive error handling
- SQL injection prevention
- Input validation
- Structured logging
- Security tests (SQL injection attempts)
- Performance tests (complex queries)
```

---

## 🎯 Implementation Priority & Timeline

### **Phase 1: Critical Foundation (Weeks 1-4)**
**Goal:** Complete core infrastructure and high-impact features

1. **Week 1:**
   - API Key Authentication Guard (Day 1-2)
   - Usage Tracker Redis Integration (Day 2-3)
   - Quota Alert Notifications (Day 3-4)
   - A/B Testing Statistical Analysis (Day 4-5)

2. **Week 2:**
   - Feature Flag Analytics (Day 1-2)
   - API Versioning Usage Tracking (Day 2-3)
   - Report Query Builder SQL Engine (Day 3-5)

3. **Week 3:**
   - GraphQL Complete Resolvers (Day 1-3)
   - Real-Time Collaboration Refinement (Day 3-5)

4. **Week 4:**
   - Advanced Analytics & BI Dashboard (Day 1-5)

**Deliverables:** Core infrastructure complete, analytics foundation ready

### **Phase 2: High-Value Features (Weeks 5-8)**
**Goal:** Complete enterprise automation and security features

5. **Week 5-6:**
   - Workflow Automation Engine (Week 5)
   - Advanced Security (DLP, Zero Trust, SOAR) (Week 6)

6. **Week 7-8:**
   - White-Labeling Services (Week 7)
   - Customer Success Tools (Week 8)

**Deliverables:** Enterprise automation ready, security hardened

### **Phase 3: Platform Features (Weeks 9-12)**
**Goal:** Complete platform ecosystem and AI infrastructure

7. **Week 9-10:**
   - Platform Marketplace (Week 9-10)

8. **Week 11-12:**
   - AI Models Infrastructure (Week 11-12)

**Deliverables:** Complete platform ecosystem, AI infrastructure ready

### **Total Timeline: 12 Weeks (3 Months)**
**Team Size:** 2-3 Senior Engineers  
**Estimated Effort:** 1,200-1,800 engineering hours

---

## 📋 Implementation Checklist

For each feature implementation, follow this comprehensive checklist:

### **Phase 1: Planning & Design**
- [ ] Review existing codebase and dependencies
- [ ] Design database schema changes (if needed)
- [ ] Design API endpoints and DTOs
- [ ] Design service architecture
- [ ] Review security requirements
- [ ] Plan performance optimizations
- [ ] Create implementation plan

### **Phase 2: Database & Schema**
- [ ] Update Prisma schema (if needed)
- [ ] Create migration files
- [ ] Add database indexes for performance
- [ ] Add foreign key constraints
- [ ] Test migrations (up and down)

### **Phase 3: Service Implementation**
- [ ] Implement core service methods
- [ ] Add input validation
- [ ] Implement error handling
- [ ] Add caching where appropriate
- [ ] Implement rate limiting
- [ ] Add audit logging
- [ ] Add performance optimizations

### **Phase 4: API Layer**
- [ ] Create/update controller
- [ ] Implement all endpoints
- [ ] Create DTOs with validation
- [ ] Add OpenAPI/Swagger documentation
- [ ] Add request/response interceptors
- [ ] Add error filters

### **Phase 5: Security & Compliance**
- [ ] Add authentication/authorization guards
- [ ] Implement row-level security
- [ ] Add input sanitization
- [ ] Add SQL injection prevention
- [ ] Add XSS prevention
- [ ] Add CSRF protection
- [ ] Add rate limiting
- [ ] Add audit logging

### **Phase 6: Testing**
- [ ] Write unit tests (90%+ coverage)
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Write security tests
- [ ] Write performance tests
- [ ] Test error scenarios
- [ ] Test edge cases

### **Phase 7: Documentation**
- [ ] Add JSDoc comments to all public methods
- [ ] Update OpenAPI/Swagger docs
- [ ] Create/update README
- [ ] Document API endpoints
- [ ] Document configuration
- [ ] Document deployment steps

### **Phase 8: Code Quality**
- [ ] Run linter (fix all warnings)
- [ ] Run formatter (Prettier)
- [ ] Run type checker (no errors)
- [ ] Review code for best practices
- [ ] Check for security vulnerabilities
- [ ] Optimize performance bottlenecks

### **Phase 9: Integration**
- [ ] Integrate with existing modules
- [ ] Update app.module.ts
- [ ] Test module integration
- [ ] Verify dependency injection
- [ ] Test with other features

### **Phase 10: Deployment**
- [ ] Add environment variables
- [ ] Update deployment configs
- [ ] Add monitoring/metrics
- [ ] Add alerting rules
- [ ] Create runbook
- [ ] Test deployment process

---

## 🏆 Success Criteria & Quality Gates

Each feature must pass these quality gates before being considered complete:

### **Security Gate** ✅
- [ ] No OWASP Top 10 vulnerabilities
- [ ] All inputs validated and sanitized
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection
- [ ] Authentication/authorization implemented
- [ ] Row-level security enforced
- [ ] Audit logging for critical operations
- [ ] Security tests passing
- [ ] No secrets in code

### **Performance Gate** ✅
- [ ] Response times <100ms (cached) or <500ms (DB)
- [ ] Handles 1000+ concurrent requests
- [ ] Database queries optimized (indexes, query plans)
- [ ] Caching implemented where appropriate
- [ ] No N+1 query problems
- [ ] Connection pooling configured
- [ ] Load tests passing
- [ ] Performance metrics tracked (Prometheus)

### **Scalability Gate** ✅
- [ ] Stateless service design
- [ ] Horizontal scaling supported
- [ ] No single points of failure
- [ ] Distributed caching (Redis)
- [ ] Queue-based async processing (BullMQ)
- [ ] Database sharding ready (if needed)
- [ ] CDN integration (if needed)

### **Reliability Gate** ✅
- [ ] Comprehensive error handling
- [ ] Graceful degradation
- [ ] Retry logic with exponential backoff
- [ ] Circuit breaker pattern
- [ ] Health checks implemented
- [ ] Monitoring and alerting configured
- [ ] Runbook created
- [ ] Disaster recovery plan

### **Compliance Gate** ✅
- [ ] SOC 2 controls implemented
- [ ] HIPAA compliance (if applicable)
- [ ] GDPR compliance (data privacy, right to deletion)
- [ ] Audit logging for compliance
- [ ] Data retention policies
- [ ] Encryption at rest and in transit
- [ ] Access controls documented

### **Code Quality Gate** ✅
- [ ] TypeScript strict mode (no `any` types)
- [ ] 90%+ test coverage
- [ ] All tests passing
- [ ] No linter warnings
- [ ] Code formatted (Prettier)
- [ ] JSDoc comments on all public methods
- [ ] OpenAPI/Swagger documentation complete
- [ ] Code reviewed and approved
- [ ] README updated

### **Integration Gate** ✅
- [ ] Integrated with existing modules
- [ ] No breaking changes to existing APIs
- [ ] Backward compatibility maintained
- [ ] Migration scripts tested
- [ ] Rollback plan documented
- [ ] Integration tests passing

### **Documentation Gate** ✅
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Code documentation (JSDoc)
- [ ] README with setup instructions
- [ ] Architecture documentation
- [ ] Deployment guide
- [ ] Runbook for operations
- [ ] User guide (if applicable)

---

**Created By:** Senior Enterprise Software Engineer  
**Date:** December 2024  
**Target:** Billion-Dollar Product Standards  
**Status:** Ready for Implementation

---

## 📚 **Best Practices & Common Patterns**

### **1. Service Layer Pattern**

```typescript
@Injectable()
export class FeatureService {
  private readonly logger = new Logger(FeatureService.name);
  
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private audit: AuditService,
  ) {}

  async create(dto: CreateDto, tenantId: string, userId: string): Promise<Entity> {
    // 1. Validate input
    await this.validateInput(dto);
    
    // 2. Check permissions
    await this.checkPermissions(userId, tenantId, 'CREATE');
    
    // 3. Business logic
    const entity = await this.prisma.entity.create({
      data: { ...dto, tenantId, createdBy: userId },
    });
    
    // 4. Invalidate cache
    await this.cache.del(`entity:${tenantId}:${entity.id}`);
    
    // 5. Audit log
    await this.audit.log({
      action: 'ENTITY_CREATED',
      resource: 'Entity',
      resourceId: entity.id,
      userId,
      tenantId,
    });
    
    return entity;
  }
}
```

### **2. Error Handling Pattern**

```typescript
try {
  return await this.operation();
} catch (error) {
  this.logger.error(`Operation failed`, {
    error: error.message,
    stack: error.stack,
    context: { userId, tenantId },
  });
  
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new ConflictException('Resource already exists');
    }
  }
  
  if (error instanceof ValidationError) {
    throw new BadRequestException(error.message);
  }
  
  throw new InternalServerErrorException('Operation failed');
}
```

### **3. Caching Pattern**

```typescript
async getEntity(id: string, tenantId: string): Promise<Entity> {
  const cacheKey = `entity:${tenantId}:${id}`;
  
  // Try cache first
  const cached = await this.cache.get<Entity>(cacheKey);
  if (cached) {
    this.logger.debug(`Cache hit: ${cacheKey}`);
    return cached;
  }
  
  // Fetch from database
  const entity = await this.prisma.entity.findFirst({
    where: { id, tenantId },
  });
  
  if (!entity) {
    throw new NotFoundException(`Entity ${id} not found`);
  }
  
  // Cache result
  await this.cache.set(cacheKey, entity, 300); // 5min TTL
  
  return entity;
}

async updateEntity(id: string, dto: UpdateDto, tenantId: string): Promise<Entity> {
  const entity = await this.update(id, dto, tenantId);
  
  // Invalidate cache
  await this.cache.del(`entity:${tenantId}:${id}`);
  await this.cache.del(`entities:${tenantId}`); // List cache
  
  return entity;
}
```

### **4. Rate Limiting Pattern**

```typescript
@Controller('resources')
@UseGuards(ThrottlerGuard)
export class ResourceController {
  @Get()
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async list(@Request() req) {
    // Endpoint-specific rate limit
  }
  
  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async create(@Request() req) {
    // Stricter limit for mutations
  }
}
```

### **5. Transaction Pattern**

```typescript
async complexOperation(dto: ComplexDto, tenantId: string): Promise<Result> {
  return await this.prisma.$transaction(async (tx) => {
    // Step 1: Create entity
    const entity = await tx.entity.create({
      data: { ...dto, tenantId },
    });
    
    // Step 2: Update related entity
    await tx.relatedEntity.update({
      where: { id: dto.relatedId },
      data: { entityId: entity.id },
    });
    
    // Step 3: Create audit log
    await tx.auditLog.create({
      data: {
        action: 'COMPLEX_OPERATION',
        resourceId: entity.id,
        tenantId,
      },
    });
    
    return { entity };
  });
}
```

### **6. Async Processing Pattern**

```typescript
@Injectable()
export class ProcessingService {
  constructor(
    @InjectQueue('processing') private queue: Queue,
  ) {}

  async processAsync(data: ProcessData): Promise<void> {
    await this.queue.add('process', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}

@Processor('processing')
export class ProcessingProcessor {
  @Process('process')
  async handleProcess(job: Job<ProcessData>) {
    const { data } = job;
    
    try {
      await this.process(data);
      return { success: true };
    } catch (error) {
      this.logger.error(`Processing failed: ${error.message}`);
      throw error; // Will retry
    }
  }
}
```

### **7. Validation Pattern**

```typescript
export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ description: 'Resource name', maxLength: 255 })
  name: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ description: 'Email address', required: false })
  email?: string;

  @IsEnum(ResourceType)
  @ApiProperty({ enum: ResourceType })
  type: ResourceType;

  @IsObject()
  @ValidateNested()
  @Type(() => MetadataDto)
  @ApiProperty({ type: MetadataDto })
  metadata: MetadataDto;
}
```

### **8. Monitoring Pattern**

```typescript
@Injectable()
export class MonitoredService {
  constructor(
    private metrics: PrometheusService,
  ) {}

  async operation(): Promise<Result> {
    const startTime = Date.now();
    
    try {
      const result = await this.execute();
      
      // Record success metric
      this.metrics.increment('operation_success_total', {
        operation: 'operation_name',
      });
      
      // Record duration
      this.metrics.histogram('operation_duration_ms', Date.now() - startTime, {
        operation: 'operation_name',
      });
      
      return result;
    } catch (error) {
      // Record error metric
      this.metrics.increment('operation_error_total', {
        operation: 'operation_name',
        error: error.constructor.name,
      });
      
      throw error;
    }
  }
}
```

### **9. Multi-Tenant Query Pattern**

```typescript
// Always include tenantId in queries
const entities = await this.prisma.entity.findMany({
  where: {
    tenantId, // Always filter by tenant
    ...filters,
  },
});

// Use Prisma middleware for automatic filtering
prisma.$use(async (params, next) => {
  if (params.model && params.action !== 'create') {
    if (!params.args.where) {
      params.args.where = {};
    }
    if (!params.args.where.tenantId && request.tenantId) {
      params.args.where.tenantId = request.tenantId;
    }
  }
  return next(params);
});
```

### **10. Pagination Pattern**

```typescript
async list(
  tenantId: string,
  page: number = 1,
  limit: number = 20,
  filters?: Filters,
): Promise<PaginatedResult<Entity>> {
  const skip = (page - 1) * limit;
  
  const [entities, total] = await Promise.all([
    this.prisma.entity.findMany({
      where: { tenantId, ...filters },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.entity.count({
      where: { tenantId, ...filters },
    }),
  ]);
  
  return {
    data: entities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}
```

---

## 🚨 **Common Pitfalls to Avoid**

### **1. Security Pitfalls**
❌ **Don't:** Trust user input without validation  
✅ **Do:** Validate and sanitize all inputs

❌ **Don't:** Use string concatenation for SQL queries  
✅ **Do:** Use parameterized queries always

❌ **Don't:** Expose internal errors to users  
✅ **Do:** Return generic errors, log details internally

### **2. Performance Pitfalls**
❌ **Don't:** Make N+1 queries  
✅ **Do:** Use DataLoaders or batch queries

❌ **Don't:** Cache everything forever  
✅ **Do:** Use appropriate TTLs and invalidation

❌ **Don't:** Block on async operations  
✅ **Do:** Use queues for long-running tasks

### **3. Scalability Pitfalls**
❌ **Don't:** Store state in memory  
✅ **Do:** Use Redis or database for shared state

❌ **Don't:** Use synchronous operations  
✅ **Do:** Use async/await and queues

❌ **Don't:** Create single points of failure  
✅ **Do:** Design for horizontal scaling

### **4. Reliability Pitfalls**
❌ **Don't:** Ignore errors  
✅ **Do:** Handle all errors gracefully

❌ **Don't:** Retry forever  
✅ **Do:** Use exponential backoff and circuit breakers

❌ **Don't:** Lose data on failures  
✅ **Do:** Use transactions and idempotency

---

## 📖 **Additional Resources**

### **Recommended Reading**
- NestJS Best Practices: https://docs.nestjs.com/
- Prisma Best Practices: https://www.prisma.io/docs/guides/performance-and-optimization
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- PostgreSQL Performance: https://www.postgresql.org/docs/current/performance-tips.html

### **Tools & Libraries**
- **Validation:** class-validator, class-transformer
- **Caching:** Redis, @nestjs/cache-manager
- **Queues:** BullMQ, @nestjs/bullmq
- **Monitoring:** Prometheus, Grafana
- **Logging:** Winston, Pino
- **Testing:** Jest, Supertest, Playwright

---

*These prompts are designed to be used one at a time, each creating a complete, production-ready feature implementation following enterprise best practices and billion-dollar product standards. Each prompt is self-contained and includes all necessary context, requirements, and implementation guidance.*

