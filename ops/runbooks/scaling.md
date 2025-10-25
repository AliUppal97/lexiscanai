# LexiScan AI - Scaling Runbook

## 📈 Overview

This runbook provides comprehensive procedures for scaling the LexiScan AI platform. It covers horizontal scaling, vertical scaling, database scaling, and performance optimization.

## 📋 Table of Contents

- [Scaling Triggers](#scaling-triggers)
- [Horizontal Scaling](#horizontal-scaling)
- [Vertical Scaling](#vertical-scaling)
- [Database Scaling](#database-scaling)
- [Performance Optimization](#performance-optimization)
- [Monitoring and Alerts](#monitoring-and-alerts)

## 🚨 Scaling Triggers

### Automatic Scaling Triggers

#### 1. CPU-Based Scaling
- **CPU Usage**: > 80% for 5 minutes
- **Load Average**: > 4.0 for 5 minutes
- **Response Time**: > 2 seconds for 5 minutes

#### 2. Memory-Based Scaling
- **Memory Usage**: > 85% for 5 minutes
- **Heap Usage**: > 90% for 5 minutes
- **Swap Usage**: > 10% for 5 minutes

#### 3. Request-Based Scaling
- **Request Rate**: > 1000 RPS for 5 minutes
- **Queue Length**: > 100 items for 5 minutes
- **Error Rate**: > 5% for 5 minutes

### Manual Scaling Triggers

#### 1. Business Events
- **User Growth**: > 20% increase in users
- **Document Volume**: > 50% increase in processing
- **Peak Hours**: Expected traffic spikes
- **Marketing Campaigns**: Promotional activities

#### 2. Performance Issues
- **Slow Response**: Response time > 5 seconds
- **High Error Rate**: Error rate > 10%
- **Resource Exhaustion**: Out of memory/CPU
- **Database Bottlenecks**: Slow queries

## 🔄 Horizontal Scaling

### Application Scaling

#### 1. API Service Scaling
```bash
# Check current replicas
kubectl get deployment lexiscan-api

# Scale API service
kubectl scale deployment lexiscan-api --replicas=5

# Verify scaling
kubectl get pods -l app=lexiscan-api
kubectl rollout status deployment/lexiscan-api
```

#### 2. Web Service Scaling
```bash
# Scale web service
kubectl scale deployment lexiscan-web --replicas=3

# Verify scaling
kubectl get pods -l app=lexiscan-web
kubectl rollout status deployment/lexiscan-web
```

#### 3. Dashboard Service Scaling
```bash
# Scale dashboard service
kubectl scale deployment lexiscan-dashboard --replicas=2

# Verify scaling
kubectl get pods -l app=lexiscan-dashboard
kubectl rollout status deployment/lexiscan-dashboard
```

### Worker Service Scaling

#### 1. AI Worker Scaling
```bash
# Scale AI worker
kubectl scale deployment lexiscan-ai-worker --replicas=3

# Verify scaling
kubectl get pods -l app=lexiscan-ai-worker
kubectl rollout status deployment/lexiscan-ai-worker
```

#### 2. PDF Generator Scaling
```bash
# Scale PDF generator
kubectl scale deployment lexiscan-pdf-generator --replicas=2

# Verify scaling
kubectl get pods -l app=lexiscan-pdf-generator
kubectl rollout status deployment/lexiscan-pdf-generator
```

### Auto-Scaling Configuration

#### 1. HPA Configuration
```yaml
# hpa-config.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: lexiscan-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: lexiscan-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### 2. KEDA Configuration
```yaml
# keda-config.yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: lexiscan-queue-scaler
spec:
  scaleTargetRef:
    name: lexiscan-ai-worker
  minReplicaCount: 1
  maxReplicaCount: 10
  triggers:
  - type: redis
    metadata:
      address: redis:6379
      listName: document-processing-queue
      listLength: '5'
```

## ⬆️ Vertical Scaling

### Resource Scaling

#### 1. CPU Scaling
```bash
# Check current resources
kubectl describe deployment lexiscan-api | grep -A 5 "Limits\|Requests"

# Update CPU limits
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","resources":{"limits":{"cpu":"2000m"},"requests":{"cpu":"1000m"}}}]}}}}'

# Verify scaling
kubectl describe deployment lexiscan-api | grep -A 5 "Limits\|Requests"
```

#### 2. Memory Scaling
```bash
# Update memory limits
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","resources":{"limits":{"memory":"4Gi"},"requests":{"memory":"2Gi"}}}]}}}}'

# Verify scaling
kubectl describe deployment lexiscan-api | grep -A 5 "Limits\|Requests"
```

#### 3. Storage Scaling
```bash
# Check current storage
kubectl get pvc

# Update storage size
kubectl patch pvc lexiscan-postgres-pvc -p '{"spec":{"resources":{"requests":{"storage":"100Gi"}}}}'

# Verify scaling
kubectl get pvc
```

### Node Scaling

#### 1. Add Nodes
```bash
# Check current nodes
kubectl get nodes

# Add new node (cloud provider specific)
# AWS: Add instance to node group
# GCP: Add node to node pool
# Azure: Add node to node pool

# Verify new node
kubectl get nodes
kubectl describe node <new-node-name>
```

#### 2. Node Optimization
```bash
# Check node resources
kubectl top nodes

# Check node capacity
kubectl describe node <node-name> | grep -A 10 "Capacity\|Allocatable"

# Optimize node scheduling
kubectl taint node <node-name> node-role.kubernetes.io/worker=true:NoSchedule
```

## 🗄️ Database Scaling

### Read Replicas

#### 1. Create Read Replica
```bash
# Create read replica deployment
kubectl apply -f infra/k8s/databases/postgres-read-replica.yaml

# Verify read replica
kubectl get pods -l app=lexiscan-postgres-read
kubectl logs deployment/lexiscan-postgres-read
```

#### 2. Configure Read Replica
```yaml
# postgres-read-replica.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lexiscan-postgres-read
spec:
  replicas: 2
  selector:
    matchLabels:
      app: lexiscan-postgres-read
  template:
    metadata:
      labels:
        app: lexiscan-postgres-read
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_DB
          value: lexiscan
        - name: POSTGRES_USER
          value: lexiscan
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: lexiscan-secrets
              key: postgres-password
        - name: PGUSER
          value: lexiscan
        - name: PGPASSWORD
          valueFrom:
            secretKeyRef:
              name: lexiscan-secrets
              key: postgres-password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-data
        persistentVolumeClaim:
          claimName: lexiscan-postgres-read-pvc
```

### Connection Pooling

#### 1. PgBouncer Configuration
```yaml
# pgbouncer-config.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lexiscan-pgbouncer
spec:
  replicas: 2
  selector:
    matchLabels:
      app: lexiscan-pgbouncer
  template:
    metadata:
      labels:
        app: lexiscan-pgbouncer
    spec:
      containers:
      - name: pgbouncer
        image: pgbouncer/pgbouncer:latest
        env:
        - name: DATABASES_HOST
          value: lexiscan-postgres
        - name: DATABASES_PORT
          value: "5432"
        - name: DATABASES_USER
          value: lexiscan
        - name: DATABASES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: lexiscan-secrets
              key: postgres-password
        - name: DATABASES_DBNAME
          value: lexiscan
        - name: POOL_MODE
          value: transaction
        - name: MAX_CLIENT_CONN
          value: "100"
        - name: DEFAULT_POOL_SIZE
          value: "25"
        ports:
        - containerPort: 6432
```

#### 2. Application Configuration
```bash
# Update database connection string
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","env":[{"name":"DATABASE_URL","value":"postgresql://lexiscan:password@lexiscan-pgbouncer:6432/lexiscan"}]}]}}}}'

# Restart application
kubectl rollout restart deployment/lexiscan-api
```

### Database Partitioning

#### 1. Table Partitioning
```sql
-- Partition audit_logs table by date
CREATE TABLE audit_logs_partitioned (
    LIKE audit_logs INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE audit_logs_2024_02 PARTITION OF audit_logs_partitioned
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

#### 2. Index Optimization
```sql
-- Create partial indexes
CREATE INDEX CONCURRENTLY idx_audit_logs_2024_01_created_at 
ON audit_logs_2024_01 (created_at) 
WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01';

-- Create covering indexes
CREATE INDEX CONCURRENTLY idx_users_email_covering 
ON users (email) INCLUDE (id, first_name, last_name);
```

## ⚡ Performance Optimization

### Caching Optimization

#### 1. Redis Scaling
```bash
# Scale Redis cluster
kubectl scale deployment lexiscan-redis --replicas=3

# Configure Redis cluster
kubectl exec -it deployment/lexiscan-redis -- redis-cli cluster nodes
kubectl exec -it deployment/lexiscan-redis -- redis-cli cluster info
```

#### 2. Application Caching
```bash
# Update cache configuration
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","env":[{"name":"REDIS_CLUSTER_NODES","value":"redis-0.redis:6379,redis-1.redis:6379,redis-2.redis:6379"}]}]}}}}'

# Restart application
kubectl rollout restart deployment/lexiscan-api
```

### Load Balancing

#### 1. Service Load Balancing
```yaml
# service-load-balancer.yaml
apiVersion: v1
kind: Service
metadata:
  name: lexiscan-api-lb
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3001
    protocol: TCP
  selector:
    app: lexiscan-api
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 3600
```

#### 2. Ingress Load Balancing
```yaml
# ingress-load-balancer.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: lexiscan-ingress
  annotations:
    nginx.ingress.kubernetes.io/load-balance: round_robin
    nginx.ingress.kubernetes.io/upstream-hash-by: $remote_addr
spec:
  rules:
  - host: api.lexiscan.ai
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: lexiscan-api
            port:
              number: 3001
```

## 📊 Monitoring and Alerts

### Scaling Metrics

#### 1. Performance Metrics
```bash
# Check CPU usage
kubectl top pods
kubectl top nodes

# Check memory usage
kubectl top pods --containers
kubectl top nodes

# Check network usage
kubectl exec -it deployment/lexiscan-api -- netstat -i
```

#### 2. Application Metrics
```bash
# Check request rate
curl http://localhost:9090/api/v1/query?query=rate(http_requests_total[5m])

# Check response time
curl http://localhost:9090/api/v1/query?query=histogram_quantile(0.95,rate(http_request_duration_seconds_bucket[5m]))

# Check error rate
curl http://localhost:9090/api/v1/query?query=rate(http_requests_total{status=~"5.."}[5m])
```

### Alert Configuration

#### 1. Scaling Alerts
```yaml
# scaling-alerts.yaml
groups:
  - name: scaling
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is {{ $value }}% on {{ $labels.instance }}"
      
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is {{ $value }}% on {{ $labels.instance }}"
      
      - alert: HighRequestRate
        expr: rate(http_requests_total[5m]) > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High request rate detected"
          description: "Request rate is {{ $value }} requests/second"
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [HPA Documentation](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [KEDA Documentation](https://keda.sh/docs/)
- [Monitoring Dashboards](http://localhost:3003)
- [Database Maintenance](ops/runbooks/database-maintenance.md)

---

**Last Updated**: December 2024  
**Maintained By**: LexiScan AI Platform Team  
**Version**: 1.0.0
