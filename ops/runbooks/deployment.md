# LexiScan AI - Deployment Runbook

## 🚀 Overview

This runbook provides comprehensive procedures for deploying the LexiScan AI platform across different environments. It covers pre-deployment checks, deployment procedures, post-deployment validation, and rollback procedures.

## 📋 Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Deployment Procedures](#deployment-procedures)
- [Environment-Specific Procedures](#environment-specific-procedures)
- [Post-Deployment Validation](#post-deployment-validation)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## ✅ Pre-Deployment Checklist

### Code Quality Checks

#### 1. Code Review
- [ ] All code changes reviewed and approved
- [ ] No critical security vulnerabilities
- [ ] Performance impact assessed
- [ ] Database migrations reviewed
- [ ] API changes documented

#### 2. Testing
- [ ] Unit tests passing (coverage > 80%)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance tests completed
- [ ] Security tests completed

#### 3. Documentation
- [ ] API documentation updated
- [ ] Database schema changes documented
- [ ] Configuration changes documented
- [ ] Runbook procedures updated
- [ ] User documentation updated

### Infrastructure Checks

#### 1. Resource Requirements
- [ ] CPU requirements met
- [ ] Memory requirements met
- [ ] Disk space available
- [ ] Network capacity sufficient
- [ ] Database capacity adequate

#### 2. Dependencies
- [ ] All external services available
- [ ] Database migrations ready
- [ ] Cache systems operational
- [ ] Message queues healthy
- [ ] Monitoring systems active

#### 3. Security
- [ ] SSL certificates valid
- [ ] Security configurations updated
- [ ] Access controls verified
- [ ] Audit logging enabled
- [ ] Compliance requirements met

## 🚀 Deployment Procedures

### Development Environment

#### 1. Build and Test
```bash
# Build all services
docker-compose build

# Run tests
docker-compose run --rm api npm test
docker-compose run --rm web npm test
docker-compose run --rm dashboard npm test

# Run integration tests
docker-compose run --rm api npm run test:integration
```

#### 2. Deploy to Development
```bash
# Stop existing services
docker-compose down

# Pull latest images
docker-compose pull

# Start services
docker-compose up -d

# Wait for services to be healthy
docker-compose ps
```

#### 3. Validate Deployment
```bash
# Check service health
curl -f http://localhost:3001/health
curl -f http://localhost:3000/health
curl -f http://localhost:3002/health

# Check database
docker-compose exec postgres psql -U lexiscan -d lexiscan -c "SELECT version();"

# Check logs
docker-compose logs --tail=100 api
docker-compose logs --tail=100 web
```

### Staging Environment

#### 1. Pre-Deployment
```bash
# Backup current state
docker-compose exec postgres pg_dump -U lexiscan lexiscan > backup-$(date +%Y%m%d-%H%M%S).sql

# Check staging environment
curl -f https://staging-api.lexiscan.ai/health
curl -f https://staging.lexiscan.ai/health
```

#### 2. Deploy to Staging
```bash
# Deploy API
kubectl apply -f infra/k8s/deployments/api-deployment.yaml
kubectl rollout status deployment/lexiscan-api

# Deploy Web
kubectl apply -f infra/k8s/deployments/web-deployment.yaml
kubectl rollout status deployment/lexiscan-web

# Deploy Dashboard
kubectl apply -f infra/k8s/deployments/dashboard-deployment.yaml
kubectl rollout status deployment/lexiscan-dashboard
```

#### 3. Database Migrations
```bash
# Run database migrations
kubectl exec -it deployment/lexiscan-api -- npm run migrate:up

# Verify migrations
kubectl exec -it deployment/lexiscan-api -- npm run migrate:status
```

#### 4. Validate Staging
```bash
# Health checks
curl -f https://staging-api.lexiscan.ai/health
curl -f https://staging.lexiscan.ai/health
curl -f https://staging-dashboard.lexiscan.ai/health

# Performance tests
kubectl exec -it deployment/lexiscan-api -- npm run test:performance

# Load tests
kubectl exec -it deployment/lexiscan-api -- npm run test:load
```

### Production Environment

#### 1. Pre-Production Checklist
- [ ] Staging deployment successful
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Backup procedures verified
- [ ] Rollback plan tested
- [ ] Team notified
- [ ] Monitoring alerts configured

#### 2. Production Deployment
```bash
# Blue-Green Deployment
# Deploy to green environment
kubectl apply -f infra/k8s/deployments/api-deployment-green.yaml
kubectl rollout status deployment/lexiscan-api-green

# Run smoke tests
kubectl exec -it deployment/lexiscan-api-green -- npm run test:smoke

# Switch traffic to green
kubectl patch service lexiscan-api -p '{"spec":{"selector":{"version":"green"}}}'

# Monitor for 10 minutes
kubectl get pods -l app=lexiscan-api,version=green
kubectl logs -f deployment/lexiscan-api-green
```

#### 3. Database Migrations (Production)
```bash
# Backup production database
kubectl exec -it deployment/lexiscan-postgres -- pg_dump -U lexiscan lexiscan > prod-backup-$(date +%Y%m%d-%H%M%S).sql

# Run migrations with zero-downtime
kubectl exec -it deployment/lexiscan-api-green -- npm run migrate:up

# Verify migrations
kubectl exec -it deployment/lexiscan-api-green -- npm run migrate:status
```

#### 4. Post-Deployment Validation
```bash
# Health checks
curl -f https://api.lexiscan.ai/health
curl -f https://lexiscan.ai/health
curl -f https://dashboard.lexiscan.ai/health

# Performance monitoring
curl https://api.lexiscan.ai/metrics | grep -E "(response_time|error_rate|throughput)"

# User acceptance testing
# Test critical user flows
# Verify all features working
# Check performance metrics
```

## 🌍 Environment-Specific Procedures

### Development Environment

#### Configuration
```yaml
# docker-compose.override.yml
version: '3.8'
services:
  api:
    environment:
      NODE_ENV: development
      LOG_LEVEL: debug
      DATABASE_URL: postgresql://lexiscan:lexiscan_password@postgres:5432/lexiscan
    volumes:
      - ./apps/api:/app
      - /app/node_modules
    command: npm run start:dev
```

#### Deployment Steps
1. **Code Changes**: Developer makes changes locally
2. **Testing**: Run tests locally
3. **Build**: Build Docker images
4. **Deploy**: Deploy to development environment
5. **Validate**: Check functionality and logs

### Staging Environment

#### Configuration
```yaml
# staging-values.yaml
api:
  replicas: 2
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 1000m
      memory: 2Gi
  environment:
    NODE_ENV: staging
    LOG_LEVEL: info
    DATABASE_URL: postgresql://lexiscan:staging_password@postgres:5432/lexiscan
```

#### Deployment Steps
1. **Build**: Build production images
2. **Test**: Run comprehensive tests
3. **Deploy**: Deploy to staging
4. **Validate**: Run integration tests
5. **Monitor**: Monitor for issues

### Production Environment

#### Configuration
```yaml
# production-values.yaml
api:
  replicas: 5
  resources:
    requests:
      cpu: 1000m
      memory: 2Gi
    limits:
      cpu: 2000m
      memory: 4Gi
  environment:
    NODE_ENV: production
    LOG_LEVEL: warn
    DATABASE_URL: postgresql://lexiscan:prod_password@postgres:5432/lexiscan
```

#### Deployment Steps
1. **Pre-deployment**: Complete checklist
2. **Backup**: Backup current state
3. **Deploy**: Blue-green deployment
4. **Validate**: Comprehensive testing
5. **Monitor**: 24-hour monitoring

## ✅ Post-Deployment Validation

### Health Checks

#### 1. Service Health
```bash
# API Health
curl -f https://api.lexiscan.ai/health
curl -f https://api.lexiscan.ai/health/detailed

# Web Health
curl -f https://lexiscan.ai/health
curl -f https://lexiscan.ai/health/detailed

# Dashboard Health
curl -f https://dashboard.lexiscan.ai/health
curl -f https://dashboard.lexiscan.ai/health/detailed
```

#### 2. Database Health
```bash
# Database connectivity
kubectl exec -it deployment/lexiscan-api -- npm run db:health

# Database performance
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT * FROM pg_stat_activity;"

# Database size
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT pg_size_pretty(pg_database_size('lexiscan'));"
```

#### 3. Cache Health
```bash
# Redis connectivity
kubectl exec -it deployment/lexiscan-redis -- redis-cli ping

# Redis performance
kubectl exec -it deployment/lexiscan-redis -- redis-cli info stats

# Cache hit rate
kubectl exec -it deployment/lexiscan-redis -- redis-cli info stats | grep hit_rate
```

### Performance Validation

#### 1. Response Time
```bash
# API response time
curl -w "@curl-format.txt" -o /dev/null -s https://api.lexiscan.ai/health

# Web response time
curl -w "@curl-format.txt" -o /dev/null -s https://lexiscan.ai/

# Dashboard response time
curl -w "@curl-format.txt" -o /dev/null -s https://dashboard.lexiscan.ai/
```

#### 2. Throughput
```bash
# Load testing
kubectl exec -it deployment/lexiscan-api -- npm run test:load

# Performance benchmarks
kubectl exec -it deployment/lexiscan-api -- npm run test:performance
```

#### 3. Error Rate
```bash
# Check error rates
curl https://api.lexiscan.ai/metrics | grep -E "http_requests_total.*5.."

# Check application errors
kubectl logs deployment/lexiscan-api | grep -i error | tail -20
```

### Functional Validation

#### 1. Core Features
- [ ] User authentication working
- [ ] Document upload functional
- [ ] AI processing working
- [ ] Export features working
- [ ] Dashboard accessible
- [ ] API endpoints responding

#### 2. Business Logic
- [ ] User registration working
- [ ] Subscription management functional
- [ ] Billing integration working
- [ ] Email notifications sending
- [ ] Audit logging active
- [ ] Security features working

#### 3. Integration Points
- [ ] Database connections stable
- [ ] Cache operations working
- [ ] Message queues processing
- [ ] External API calls working
- [ ] File storage accessible
- [ ] Monitoring systems active

## 🔄 Rollback Procedures

### Immediate Rollback (0-5 minutes)

#### 1. Traffic Switch
```bash
# Switch traffic back to blue
kubectl patch service lexiscan-api -p '{"spec":{"selector":{"version":"blue"}}}'

# Verify traffic switch
kubectl get pods -l app=lexiscan-api,version=blue
```

#### 2. Health Verification
```bash
# Check service health
curl -f https://api.lexiscan.ai/health
curl -f https://lexiscan.ai/health

# Check error rates
curl https://api.lexiscan.ai/metrics | grep -E "http_requests_total.*5.."
```

### Database Rollback (5-15 minutes)

#### 1. Database Rollback
```bash
# Rollback database migrations
kubectl exec -it deployment/lexiscan-api -- npm run migrate:down

# Verify rollback
kubectl exec -it deployment/lexiscan-api -- npm run migrate:status
```

#### 2. Data Validation
```bash
# Check database integrity
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM users;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM documents;"
```

### Complete Rollback (15-30 minutes)

#### 1. Service Rollback
```bash
# Rollback to previous version
kubectl rollout undo deployment/lexiscan-api
kubectl rollout undo deployment/lexiscan-web
kubectl rollout undo deployment/lexiscan-dashboard

# Verify rollback
kubectl rollout status deployment/lexiscan-api
kubectl rollout status deployment/lexiscan-web
kubectl rollout status deployment/lexiscan-dashboard
```

#### 2. Full Validation
```bash
# Complete health checks
curl -f https://api.lexiscan.ai/health
curl -f https://lexiscan.ai/health
curl -f https://dashboard.lexiscan.ai/health

# Performance validation
curl -w "@curl-format.txt" -o /dev/null -s https://api.lexiscan.ai/health

# Functional testing
# Test all critical user flows
# Verify all features working
# Check performance metrics
```

## 🔧 Troubleshooting

### Common Deployment Issues

#### 1. Service Won't Start
```bash
# Check pod status
kubectl get pods -l app=lexiscan-api
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>
kubectl logs <pod-name> --previous

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp
```

#### 2. Database Connection Issues
```bash
# Check database connectivity
kubectl exec -it deployment/lexiscan-api -- npm run db:health

# Check database logs
kubectl logs deployment/lexiscan-postgres

# Check network connectivity
kubectl exec -it deployment/lexiscan-api -- nslookup postgres
```

#### 3. Performance Issues
```bash
# Check resource usage
kubectl top pods
kubectl top nodes

# Check application metrics
curl https://api.lexiscan.ai/metrics | grep -E "(cpu|memory|response_time)"

# Check database performance
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT * FROM pg_stat_activity;"
```

### Recovery Procedures

#### 1. Service Recovery
```bash
# Restart failing services
kubectl rollout restart deployment/lexiscan-api
kubectl rollout restart deployment/lexiscan-web

# Scale services if needed
kubectl scale deployment lexiscan-api --replicas=3
kubectl scale deployment lexiscan-web --replicas=3
```

#### 2. Database Recovery
```bash
# Restart database
kubectl rollout restart deployment/lexiscan-postgres

# Check database health
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT version();"
```

#### 3. Cache Recovery
```bash
# Restart cache
kubectl rollout restart deployment/lexiscan-redis

# Clear cache if needed
kubectl exec -it deployment/lexiscan-redis -- redis-cli FLUSHALL
```

## 📊 Monitoring and Alerts

### Deployment Monitoring
- **Service Health**: Monitor service availability
- **Performance**: Track response times and throughput
- **Errors**: Monitor error rates and types
- **Resources**: Track CPU, memory, and disk usage
- **Dependencies**: Monitor database, cache, and external services

### Alert Configuration
```yaml
# deployment-alerts.yaml
groups:
  - name: deployment
    rules:
      - alert: DeploymentFailed
        expr: kube_deployment_status_replicas_available < kube_deployment_spec_replicas
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Deployment {{ $labels.deployment }} has failed"
          description: "Deployment {{ $labels.deployment }} in namespace {{ $labels.namespace }} has {{ $value }} available replicas"
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Monitoring Dashboards](http://localhost:3003)
- [Incident Response](ops/runbooks/incident-response.md)
- [Database Maintenance](ops/runbooks/database-maintenance.md)

---

**Last Updated**: December 2024  
**Maintained By**: LexiScan AI Platform Team  
**Version**: 1.0.0
