# LexiScan AI - Rollback Runbook

## 🔄 Overview

This runbook provides comprehensive procedures for rolling back deployments in the LexiScan AI platform. It covers immediate rollback procedures, database rollbacks, configuration rollbacks, and recovery procedures.

## 📋 Table of Contents

- [Rollback Triggers](#rollback-triggers)
- [Immediate Rollback Procedures](#immediate-rollback-procedures)
- [Database Rollback Procedures](#database-rollback-procedures)
- [Configuration Rollback Procedures](#configuration-rollback-procedures)
- [Recovery Procedures](#recovery-procedures)
- [Validation Procedures](#validation-procedures)

## 🚨 Rollback Triggers

### Automatic Rollback Triggers

#### 1. Health Check Failures
- **Service Health**: Health checks failing for > 2 minutes
- **Database Health**: Database connectivity issues
- **Cache Health**: Redis/cache service unavailable
- **External Dependencies**: Critical external services down

#### 2. Performance Degradation
- **Response Time**: API response time > 5 seconds
- **Error Rate**: Error rate > 10% for 5 minutes
- **Throughput**: Throughput drop > 50%
- **Resource Usage**: CPU > 90% or Memory > 95%

#### 3. Business Impact
- **Revenue Loss**: Billing system failures
- **User Impact**: > 10% of users affected
- **Data Loss**: Any data loss or corruption
- **Security Issues**: Security vulnerabilities or breaches

### Manual Rollback Triggers

#### 1. Critical Issues
- **Service Down**: Complete service unavailability
- **Data Corruption**: Database corruption detected
- **Security Breach**: Unauthorized access detected
- **Compliance Violation**: Regulatory compliance issues

#### 2. Performance Issues
- **Slow Response**: Response time > 10 seconds
- **High Error Rate**: Error rate > 20%
- **Resource Exhaustion**: Out of memory or disk space
- **Database Issues**: Database performance severely degraded

## ⚡ Immediate Rollback Procedures

### Traffic Switch (0-2 minutes)

#### 1. Blue-Green Deployment Rollback
```bash
# Check current traffic routing
kubectl get service lexiscan-api -o yaml | grep selector

# Switch traffic back to blue (previous version)
kubectl patch service lexiscan-api -p '{"spec":{"selector":{"version":"blue"}}}'

# Verify traffic switch
kubectl get pods -l app=lexiscan-api,version=blue
kubectl get pods -l app=lexiscan-api,version=green
```

#### 2. Canary Deployment Rollback
```bash
# Check canary traffic percentage
kubectl get virtualservice lexiscan-api -o yaml | grep weight

# Set canary traffic to 0%
kubectl patch virtualservice lexiscan-api -p '{"spec":{"http":[{"route":[{"destination":{"host":"lexiscan-api","subset":"blue"},"weight":100},{"destination":{"host":"lexiscan-api","subset":"green"},"weight":0}]}]}}'

# Verify rollback
kubectl get virtualservice lexiscan-api
```

#### 3. Rolling Update Rollback
```bash
# Check current deployment status
kubectl rollout status deployment/lexiscan-api

# Rollback to previous revision
kubectl rollout undo deployment/lexiscan-api

# Verify rollback
kubectl rollout status deployment/lexiscan-api
kubectl rollout history deployment/lexiscan-api
```

### Health Verification (2-5 minutes)

#### 1. Service Health Checks
```bash
# API health check
curl -f https://api.lexiscan.ai/health
curl -f https://api.lexiscan.ai/health/detailed

# Web health check
curl -f https://lexiscan.ai/health
curl -f https://lexiscan.ai/health/detailed

# Dashboard health check
curl -f https://dashboard.lexiscan.ai/health
curl -f https://dashboard.lexiscan.ai/health/detailed
```

#### 2. Performance Checks
```bash
# Response time check
curl -w "@curl-format.txt" -o /dev/null -s https://api.lexiscan.ai/health

# Error rate check
curl https://api.lexiscan.ai/metrics | grep -E "http_requests_total.*5.."

# Throughput check
curl https://api.lexiscan.ai/metrics | grep -E "http_requests_total"
```

#### 3. Database Health Checks
```bash
# Database connectivity
kubectl exec -it deployment/lexiscan-api -- npm run db:health

# Database performance
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT * FROM pg_stat_activity;"

# Database size
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT pg_size_pretty(pg_database_size('lexiscan'));"
```

## 🗄️ Database Rollback Procedures

### Schema Rollback (5-15 minutes)

#### 1. Migration Rollback
```bash
# Check current migration status
kubectl exec -it deployment/lexiscan-api -- npm run migrate:status

# Rollback last migration
kubectl exec -it deployment/lexiscan-api -- npm run migrate:down

# Verify rollback
kubectl exec -it deployment/lexiscan-api -- npm run migrate:status
```

#### 2. Multiple Migration Rollback
```bash
# Rollback multiple migrations
kubectl exec -it deployment/lexiscan-api -- npm run migrate:down --count=3

# Verify rollback
kubectl exec -it deployment/lexiscan-api -- npm run migrate:status
```

#### 3. Complete Migration Rollback
```bash
# Rollback to specific version
kubectl exec -it deployment/lexiscan-api -- npm run migrate:down --to=20240101000000

# Verify rollback
kubectl exec -it deployment/lexiscan-api -- npm run migrate:status
```

### Data Rollback (15-30 minutes)

#### 1. Database Backup Restore
```bash
# List available backups
kubectl exec -it deployment/lexiscan-postgres -- ls -la /backups/

# Restore from backup
kubectl exec -it deployment/lexiscan-postgres -- pg_restore -U lexiscan -d lexiscan /backups/backup-20241201-120000.sql

# Verify restore
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM users;"
```

#### 2. Point-in-Time Recovery
```bash
# Stop application services
kubectl scale deployment lexiscan-api --replicas=0
kubectl scale deployment lexiscan-web --replicas=0

# Restore database to specific point in time
kubectl exec -it deployment/lexiscan-postgres -- pg_basebackup -D /restore -Ft -z -P

# Start application services
kubectl scale deployment lexiscan-api --replicas=3
kubectl scale deployment lexiscan-web --replicas=3
```

#### 3. Data Validation
```bash
# Check data integrity
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM users;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM documents;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM subscriptions;"

# Check data consistency
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT * FROM pg_stat_user_tables;"
```

## ⚙️ Configuration Rollback Procedures

### Environment Configuration Rollback

#### 1. Kubernetes ConfigMap Rollback
```bash
# Check current config
kubectl get configmap lexiscan-config -o yaml

# Rollback to previous version
kubectl rollout undo configmap/lexiscan-config

# Restart services to pick up new config
kubectl rollout restart deployment/lexiscan-api
kubectl rollout restart deployment/lexiscan-web
```

#### 2. Kubernetes Secret Rollback
```bash
# Check current secrets
kubectl get secret lexiscan-secrets -o yaml

# Rollback to previous version
kubectl rollout undo secret/lexiscan-secrets

# Restart services to pick up new secrets
kubectl rollout restart deployment/lexiscan-api
```

#### 3. Environment Variable Rollback
```bash
# Check current environment variables
kubectl get deployment lexiscan-api -o yaml | grep -A 20 env:

# Update environment variables
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","env":[{"name":"NODE_ENV","value":"production"}]}]}}}}'

# Restart deployment
kubectl rollout restart deployment/lexiscan-api
```

### Application Configuration Rollback

#### 1. Application Settings Rollback
```bash
# Check current application config
kubectl exec -it deployment/lexiscan-api -- cat /app/config/app.json

# Restore previous configuration
kubectl exec -it deployment/lexiscan-api -- cp /app/config/app.json.backup /app/config/app.json

# Restart application
kubectl rollout restart deployment/lexiscan-api
```

#### 2. Feature Flag Rollback
```bash
# Check current feature flags
kubectl exec -it deployment/lexiscan-api -- cat /app/config/features.json

# Disable problematic features
kubectl exec -it deployment/lexiscan-api -- sed -i 's/"new_feature": true/"new_feature": false/g' /app/config/features.json

# Restart application
kubectl rollout restart deployment/lexiscan-api
```

## 🔧 Recovery Procedures

### Service Recovery

#### 1. Pod Recovery
```bash
# Check pod status
kubectl get pods -l app=lexiscan-api
kubectl describe pod <pod-name>

# Restart failing pods
kubectl delete pod <pod-name>
kubectl get pods -l app=lexiscan-api
```

#### 2. Deployment Recovery
```bash
# Check deployment status
kubectl get deployment lexiscan-api
kubectl describe deployment lexiscan-api

# Restart deployment
kubectl rollout restart deployment/lexiscan-api
kubectl rollout status deployment/lexiscan-api
```

#### 3. Service Recovery
```bash
# Check service status
kubectl get service lexiscan-api
kubectl describe service lexiscan-api

# Restart service
kubectl delete service lexiscan-api
kubectl apply -f infra/k8s/services/api-service.yaml
```

### Infrastructure Recovery

#### 1. Node Recovery
```bash
# Check node status
kubectl get nodes
kubectl describe node <node-name>

# Drain node if needed
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# Uncordon node after maintenance
kubectl uncordon <node-name>
```

#### 2. Persistent Volume Recovery
```bash
# Check PV status
kubectl get pv
kubectl describe pv <pv-name>

# Check PVC status
kubectl get pvc
kubectl describe pvc <pvc-name>

# Reclaim policy
kubectl patch pv <pv-name> -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'
```

#### 3. Network Recovery
```bash
# Check network policies
kubectl get networkpolicy
kubectl describe networkpolicy <policy-name>

# Check ingress
kubectl get ingress
kubectl describe ingress lexiscan-ingress

# Restart ingress controller
kubectl rollout restart deployment/nginx-ingress-controller
```

## ✅ Validation Procedures

### Health Validation

#### 1. Service Health
```bash
# API health
curl -f https://api.lexiscan.ai/health
curl -f https://api.lexiscan.ai/health/detailed

# Web health
curl -f https://lexiscan.ai/health
curl -f https://lexiscan.ai/health/detailed

# Dashboard health
curl -f https://dashboard.lexiscan.ai/health
curl -f https://dashboard.lexiscan.ai/health/detailed
```

#### 2. Performance Validation
```bash
# Response time
curl -w "@curl-format.txt" -o /dev/null -s https://api.lexiscan.ai/health

# Error rate
curl https://api.lexiscan.ai/metrics | grep -E "http_requests_total.*5.."

# Throughput
curl https://api.lexiscan.ai/metrics | grep -E "http_requests_total"
```

#### 3. Database Validation
```bash
# Database connectivity
kubectl exec -it deployment/lexiscan-api -- npm run db:health

# Database performance
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT * FROM pg_stat_activity;"

# Data integrity
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM users;"
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

### Performance Validation

#### 1. Response Time
- [ ] API response time < 2 seconds
- [ ] Web page load time < 3 seconds
- [ ] Dashboard response time < 2 seconds
- [ ] Database query time < 1 second

#### 2. Error Rate
- [ ] API error rate < 1%
- [ ] Web error rate < 1%
- [ ] Database error rate < 0.1%
- [ ] Cache error rate < 0.1%

#### 3. Resource Usage
- [ ] CPU usage < 80%
- [ ] Memory usage < 90%
- [ ] Disk usage < 80%
- [ ] Network usage < 70%

## 📊 Monitoring and Alerts

### Rollback Monitoring
- **Service Health**: Monitor service availability after rollback
- **Performance**: Track response times and throughput
- **Errors**: Monitor error rates and types
- **Resources**: Track CPU, memory, and disk usage
- **Dependencies**: Monitor database, cache, and external services

### Alert Configuration
```yaml
# rollback-alerts.yaml
groups:
  - name: rollback
    rules:
      - alert: RollbackRequired
        expr: kube_deployment_status_replicas_available < kube_deployment_spec_replicas
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Rollback required for deployment {{ $labels.deployment }}"
          description: "Deployment {{ $labels.deployment }} in namespace {{ $labels.namespace }} has {{ $value }} available replicas"
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Monitoring Dashboards](http://localhost:3003)
- [Incident Response](ops/runbooks/incident-response.md)
- [Deployment Procedures](ops/runbooks/deployment.md)

---

**Last Updated**: December 2024  
**Maintained By**: LexiScan AI Platform Team  
**Version**: 1.0.0
