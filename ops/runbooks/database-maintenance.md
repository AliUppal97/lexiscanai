# LexiScan AI - Database Maintenance Runbook

## 🗄️ Overview

This runbook provides comprehensive procedures for maintaining the LexiScan AI database infrastructure. It covers routine maintenance, performance optimization, backup procedures, and recovery operations.

## 📋 Table of Contents

- [Routine Maintenance](#routine-maintenance)
- [Performance Optimization](#performance-optimization)
- [Backup Procedures](#backup-procedures)
- [Recovery Procedures](#recovery-procedures)
- [Monitoring and Alerts](#monitoring-and-alerts)
- [Troubleshooting](#troubleshooting)

## 🔧 Routine Maintenance

### Daily Maintenance (5-10 minutes)

#### 1. Health Checks
```bash
# Check database connectivity
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT version();"

# Check database status
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT * FROM pg_stat_database WHERE datname = 'lexiscan';"

# Check active connections
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';"
```

#### 2. Performance Metrics
```bash
# Check database size
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT pg_size_pretty(pg_database_size('lexiscan'));"

# Check table sizes
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# Check index usage
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT schemaname,tablename,indexname,idx_tup_read,idx_tup_fetch FROM pg_stat_user_indexes ORDER BY idx_tup_read DESC;"
```

#### 3. Error Monitoring
```bash
# Check for errors in logs
kubectl logs deployment/lexiscan-postgres | grep -i error | tail -20

# Check for slow queries
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check for locks
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT * FROM pg_locks WHERE NOT granted;"
```

### Weekly Maintenance (30-60 minutes)

#### 1. Database Statistics Update
```bash
# Update table statistics
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "ANALYZE;"

# Update index statistics
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "ANALYZE VERBOSE;"
```

#### 2. Vacuum Operations
```bash
# Light vacuum (can run during business hours)
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "VACUUM ANALYZE;"

# Check vacuum status
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT schemaname,tablename,last_vacuum,last_autovacuum,last_analyze,last_autoanalyze FROM pg_stat_user_tables;"
```

#### 3. Index Maintenance
```bash
# Check for unused indexes
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT schemaname,tablename,indexname,idx_tup_read,idx_tup_fetch FROM pg_stat_user_indexes WHERE idx_tup_read = 0;"

# Check for duplicate indexes
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT schemaname,tablename,indexname,pg_size_pretty(pg_relation_size(indexrelid)) as size FROM pg_stat_user_indexes ORDER BY pg_relation_size(indexrelid) DESC;"
```

### Monthly Maintenance (2-4 hours)

#### 1. Full Vacuum (Maintenance Window)
```bash
# Schedule maintenance window
# Stop application services
kubectl scale deployment lexiscan-api --replicas=0
kubectl scale deployment lexiscan-web --replicas=0

# Full vacuum (requires exclusive lock)
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "VACUUM FULL;"

# Reindex tables
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "REINDEX DATABASE lexiscan;"

# Restart application services
kubectl scale deployment lexiscan-api --replicas=3
kubectl scale deployment lexiscan-web --replicas=3
```

#### 2. Database Cleanup
```bash
# Clean up old audit logs (older than 1 year)
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';"

# Clean up old sessions (older than 30 days)
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "DELETE FROM user_sessions WHERE expires_at < NOW();"

# Clean up old temporary files
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "DELETE FROM temp_files WHERE created_at < NOW() - INTERVAL '7 days';"
```

#### 3. Performance Analysis
```bash
# Analyze query performance
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT query, mean_time, calls, total_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 20;"

# Analyze table bloat
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size, pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# Analyze index bloat
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT schemaname,tablename,indexname,pg_size_pretty(pg_relation_size(indexrelid)) as size FROM pg_stat_user_indexes ORDER BY pg_relation_size(indexrelid) DESC;"
```

## ⚡ Performance Optimization

### Query Optimization

#### 1. Slow Query Analysis
```bash
# Enable query logging
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "ALTER SYSTEM SET log_min_duration_statement = 1000;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT pg_reload_conf();"

# Analyze slow queries
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT query, mean_time, calls, total_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check query execution plans
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';"
```

#### 2. Index Optimization
```bash
# Check missing indexes
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT schemaname,tablename,attname,n_distinct,correlation FROM pg_stats WHERE schemaname = 'public' ORDER BY n_distinct DESC;"

# Create missing indexes
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "CREATE INDEX CONCURRENTLY idx_users_email ON users(email);"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "CREATE INDEX CONCURRENTLY idx_documents_user_id ON documents(user_id);"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "CREATE INDEX CONCURRENTLY idx_audit_logs_created_at ON audit_logs(created_at);"
```

#### 3. Connection Pool Optimization
```bash
# Check connection pool settings
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SHOW max_connections;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SHOW shared_buffers;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SHOW effective_cache_size;"

# Optimize connection pool
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "ALTER SYSTEM SET max_connections = 200;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "ALTER SYSTEM SET shared_buffers = '256MB';"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT pg_reload_conf();"
```

### Memory Optimization

#### 1. Buffer Pool Optimization
```bash
# Check buffer pool usage
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT * FROM pg_stat_bgwriter;"

# Optimize buffer pool
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "ALTER SYSTEM SET shared_buffers = '512MB';"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "ALTER SYSTEM SET effective_cache_size = '1GB';"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT pg_reload_conf();"
```

#### 2. Work Memory Optimization
```bash
# Check work memory usage
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SHOW work_mem;"

# Optimize work memory
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "ALTER SYSTEM SET work_mem = '16MB';"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT pg_reload_conf();"
```

### Disk I/O Optimization

#### 1. Checkpoint Optimization
```bash
# Check checkpoint settings
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SHOW checkpoint_completion_target;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SHOW wal_buffers;"

# Optimize checkpoints
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "ALTER SYSTEM SET checkpoint_completion_target = 0.9;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "ALTER SYSTEM SET wal_buffers = '16MB';"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT pg_reload_conf();"
```

#### 2. WAL Optimization
```bash
# Check WAL settings
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SHOW wal_level;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SHOW max_wal_size;"

# Optimize WAL
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "ALTER SYSTEM SET wal_level = replica;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "ALTER SYSTEM SET max_wal_size = '1GB';"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT pg_reload_conf();"
```

## 💾 Backup Procedures

### Automated Backups

#### 1. Daily Backups
```bash
# Create backup script
cat > /scripts/daily-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="lexiscan-backup-$DATE.sql"

# Create backup
kubectl exec -it deployment/lexiscan-postgres -- pg_dump -U lexiscan -d lexiscan > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Remove backups older than 30 days
find $BACKUP_DIR -name "lexiscan-backup-*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
EOF

# Make executable
chmod +x /scripts/daily-backup.sh

# Schedule daily backup
echo "0 2 * * * /scripts/daily-backup.sh" | crontab -
```

#### 2. Weekly Backups
```bash
# Create weekly backup script
cat > /scripts/weekly-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="lexiscan-weekly-backup-$DATE.sql"

# Create full backup
kubectl exec -it deployment/lexiscan-postgres -- pg_dump -U lexiscan -d lexiscan --verbose --format=custom > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Remove weekly backups older than 12 weeks
find $BACKUP_DIR -name "lexiscan-weekly-backup-*.sql.gz" -mtime +84 -delete

echo "Weekly backup completed: $BACKUP_FILE.gz"
EOF

# Make executable
chmod +x /scripts/weekly-backup.sh

# Schedule weekly backup
echo "0 3 * * 0 /scripts/weekly-backup.sh" | crontab -
```

#### 3. Monthly Backups
```bash
# Create monthly backup script
cat > /scripts/monthly-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="lexiscan-monthly-backup-$DATE.sql"

# Create full backup with compression
kubectl exec -it deployment/lexiscan-postgres -- pg_dump -U lexiscan -d lexiscan --verbose --format=custom --compress=9 > $BACKUP_DIR/$BACKUP_FILE

# Create backup metadata
cat > $BACKUP_DIR/$BACKUP_FILE.metadata << METADATA
{
  "backup_date": "$DATE",
  "backup_type": "monthly",
  "database_version": "$(kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT version();" | head -1)",
  "backup_size": "$(du -h $BACKUP_DIR/$BACKUP_FILE | cut -f1)"
}
METADATA

# Remove monthly backups older than 12 months
find $BACKUP_DIR -name "lexiscan-monthly-backup-*.sql" -mtime +365 -delete

echo "Monthly backup completed: $BACKUP_FILE"
EOF

# Make executable
chmod +x /scripts/monthly-backup.sh

# Schedule monthly backup
echo "0 4 1 * * /scripts/monthly-backup.sh" | crontab -
```

### Manual Backups

#### 1. Full Database Backup
```bash
# Create full backup
kubectl exec -it deployment/lexiscan-postgres -- pg_dump -U lexiscan -d lexiscan --verbose --format=custom > backup-$(date +%Y%m%d-%H%M%S).sql

# Verify backup
kubectl exec -it deployment/lexiscan-postgres -- pg_restore --list backup-$(date +%Y%m%d-%H%M%S).sql
```

#### 2. Schema-Only Backup
```bash
# Create schema backup
kubectl exec -it deployment/lexiscan-postgres -- pg_dump -U lexiscan -d lexiscan --schema-only > schema-backup-$(date +%Y%m%d-%H%M%S).sql
```

#### 3. Data-Only Backup
```bash
# Create data backup
kubectl exec -it deployment/lexiscan-postgres -- pg_dump -U lexiscan -d lexiscan --data-only > data-backup-$(date +%Y%m%d-%H%M%S).sql
```

### Backup Verification

#### 1. Backup Integrity Check
```bash
# Check backup file
ls -la backup-*.sql

# Verify backup content
kubectl exec -it deployment/lexiscan-postgres -- pg_restore --list backup-*.sql

# Test restore (on test database)
kubectl exec -it deployment/lexiscan-postgres -- createdb -U lexiscan test_restore
kubectl exec -it deployment/lexiscan-postgres -- pg_restore -U lexiscan -d test_restore backup-*.sql
```

#### 2. Backup Testing
```bash
# Test restore on test database
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d test_restore -c "SELECT COUNT(*) FROM users;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d test_restore -c "SELECT COUNT(*) FROM documents;"

# Clean up test database
kubectl exec -it deployment/lexiscan-postgres -- dropdb -U lexiscan test_restore
```

## 🔄 Recovery Procedures

### Point-in-Time Recovery

#### 1. WAL-Based Recovery
```bash
# Stop application services
kubectl scale deployment lexiscan-api --replicas=0
kubectl scale deployment lexiscan-web --replicas=0

# Create recovery configuration
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "ALTER SYSTEM SET recovery_target_time = '2024-12-01 12:00:00';"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "ALTER SYSTEM SET recovery_target_action = 'promote';"

# Restart database
kubectl rollout restart deployment/lexiscan-postgres

# Verify recovery
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT NOW();"
```

#### 2. Backup-Based Recovery
```bash
# Stop application services
kubectl scale deployment lexiscan-api --replicas=0
kubectl scale deployment lexiscan-web --replicas=0

# Restore from backup
kubectl exec -it deployment/lexiscan-postgres -- pg_restore -U lexiscan -d lexiscan --clean --if-exists backup-*.sql

# Verify recovery
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM users;"
```

### Disaster Recovery

#### 1. Complete System Recovery
```bash
# Stop all services
kubectl scale deployment lexiscan-api --replicas=0
kubectl scale deployment lexiscan-web --replicas=0
kubectl scale deployment lexiscan-postgres --replicas=0

# Restore database
kubectl exec -it deployment/lexiscan-postgres -- pg_restore -U lexiscan -d lexiscan --clean --if-exists backup-*.sql

# Restart services
kubectl scale deployment lexiscan-postgres --replicas=1
kubectl scale deployment lexiscan-api --replicas=3
kubectl scale deployment lexiscan-web --replicas=3
```

#### 2. Cross-Region Recovery
```bash
# Deploy to secondary region
kubectl apply -f infra/k8s/regions/secondary/

# Restore database to secondary region
kubectl exec -it deployment/lexiscan-postgres-secondary -- pg_restore -U lexiscan -d lexiscan backup-*.sql

# Update DNS to point to secondary region
kubectl patch service lexiscan-api -p '{"spec":{"externalName":"api-secondary.lexiscan.ai"}}'
```

## 📊 Monitoring and Alerts

### Database Monitoring

#### 1. Performance Metrics
```bash
# Check database performance
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT * FROM pg_stat_database WHERE datname = 'lexiscan';"

# Check connection statistics
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT * FROM pg_stat_activity;"

# Check table statistics
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT * FROM pg_stat_user_tables;"
```

#### 2. Resource Monitoring
```bash
# Check database size
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT pg_size_pretty(pg_database_size('lexiscan'));"

# Check table sizes
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### Alert Configuration

#### 1. Database Alerts
```yaml
# database-alerts.yaml
groups:
  - name: database
    rules:
      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL database is down"
          description: "The PostgreSQL database has been down for more than 1 minute"
      
      - alert: DatabaseSlowQueries
        expr: histogram_quantile(0.95, rate(pg_stat_statements_mean_exec_time[5m])) > 1
        for: 3m
        labels:
          severity: warning
        annotations:
          summary: "Database queries are slow"
          description: "95th percentile query execution time is {{ $value }}s, exceeding 1s threshold"
      
      - alert: DatabaseHighConnections
        expr: pg_stat_database_numbackends / pg_settings_max_connections * 100 > 80
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Database connection usage is high"
          description: "Database connection usage is {{ $value }}%, exceeding 80% threshold"
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Connection Issues
```bash
# Check connection pool
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM pg_stat_activity;"

# Check connection limits
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SHOW max_connections;"

# Check active connections
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

#### 2. Performance Issues
```bash
# Check slow queries
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check locks
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT * FROM pg_locks WHERE NOT granted;"

# Check database bloat
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

#### 3. Storage Issues
```bash
# Check disk usage
kubectl exec -it deployment/lexiscan-postgres -- df -h

# Check database size
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT pg_size_pretty(pg_database_size('lexiscan'));"

# Check WAL size
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT pg_size_pretty(pg_wal_size());"
```

### Recovery Procedures

#### 1. Database Corruption
```bash
# Check database integrity
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT * FROM pg_stat_database WHERE datname = 'lexiscan';"

# Reindex database
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "REINDEX DATABASE lexiscan;"

# Vacuum database
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "VACUUM FULL;"
```

#### 2. Performance Degradation
```bash
# Analyze tables
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "ANALYZE;"

# Vacuum tables
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "VACUUM ANALYZE;"

# Reindex tables
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "REINDEX DATABASE lexiscan;"
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Monitoring Dashboards](http://localhost:3003)
- [Backup Procedures](ops/runbooks/backup-recovery.md)
- [Incident Response](ops/runbooks/incident-response.md)

---

**Last Updated**: December 2024  
**Maintained By**: LexiScan AI Platform Team  
**Version**: 1.0.0
