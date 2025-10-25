# LexiScan AI - Observability & Monitoring Stack

Comprehensive observability solution for enterprise SaaS application with advanced monitoring, logging, and tracing capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Components](#components)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Dashboards](#dashboards)
- [Alerts](#alerts)
- [Logging](#logging)
- [Tracing](#tracing)
- [Best Practices](#best-practices)

## 🎯 Overview

This observability stack provides:

- **📊 Dashboards**: Grafana dashboards for API, Frontend, and Business metrics
- **🚨 Alerts**: Comprehensive alerting for API, Database, and Error rates
- **📝 Logging**: Structured logging with Winston, formatters, and aggregation
- **🔍 Tracing**: Distributed tracing with OpenTelemetry and Jaeger
- **📈 Metrics**: Performance monitoring and business intelligence

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Observability │    │   Visualization │
│     Services    │    │     Stack      │    │     Layer       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • API (3001)    │───▶│ • Prometheus    │    │ • Grafana       │
│ • Web (3000)    │    │ • Jaeger        │    │ • Kibana        │
│ • Dashboard     │    │ • Elasticsearch │    │ • AlertManager  │
│ • AI Worker     │    │ • Logstash      │    │ • Dashboards    │
│ • PDF Gen.      │    │ • Filebeat      │    │ • Alerts        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🧩 Components

### 📊 Dashboards
- **API Dashboard**: Performance, health, and business metrics
- **Frontend Dashboard**: User experience and web vitals
- **Business Dashboard**: KPIs, revenue, and user analytics

### 🚨 Alerts
- **API Alerts**: Service health, performance, and error rates
- **Database Alerts**: Connection, performance, and storage issues
- **Error Rate Alerts**: Application, security, and business errors

### 📝 Logging
- **Winston Config**: Centralized logging configuration
- **Log Formatter**: Structured logging with business context
- **Log Aggregator**: Real-time log analysis and correlation

### 🔍 Tracing
- **OpenTelemetry Config**: Distributed tracing setup
- **Trace Exporter**: Multi-backend trace export

## 🚀 Quick Start

### 1. Start the Stack
```bash
# Start all services
docker-compose up -d

# Start only observability stack
docker-compose up -d prometheus grafana jaeger elasticsearch kibana
```

### 2. Access Services
```bash
# Dashboards
http://localhost:3003  # Grafana (admin/admin123)
http://localhost:5601  # Kibana

# Tracing
http://localhost:16686 # Jaeger

# Metrics
http://localhost:9090  # Prometheus
http://localhost:9093  # AlertManager
```

### 3. Import Dashboards
```bash
# Import Grafana dashboards
curl -X POST http://admin:admin123@localhost:3003/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @ops/observability/dashboards/api-dashboard.json
```

## ⚙️ Configuration

### Dashboard Configuration

#### API Dashboard
**File**: `ops/observability/dashboards/api-dashboard.json`

**Key Metrics**:
- Service health status
- Request rate (RPS)
- Response time (95th percentile)
- Error rate
- Active connections
- Memory usage
- Database connection pool
- Cache performance
- Queue processing

#### Frontend Dashboard
**File**: `ops/observability/dashboards/frontend-dashboard.json`

**Key Metrics**:
- Page load time
- User sessions
- Core Web Vitals (LCP, FID, CLS)
- JavaScript errors
- API calls from frontend
- Resource loading
- User interactions
- Browser performance

#### Business Dashboard
**File**: `ops/observability/dashboards/business-metrics.json`

**Key Metrics**:
- Active users (24h)
- Documents processed (24h)
- Revenue (24h)
- API usage (24h)
- User growth trend
- Document processing volume
- Revenue trends
- Feature usage
- Customer segments
- Geographic distribution

### Alert Configuration

#### API Alerts
**File**: `ops/observability/alerts/api-alerts.yaml`

**Alert Categories**:
- **Service Health**: Service down, unhealthy
- **Performance**: High response time, low throughput
- **Error Rates**: 5xx errors, 4xx errors
- **Resource Usage**: Memory, CPU, connection pool
- **Security**: Failed auth, suspicious activity
- **Business Logic**: Document processing, queue backlog
- **Dependencies**: Database, cache, external services

#### Database Alerts
**File**: `ops/observability/alerts/database-alerts.yaml`

**Alert Categories**:
- **Health**: Database down, connection refused
- **Performance**: Slow queries, high CPU, high I/O
- **Connections**: High usage, pool exhausted, timeouts
- **Storage**: Disk space, WAL size
- **Replication**: Lag, down
- **Locks**: High lock count, deadlocks
- **Transactions**: Long-running, high rollback rate
- **Cache**: Low hit rate, size issues

#### Error Rate Alerts
**File**: `ops/observability/alerts/error-rate-alerts.yaml`

**Alert Categories**:
- **HTTP Errors**: 5xx, 4xx, 503 errors
- **Application Errors**: Unhandled exceptions, memory errors
- **Database Errors**: Connection, query, timeout
- **External Service Errors**: Timeouts, rate limits
- **Business Logic Errors**: Document processing, AI processing
- **Cache Errors**: Connection, timeout
- **Queue Errors**: Processing failures, dead letters
- **Security Errors**: Authentication, authorization, violations

### Logging Configuration

#### Winston Configuration
**File**: `ops/observability/logging/winston-config.ts`

**Features**:
- **Structured Logging**: JSON format with business context
- **Multiple Transports**: Console, file, remote
- **Security Filtering**: Removes sensitive data
- **Performance Metrics**: Adds system metrics
- **Business Logging**: Specialized business events
- **Security Logging**: Authentication and security events
- **Audit Logging**: Compliance and auditing

#### Log Formatter
**File**: `ops/observability/logging/log-formatter.ts`

**Features**:
- **Business Context**: User, organization, request tracking
- **Performance Metrics**: Duration, memory, CPU usage
- **Security Context**: IP, user agent, risk scoring
- **Error Formatting**: Standardized error logging
- **Compliance**: GDPR, SOX, HIPAA compliance
- **Custom Formatters**: JSON, human-readable, Elasticsearch

#### Log Aggregator
**File**: `ops/observability/logging/log-aggregator.ts`

**Features**:
- **Real-time Aggregation**: Live log analysis
- **Log Correlation**: Request ID tracking
- **Business Metrics**: User activity, feature usage
- **Performance Analysis**: Error patterns, performance trends
- **Security Analysis**: Threat detection, anomaly detection

### Tracing Configuration

#### OpenTelemetry Configuration
**File**: `ops/observability/tracing/opentelemetry-config.ts`

**Features**:
- **Automatic Instrumentation**: HTTP, Express, NestJS, Prisma, Redis
- **Custom Decorators**: @Trace, @TraceDatabase, @TraceHTTP, @TraceBusiness
- **Span Creation**: Document processing, authentication, API calls
- **Context Propagation**: Request ID, user ID, business context
- **Performance Tracking**: Duration, memory, CPU metrics

#### Trace Exporter
**File**: `ops/observability/tracing/trace-exporter.ts`

**Features**:
- **Multi-backend Export**: Jaeger, Zipkin, OTLP
- **Trace Filtering**: Service, operation, duration filters
- **Batch Processing**: Efficient batch processing
- **Retry Logic**: Exponential backoff for failed exports
- **Custom Transformation**: Business context, performance metrics

## 📊 Dashboards

### API Performance Dashboard
**URL**: http://localhost:3003/d/api-dashboard

**Panels**:
- **Service Health**: Up/down status indicators
- **Request Rate**: Requests per second by endpoint
- **Response Time**: 95th and 50th percentile response times
- **Error Rate**: 5xx and 4xx error rates
- **Active Connections**: Node.js handles and requests
- **Memory Usage**: Heap usage and total memory
- **Database Pool**: Active, idle, and total connections
- **Cache Performance**: Redis operations and hit rates
- **Queue Processing**: Job processing rates and queue length
- **API Endpoints**: Top performing endpoints
- **Slow Queries**: Database query performance

### Frontend Performance Dashboard
**URL**: http://localhost:3003/d/frontend-dashboard

**Panels**:
- **Service Health**: Frontend service status
- **Page Load Time**: 95th and 50th percentile load times
- **User Sessions**: New and active sessions
- **Core Web Vitals**: LCP, FID, CLS metrics
- **JavaScript Errors**: Error rates and fatal errors
- **API Calls**: Frontend API usage and failures
- **Resource Loading**: CSS, JS, and image loading
- **User Interactions**: Clicks, forms, navigation
- **Browser Performance**: TTFB, DOM content loaded
- **Top Pages**: Most visited pages
- **Browser Distribution**: User browser breakdown
- **Geographic Distribution**: User location mapping

### Business Metrics Dashboard
**URL**: http://localhost:3003/d/business-dashboard

**Panels**:
- **Active Users**: 24-hour active user count
- **Documents Processed**: 24-hour document processing
- **Revenue**: 24-hour revenue tracking
- **API Usage**: 24-hour API call volume
- **User Growth**: New and active user trends
- **Document Volume**: Processing rates and success/failure
- **Revenue Trends**: Hourly revenue and subscriptions
- **Feature Usage**: Document upload, AI analysis, export, collaboration
- **Customer Segments**: User distribution by segment
- **Geographic Distribution**: Global user mapping
- **Subscription Metrics**: Active, trial, enterprise subscriptions
- **Churn Rate**: Customer churn percentage
- **Customer Satisfaction**: CSAT score tracking
- **Top Features**: Most used features ranking

## 🚨 Alerts

### Alert Categories

#### Critical Alerts (Immediate Notification)
- **Service Down**: API, database, or frontend services
- **High Error Rate**: 5xx errors exceeding 10%
- **Database Issues**: Connection pool exhausted, slow queries
- **Security Breaches**: High failed logins, suspicious activity
- **Storage Issues**: Disk space critical (< 10%)

#### Warning Alerts (Delayed Notification)
- **Performance Issues**: High response time, low throughput
- **Resource Usage**: High CPU, memory, or connection usage
- **Business Logic**: Document processing failures, queue backlog
- **External Dependencies**: Slow external API calls, cache misses

### Alert Channels
1. **Email**: ops@lexiscan.ai, oncall@lexiscan.ai
2. **Slack**: #alerts-critical, #database-alerts, #security-alerts
3. **PagerDuty**: Critical alerts (configurable)

### Alert Rules
- **Service Health**: Up/down monitoring with 1-minute threshold
- **Performance**: Response time > 2s (warning), > 5s (critical)
- **Error Rates**: 5xx > 5% (warning), > 10% (critical)
- **Resource Usage**: CPU > 80%, Memory > 90%, Disk < 20%
- **Business Metrics**: Document processing failures > 10%

## 📝 Logging

### Log Types

#### Application Logs
- **API Logs**: Request/response, errors, performance
- **Frontend Logs**: User interactions, errors, performance
- **Worker Logs**: Background job processing, AI operations
- **Database Logs**: Query performance, connection issues

#### Business Logs
- **User Actions**: Login, document upload, feature usage
- **Document Processing**: Upload, analysis, export
- **Subscription Events**: Plan changes, billing events
- **API Usage**: Endpoint calls, rate limiting

#### Security Logs
- **Authentication**: Login attempts, failures, successes
- **Authorization**: Permission checks, access denials
- **Security Events**: Suspicious activity, threats
- **Audit Events**: Data access, modifications

#### Performance Logs
- **Slow Queries**: Database query performance
- **API Performance**: Response times, throughput
- **Cache Performance**: Hit rates, misses
- **System Metrics**: CPU, memory, disk usage

### Log Processing

#### Collection
- **Filebeat**: Collects logs from Docker containers
- **Winston**: Structured logging from applications
- **Custom Collectors**: Business-specific log collection

#### Processing
- **Logstash**: Parses and enriches logs
- **Security Filtering**: Removes sensitive data
- **Business Context**: Adds user, organization context
- **Performance Metrics**: Adds system metrics

#### Storage
- **Elasticsearch**: Indexes and stores logs
- **Index Templates**: Optimized for log analysis
- **Retention Policies**: 30-day retention for compliance

#### Visualization
- **Kibana**: Log analysis and visualization
- **Dashboards**: Pre-built log analysis dashboards
- **Saved Searches**: Common log queries
- **Alerts**: Log-based alerting

## 🔍 Tracing

### Trace Types

#### Request Traces
- **API Requests**: End-to-end request tracing
- **Database Queries**: Query performance and errors
- **External Calls**: Third-party API performance
- **Cache Operations**: Redis performance and errors

#### Business Traces
- **Document Processing**: Upload to completion
- **User Workflows**: Login to feature usage
- **Subscription Flows**: Signup to billing
- **AI Operations**: Model inference and training

#### Performance Traces
- **Slow Operations**: Operations exceeding thresholds
- **Error Traces**: Failed operations with context
- **Resource Usage**: Memory and CPU tracking
- **Dependency Traces**: Service dependency mapping

### Trace Analysis

#### Correlation
- **Request ID**: Correlates all related operations
- **User ID**: Tracks user-specific operations
- **Session ID**: Groups user session activities
- **Business Context**: Links business operations

#### Performance Analysis
- **Duration Analysis**: Identifies slow operations
- **Dependency Analysis**: Maps service dependencies
- **Error Analysis**: Tracks error propagation
- **Resource Analysis**: Identifies resource bottlenecks

#### Business Analysis
- **User Journeys**: Tracks user workflows
- **Feature Usage**: Monitors feature adoption
- **Performance Impact**: Measures feature performance
- **Error Impact**: Tracks business impact of errors

## 🛠️ Best Practices

### Dashboard Design
- **Single Responsibility**: Each dashboard focuses on one area
- **Key Metrics First**: Most important metrics at the top
- **Visual Hierarchy**: Use colors and sizes to highlight important data
- **Time Ranges**: Appropriate time ranges for different metrics
- **Refresh Rates**: Balance between real-time and performance

### Alert Design
- **Threshold Tuning**: Set appropriate thresholds based on baselines
- **Alert Fatigue**: Avoid too many alerts, use severity levels
- **Runbook Integration**: Link alerts to runbooks and documentation
- **Escalation Policies**: Define clear escalation procedures
- **Alert Grouping**: Group related alerts to reduce noise

### Logging Best Practices
- **Structured Logging**: Use JSON format for machine readability
- **Context Enrichment**: Add business and technical context
- **Security**: Remove sensitive data, use proper log levels
- **Performance**: Avoid logging in hot paths, use async logging
- **Retention**: Implement appropriate retention policies

### Tracing Best Practices
- **Sampling**: Use appropriate sampling rates for production
- **Context Propagation**: Ensure trace context is propagated
- **Span Naming**: Use consistent and meaningful span names
- **Attributes**: Add relevant attributes for analysis
- **Error Handling**: Properly handle and report errors in traces

### Monitoring Best Practices
- **SLI/SLO**: Define service level indicators and objectives
- **Baseline Establishment**: Establish performance baselines
- **Trend Analysis**: Monitor trends over time
- **Capacity Planning**: Use metrics for capacity planning
- **Incident Response**: Integrate with incident response procedures

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [ELK Stack Documentation](https://www.elastic.co/guide/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Winston Documentation](https://github.com/winstonjs/winston)

---

**Last Updated**: December 2024  
**Maintained By**: LexiScan AI Platform Team  
**Version**: 1.0.0
