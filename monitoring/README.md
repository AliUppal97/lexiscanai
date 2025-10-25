# LexiScan AI - Observability & Monitoring Stack

Comprehensive monitoring and observability solution for enterprise SaaS application.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Dashboards](#dashboards)
- [Alerts](#alerts)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This monitoring stack provides:

- **Metrics Collection**: Prometheus + Node Exporter + cAdvisor
- **Visualization**: Grafana dashboards
- **Distributed Tracing**: Jaeger
- **Log Management**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Alerting**: AlertManager with multi-channel notifications
- **Message Queues**: Redis + RabbitMQ monitoring

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Monitoring    │    │   Observability │
│     Services    │    │     Stack      │    │     Stack       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • API (3001)    │───▶│ • Prometheus    │    │ • Grafana       │
│ • Web (3000)    │    │ • Node Exporter │    │ • Jaeger        │
│ • Dashboard     │    │ • cAdvisor      │    │ • Elasticsearch │
│ • AI Worker     │    │ • Redis Exp.    │    │ • Logstash      │
│ • PDF Gen.      │    │ • Postgres Exp. │    │ • Kibana        │
│ • Nginx         │    │ • AlertManager  │    │ • Filebeat      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Services

### Application Services
| Service | Port | Purpose | Health Check |
|---------|------|---------|--------------|
| API | 3001 | NestJS Backend | `/health` |
| Web | 3000 | Next.js Frontend | `/health` |
| Dashboard | 3002 | React Dashboard | `/health` |
| AI Worker | 8000 | Python AI Service | `/health` |
| PDF Generator | 8001 | Python PDF Service | `/health` |
| Nginx | 80/443 | Reverse Proxy | `/nginx_status` |

### Monitoring Services
| Service | Port | Purpose | Health Check |
|---------|------|---------|--------------|
| Prometheus | 9090 | Metrics Collection | `/-/healthy` |
| Grafana | 3003 | Dashboards | `/api/health` |
| AlertManager | 9093 | Alert Routing | `/-/healthy` |
| Node Exporter | 9100 | System Metrics | `/metrics` |
| cAdvisor | 8080 | Container Metrics | `/metrics` |
| Redis Exporter | 9121 | Redis Metrics | `/metrics` |
| Postgres Exporter | 9187 | DB Metrics | `/metrics` |

### Observability Services
| Service | Port | Purpose | Health Check |
|---------|------|---------|--------------|
| Jaeger | 16686 | Distributed Tracing | `/` |
| Elasticsearch | 9200 | Log Storage | `/_cluster/health` |
| Kibana | 5601 | Log Visualization | `/api/status` |
| Logstash | 9600 | Log Processing | `/_node/stats` |
| Filebeat | - | Log Shipper | - |

### Message Queues
| Service | Port | Purpose | Management UI |
|---------|------|---------|--------------|
| Redis | 6379 | Cache & Queue | - |
| RabbitMQ | 5672 | Message Queue | 15672 |

## 🚀 Quick Start

### 1. Start the Stack
```bash
# Start all services
docker-compose up -d

# Start only monitoring stack
docker-compose up -d prometheus grafana jaeger elasticsearch kibana

# Start only application services
docker-compose up -d api web dashboard ai-worker pdf-generator
```

### 2. Access Services
```bash
# Application
http://localhost:3000    # Web App
http://localhost:3001   # API
http://localhost:3002  # Dashboard

# Monitoring
http://localhost:9090  # Prometheus
http://localhost:3003  # Grafana (admin/admin123)
http://localhost:9093  # AlertManager

# Observability
http://localhost:16686 # Jaeger
http://localhost:5601  # Kibana
http://localhost:9200  # Elasticsearch

# Message Queues
http://localhost:15672 # RabbitMQ Management (lexiscan/lexiscan_password)
```

### 3. Verify Health
```bash
# Check all services
docker-compose ps

# Check logs
docker-compose logs prometheus
docker-compose logs grafana
docker-compose logs elasticsearch

# Test metrics
curl http://localhost:9090/api/v1/targets
curl http://localhost:3001/metrics
```

## ⚙️ Configuration

### Prometheus Configuration
**File**: `monitoring/prometheus/prometheus.yml`

**Key Features**:
- Service discovery for all applications
- 15-day data retention
- Alert rule evaluation
- Federation support

**Scrape Targets**:
- Application services (API, Web, Dashboard, Workers)
- System metrics (Node Exporter, cAdvisor)
- Database metrics (PostgreSQL, Redis)
- Infrastructure (Nginx, Docker)

### Alert Rules
**File**: `monitoring/prometheus/rules/lexiscan-alerts.yml`

**Alert Categories**:
- **Application Health**: Service down, high error rate, slow response
- **Performance**: CPU, memory, disk usage
- **Database**: Connection issues, slow queries
- **Security**: Failed logins, suspicious activity
- **Infrastructure**: Elasticsearch, Prometheus, Grafana

**Severity Levels**:
- **Critical**: Service down, security breaches
- **Warning**: Performance issues, resource usage

### AlertManager Configuration
**File**: `monitoring/alertmanager/alertmanager.yml`

**Notification Channels**:
- **Email**: ops@lexiscan.ai, oncall@lexiscan.ai
- **Slack**: #alerts-critical, #database-alerts, #security-alerts
- **PagerDuty**: Critical alerts (if configured)

**Routing Rules**:
- Critical alerts → Immediate notification
- Database alerts → DBA team
- Security alerts → Security team
- Performance alerts → Development team

### Grafana Configuration
**Data Sources**:
- Prometheus (default)
- AlertManager
- Jaeger (tracing)
- Elasticsearch (logs)

**Dashboard Provisioning**:
- Auto-discovery from `/var/lib/grafana/dashboards`
- Folder organization
- Permission management

### ELK Stack Configuration

#### Elasticsearch
- Single-node cluster
- 1GB heap size
- Security disabled (development)
- Index templates for logstash

#### Logstash Pipeline
**File**: `monitoring/logstash/pipeline/lexiscan.conf`

**Input Sources**:
- Filebeat (port 5044)
- TCP (port 5000)
- UDP (port 5000)

**Log Processing**:
- JSON log parsing
- Structured log parsing
- HTTP access log parsing
- Error log detection
- Security event tagging
- Performance event tagging
- Sensitive data removal

#### Filebeat
**File**: `monitoring/filebeat/filebeat.yml`

**Log Sources**:
- Docker container logs
- Application log files
- System logs

**Features**:
- Multi-line log handling
- Docker metadata enrichment
- Kubernetes metadata (if available)
- Log rotation support

#### Kibana
**File**: `monitoring/kibana/kibana.yml`

**Features**:
- Elasticsearch integration
- Index pattern auto-discovery
- Dashboard templates
- Security configuration

## 📊 Dashboards

### System Overview Dashboard
**URL**: http://localhost:3003/d/overview

**Panels**:
- System Status (up/down indicators)
- Request Rate (requests per second)
- Response Time (95th percentile)
- Error Rate (5xx errors)
- CPU Usage
- Memory Usage
- Disk Usage

### Application Dashboard
**URL**: http://localhost:3003/d/application

**Panels**:
- API Endpoints Performance
- Database Query Performance
- Cache Hit Rates
- Queue Lengths
- Worker Performance
- Document Processing Metrics

### Infrastructure Dashboard
**URL**: http://localhost:3003/d/infrastructure

**Panels**:
- Container Metrics
- Network I/O
- Disk I/O
- System Load
- Service Dependencies
- Health Checks

### Security Dashboard
**URL**: http://localhost:3003/d/security

**Panels**:
- Failed Login Attempts
- API Authentication Failures
- Suspicious Activity
- Security Events
- Access Patterns

## 🚨 Alerts

### Critical Alerts (Immediate Notification)
- Service Down
- PostgreSQL Down
- Redis Down
- High Failed Login Attempts
- Disk Space Low

### Warning Alerts (Delayed Notification)
- High CPU Usage
- High Memory Usage
- High Response Time
- High Error Rate
- Slow Database Queries

### Alert Channels
1. **Email**: ops@lexiscan.ai, oncall@lexiscan.ai
2. **Slack**: #alerts-critical, #database-alerts, #security-alerts
3. **PagerDuty**: Critical alerts (if configured)

## 🔍 Logging

### Log Sources
- **Application Logs**: API, Web, Dashboard, Workers
- **System Logs**: Docker, Nginx, System
- **Database Logs**: PostgreSQL, Redis
- **Infrastructure Logs**: Prometheus, Grafana, Elasticsearch

### Log Processing
1. **Collection**: Filebeat collects logs from containers
2. **Processing**: Logstash parses and enriches logs
3. **Storage**: Elasticsearch indexes logs
4. **Visualization**: Kibana provides log analysis

### Log Patterns
- **Structured Logs**: JSON format with fields
- **Unstructured Logs**: Plain text with grok patterns
- **Error Logs**: Tagged with error level
- **Security Logs**: Tagged with security events
- **Performance Logs**: Tagged with performance events

## 🔍 Tracing

### Jaeger Integration
- **Distributed Tracing**: Request flow across services
- **Performance Analysis**: Latency breakdown
- **Dependency Mapping**: Service relationships
- **Error Tracking**: Failed request traces

### Trace Context
- **Request ID**: Unique identifier per request
- **User ID**: Authenticated user context
- **Service Name**: Source service identification
- **Operation**: API endpoint or function

## 📈 Metrics

### Application Metrics
- **HTTP Requests**: Rate, duration, status codes
- **Database Queries**: Count, duration, errors
- **Cache Operations**: Hit rate, miss rate
- **Queue Operations**: Length, processing time
- **Business Metrics**: Documents processed, users active

### System Metrics
- **CPU Usage**: Per core, per container
- **Memory Usage**: RSS, heap, swap
- **Disk I/O**: Read/write rates, latency
- **Network I/O**: Bytes in/out, packets
- **File System**: Usage, inodes, errors

### Custom Metrics
- **Document Processing**: Time, success rate
- **User Activity**: Login, actions, sessions
- **API Usage**: Endpoints, rate limits
- **Error Rates**: By service, by endpoint
- **Performance**: Response times, throughput

## 🛠️ Troubleshooting

### Common Issues

**1. Prometheus Not Scraping**
```bash
# Check targets
curl http://localhost:9090/api/v1/targets

# Check service discovery
curl http://localhost:9090/api/v1/discovery
```

**2. Grafana Can't Connect to Prometheus**
```bash
# Check Prometheus health
curl http://localhost:9090/-/healthy

# Check network connectivity
docker exec grafana ping prometheus
```

**3. Elasticsearch Not Starting**
```bash
# Check logs
docker-compose logs elasticsearch

# Check memory
docker stats elasticsearch

# Increase memory if needed
# Edit docker-compose.yml: ES_JAVA_OPTS="-Xms2g -Xmx2g"
```

**4. Logs Not Appearing in Kibana**
```bash
# Check Logstash
curl http://localhost:9600/_node/stats

# Check Elasticsearch indices
curl http://localhost:9200/_cat/indices

# Check Filebeat
docker-compose logs filebeat
```

**5. Alerts Not Firing**
```bash
# Check AlertManager
curl http://localhost:9093/api/v1/alerts

# Check Prometheus rules
curl http://localhost:9090/api/v1/rules

# Check notification channels
curl http://localhost:9093/api/v1/receivers
```

### Debug Commands

```bash
# Check all services
docker-compose ps

# Check logs for specific service
docker-compose logs -f prometheus
docker-compose logs -f grafana
docker-compose logs -f elasticsearch

# Check network connectivity
docker network ls
docker network inspect lexiscan-monitoring-network

# Check volumes
docker volume ls
docker volume inspect lexiscan_prometheus_data

# Restart specific service
docker-compose restart prometheus
docker-compose restart grafana
```

### Performance Tuning

**Elasticsearch**:
```yaml
# Increase heap size
ES_JAVA_OPTS: "-Xms2g -Xmx2g"

# Increase memory limits
deploy:
  resources:
    limits:
      memory: 4G
```

**Prometheus**:
```yaml
# Increase retention
command:
  - '--storage.tsdb.retention.time=30d'
  - '--storage.tsdb.retention.size=20GB'
```

**Grafana**:
```yaml
# Increase memory
deploy:
  resources:
    limits:
      memory: 1G
```

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [ELK Stack Documentation](https://www.elastic.co/guide/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**Last Updated**: December 2024  
**Maintained By**: LexiScan AI Platform Team  
**Version**: 1.0.0
