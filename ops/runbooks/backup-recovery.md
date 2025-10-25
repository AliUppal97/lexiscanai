# LexiScan AI - Backup & Recovery Runbook

## 💾 Overview

This runbook provides comprehensive procedures for backing up and recovering the LexiScan AI platform. It covers database backups, application backups, configuration backups, and disaster recovery procedures.

## 📋 Table of Contents

- [Backup Procedures](#backup-procedures)
- [Recovery Procedures](#recovery-procedures)
- [Disaster Recovery](#disaster-recovery)
- [Testing Procedures](#testing-procedures)
- [Monitoring and Alerts](#monitoring-and-alerts)

## 💾 Backup Procedures

### Database Backups

#### 1. Automated Daily Backups
```bash
#!/bin/bash
# daily-backup.sh
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="lexiscan-daily-$DATE.sql"

# Create backup
kubectl exec -it deployment/lexiscan-postgres -- pg_dump -U lexiscan -d lexiscan --verbose --format=custom > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Remove backups older than 30 days
find $BACKUP_DIR -name "lexiscan-daily-*.sql.gz" -mtime +30 -delete

echo "Daily backup completed: $BACKUP_FILE.gz"
```

#### 2. Weekly Full Backups
```bash
#!/bin/bash
# weekly-backup.sh
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="lexiscan-weekly-$DATE.sql"

# Create full backup
kubectl exec -it deployment/lexiscan-postgres -- pg_dump -U lexiscan -d lexiscan --verbose --format=custom --compress=9 > $BACKUP_DIR/$BACKUP_FILE

# Create backup metadata
cat > $BACKUP_DIR/$BACKUP_FILE.metadata << EOF
{
  "backup_date": "$DATE",
  "backup_type": "weekly",
  "database_version": "$(kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT version();" | head -1)",
  "backup_size": "$(du -h $BACKUP_DIR/$BACKUP_FILE | cut -f1)"
}
EOF

# Remove weekly backups older than 12 weeks
find $BACKUP_DIR -name "lexiscan-weekly-*.sql" -mtime +84 -delete

echo "Weekly backup completed: $BACKUP_FILE"
```

#### 3. Monthly Archive Backups
```bash
#!/bin/bash
# monthly-backup.sh
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="lexiscan-monthly-$DATE.sql"

# Create archive backup
kubectl exec -it deployment/lexiscan-postgres -- pg_dump -U lexiscan -d lexiscan --verbose --format=custom --compress=9 --no-owner --no-privileges > $BACKUP_DIR/$BACKUP_FILE

# Create backup index
kubectl exec -it deployment/lexiscan-postgres -- pg_dump -U lexiscan -d lexiscan --schema-only > $BACKUP_DIR/$BACKUP_FILE.schema

# Remove monthly backups older than 12 months
find $BACKUP_DIR -name "lexiscan-monthly-*.sql" -mtime +365 -delete

echo "Monthly backup completed: $BACKUP_FILE"
```

### Application Backups

#### 1. Configuration Backups
```bash
#!/bin/bash
# config-backup.sh
BACKUP_DIR="/backups/config"
DATE=$(date +%Y%m%d-%H%M%S)

# Create config backup directory
mkdir -p $BACKUP_DIR

# Backup Kubernetes configurations
kubectl get all -o yaml > $BACKUP_DIR/k8s-resources-$DATE.yaml
kubectl get configmaps -o yaml > $BACKUP_DIR/configmaps-$DATE.yaml
kubectl get secrets -o yaml > $BACKUP_DIR/secrets-$DATE.yaml
kubectl get pvc -o yaml > $BACKUP_DIR/pvc-$DATE.yaml

# Backup application configurations
kubectl exec -it deployment/lexiscan-api -- tar -czf - /app/config > $BACKUP_DIR/app-config-$DATE.tar.gz

echo "Configuration backup completed: $DATE"
```

#### 2. Application State Backups
```bash
#!/bin/bash
# app-state-backup.sh
BACKUP_DIR="/backups/app-state"
DATE=$(date +%Y%m%d-%H%M%S)

# Create app state backup directory
mkdir -p $BACKUP_DIR

# Backup application logs
kubectl logs deployment/lexiscan-api --since=24h > $BACKUP_DIR/api-logs-$DATE.log
kubectl logs deployment/lexiscan-web --since=24h > $BACKUP_DIR/web-logs-$DATE.log
kubectl logs deployment/lexiscan-postgres --since=24h > $BACKUP_DIR/postgres-logs-$DATE.log

# Backup application metrics
curl http://localhost:9090/api/v1/query?query=up > $BACKUP_DIR/metrics-$DATE.json

echo "Application state backup completed: $DATE"
```

### File System Backups

#### 1. Persistent Volume Backups
```bash
#!/bin/bash
# pv-backup.sh
BACKUP_DIR="/backups/pv"
DATE=$(date +%Y%m%d-%H%M%S)

# Create PV backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL data
kubectl exec -it deployment/lexiscan-postgres -- tar -czf - /var/lib/postgresql/data > $BACKUP_DIR/postgres-data-$DATE.tar.gz

# Backup Redis data
kubectl exec -it deployment/lexiscan-redis -- tar -czf - /data > $BACKUP_DIR/redis-data-$DATE.tar.gz

# Backup application files
kubectl exec -it deployment/lexiscan-api -- tar -czf - /app/uploads > $BACKUP_DIR/uploads-$DATE.tar.gz

echo "Persistent volume backup completed: $DATE"
```

## 🔄 Recovery Procedures

### Database Recovery

#### 1. Point-in-Time Recovery
```bash
# Stop application services
kubectl scale deployment lexiscan-api --replicas=0
kubectl scale deployment lexiscan-web --replicas=0

# Restore from backup
kubectl exec -it deployment/lexiscan-postgres -- pg_restore -U lexiscan -d lexiscan --clean --if-exists /backups/lexiscan-daily-20241201-120000.sql

# Verify recovery
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM users;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM documents;"

# Restart application services
kubectl scale deployment lexiscan-api --replicas=3
kubectl scale deployment lexiscan-web --replicas=3
```

#### 2. Schema-Only Recovery
```bash
# Restore schema only
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -f /backups/lexiscan-weekly-20241201-120000.sql.schema

# Verify schema
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "\dt"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "\di"
```

#### 3. Data-Only Recovery
```bash
# Restore data only
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -f /backups/lexiscan-weekly-20241201-120000.sql

# Verify data
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM users;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM documents;"
```

### Application Recovery

#### 1. Configuration Recovery
```bash
# Restore Kubernetes configurations
kubectl apply -f /backups/config/k8s-resources-20241201-120000.yaml
kubectl apply -f /backups/config/configmaps-20241201-120000.yaml
kubectl apply -f /backups/config/secrets-20241201-120000.yaml
kubectl apply -f /backups/config/pvc-20241201-120000.yaml

# Restart services
kubectl rollout restart deployment/lexiscan-api
kubectl rollout restart deployment/lexiscan-web
```

#### 2. Application State Recovery
```bash
# Restore application configurations
kubectl exec -it deployment/lexiscan-api -- tar -xzf - /app/config < /backups/config/app-config-20241201-120000.tar.gz

# Restart application
kubectl rollout restart deployment/lexiscan-api
```

### File System Recovery

#### 1. Persistent Volume Recovery
```bash
# Stop services
kubectl scale deployment lexiscan-postgres --replicas=0
kubectl scale deployment lexiscan-redis --replicas=0

# Restore PostgreSQL data
kubectl exec -it deployment/lexiscan-postgres -- tar -xzf - /var/lib/postgresql/data < /backups/pv/postgres-data-20241201-120000.tar.gz

# Restore Redis data
kubectl exec -it deployment/lexiscan-redis -- tar -xzf - /data < /backups/pv/redis-data-20241201-120000.tar.gz

# Restore application files
kubectl exec -it deployment/lexiscan-api -- tar -xzf - /app/uploads < /backups/pv/uploads-20241201-120000.tar.gz

# Restart services
kubectl scale deployment lexiscan-postgres --replicas=1
kubectl scale deployment lexiscan-redis --replicas=1
```

## 🚨 Disaster Recovery

### Complete System Recovery

#### 1. Infrastructure Recovery
```bash
# Deploy infrastructure
kubectl apply -f infra/k8s/base/
kubectl apply -f infra/k8s/deployments/
kubectl apply -f infra/k8s/services/

# Verify infrastructure
kubectl get all
kubectl get pvc
kubectl get secrets
```

#### 2. Database Recovery
```bash
# Restore database
kubectl exec -it deployment/lexiscan-postgres -- pg_restore -U lexiscan -d lexiscan --clean --if-exists /backups/lexiscan-weekly-20241201-120000.sql

# Verify database
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM users;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM documents;"
```

#### 3. Application Recovery
```bash
# Deploy applications
kubectl apply -f apps/api/
kubectl apply -f apps/web/
kubectl apply -f apps/dashboard/

# Verify applications
kubectl get pods
kubectl get services
```

### Cross-Region Recovery

#### 1. Secondary Region Setup
```bash
# Deploy to secondary region
kubectl apply -f infra/k8s/regions/secondary/

# Restore database to secondary region
kubectl exec -it deployment/lexiscan-postgres-secondary -- pg_restore -U lexiscan -d lexiscan /backups/lexiscan-weekly-20241201-120000.sql

# Update DNS to point to secondary region
kubectl patch service lexiscan-api -p '{"spec":{"externalName":"api-secondary.lexiscan.ai"}}'
```

#### 2. Traffic Failover
```bash
# Update ingress to point to secondary region
kubectl patch ingress lexiscan-ingress -p '{"spec":{"rules":[{"host":"api.lexiscan.ai","http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"lexiscan-api-secondary","port":{"number":3001}}}}]}}]}}'

# Verify failover
curl -f https://api.lexiscan.ai/health
curl -f https://lexiscan.ai/health
```

## 🧪 Testing Procedures

### Backup Testing

#### 1. Backup Integrity Testing
```bash
# Test backup integrity
kubectl exec -it deployment/lexiscan-postgres -- pg_restore --list /backups/lexiscan-daily-20241201-120000.sql

# Test backup restore
kubectl exec -it deployment/lexiscan-postgres -- createdb -U lexiscan test_restore
kubectl exec -it deployment/lexiscan-postgres -- pg_restore -U lexiscan -d test_restore /backups/lexiscan-daily-20241201-120000.sql
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d test_restore -c "SELECT COUNT(*) FROM users;"
kubectl exec -it deployment/lexiscan-postgres -- dropdb -U lexiscan test_restore
```

#### 2. Recovery Time Testing
```bash
# Measure recovery time
START_TIME=$(date +%s)
# Perform recovery procedures
END_TIME=$(date +%s)
RECOVERY_TIME=$((END_TIME - START_TIME))
echo "Recovery time: $RECOVERY_TIME seconds"
```

### Disaster Recovery Testing

#### 1. Full System Recovery Test
```bash
# Test complete system recovery
kubectl delete all --all
kubectl delete pvc --all
kubectl delete secrets --all
kubectl delete configmaps --all

# Perform full recovery
# (Follow complete recovery procedures)

# Verify system functionality
curl -f https://api.lexiscan.ai/health
curl -f https://lexiscan.ai/health
curl -f https://dashboard.lexiscan.ai/health
```

#### 2. Cross-Region Failover Test
```bash
# Test cross-region failover
kubectl patch service lexiscan-api -p '{"spec":{"externalName":"api-secondary.lexiscan.ai"}}'

# Verify failover
curl -f https://api.lexiscan.ai/health
curl -f https://lexiscan.ai/health

# Test failback
kubectl patch service lexiscan-api -p '{"spec":{"externalName":"api.lexiscan.ai"}}'
```

## 📊 Monitoring and Alerts

### Backup Monitoring

#### 1. Backup Status Monitoring
```bash
# Check backup status
ls -la /backups/
du -sh /backups/*

# Check backup age
find /backups/ -name "lexiscan-daily-*.sql.gz" -mtime -1
find /backups/ -name "lexiscan-weekly-*.sql" -mtime -7
find /backups/ -name "lexiscan-monthly-*.sql" -mtime -30
```

#### 2. Backup Size Monitoring
```bash
# Check backup sizes
du -sh /backups/lexiscan-daily-*.sql.gz
du -sh /backups/lexiscan-weekly-*.sql
du -sh /backups/lexiscan-monthly-*.sql

# Check disk usage
df -h /backups/
```

### Alert Configuration

#### 1. Backup Alerts
```yaml
# backup-alerts.yaml
groups:
  - name: backup
    rules:
      - alert: BackupFailed
        expr: backup_status{job="backup"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Backup failed"
          description: "Backup job {{ $labels.job }} failed"
      
      - alert: BackupOld
        expr: time() - backup_timestamp{job="backup"} > 86400
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Backup is old"
          description: "Backup {{ $labels.job }} is {{ $value }} seconds old"
      
      - alert: BackupSizeLarge
        expr: backup_size{job="backup"} > 1073741824
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Backup size is large"
          description: "Backup {{ $labels.job }} size is {{ $value }} bytes"
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Monitoring Dashboards](http://localhost:3003)
- [Database Maintenance](ops/runbooks/database-maintenance.md)
- [Incident Response](ops/runbooks/incident-response.md)

---

**Last Updated**: December 2024  
**Maintained By**: LexiScan AI Platform Team  
**Version**: 1.0.0
