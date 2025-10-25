# LexiScan AI - Kubernetes Infrastructure

Comprehensive Kubernetes manifests for deploying LexiScan AI in production.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Directory Structure](#directory-structure)
- [Deployment Guide](#deployment-guide)
- [Configuration](#configuration)
- [Monitoring](#monitoring)
- [Backup & Recovery](#backup--recovery)
- [Scaling](#scaling)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This infrastructure provides:

- **High Availability**: Multiple replicas with anti-affinity rules
- **Auto-scaling**: HPA for API, Web, and Worker services
- **Security**: RBAC, Network Policies, Pod Security Policies
- **Monitoring**: Prometheus, Grafana, AlertManager
- **Persistence**: StatefulSets for databases, PVCs for data
- **Backup**: Automated backups for PostgreSQL and Redis
- **TLS/SSL**: Certificate management with cert-manager
- **Ingress**: NGINX ingress with rate limiting and security headers

## ✅ Prerequisites

### Required Tools
```bash
kubectl >= 1.24
helm >= 3.0
```

### Cluster Requirements
- Kubernetes 1.24+
- 20+ vCPUs
- 40+ GB RAM
- 500+ GB storage
- Load Balancer support
- StorageClasses configured

### External Dependencies
- Domain with DNS control
- TLS certificates (or Let's Encrypt)
- Container registry access
- Cloud provider credentials (AWS/GCP/Azure)

## 🚀 Quick Start

### 1. Clone and Navigate
```bash
cd infra/k8s
```

### 2. Create Namespace
```bash
kubectl apply -f base/namespace.yaml
```

### 3. Configure Secrets
```bash
# DO NOT use default secrets in production!
# Create actual secrets:
kubectl create secret generic lexiscan-ai-secrets \
  --from-literal=DATABASE_URL='postgresql://user:pass@postgres:5432/lexiscan' \
  --from-literal=JWT_SECRET='your-secure-jwt-secret' \
  --from-literal=STRIPE_SECRET_KEY='sk_live_...' \
  --namespace=lexiscan-ai
```

### 4. Deploy Infrastructure
```bash
# Deploy in order:
kubectl apply -f base/
kubectl apply -f databases/
kubectl apply -f deployments/
kubectl apply -f services/
kubectl apply -f monitoring/
```

### 5. Verify Deployment
```bash
kubectl get pods -n lexiscan-ai
kubectl get svc -n lexiscan-ai
kubectl get ingress -n lexiscan-ai
```

## 📁 Directory Structure

```
infra/k8s/
├── base/                          # Base configuration
│   ├── namespace.yaml            # Namespace, quotas, limits
│   ├── configmap.yaml            # Application configuration
│   ├── secrets.yaml              # Secrets template
│   └── service-account.yaml      # Service accounts & RBAC
│
├── deployments/                   # Application deployments
│   ├── api-deployment.yaml       # NestJS API (3-20 replicas)
│   ├── web-deployment.yaml       # Next.js Web (3-15 replicas)
│   ├── worker-deployment.yaml    # AI Worker (2-20 replicas)
│   └── pdf-generator-deployment.yaml  # PDF Service (2-10 replicas)
│
├── services/                      # Network services
│   ├── api-service.yaml          # API service
│   ├── web-service.yaml          # Web service
│   └── ingress.yaml              # Ingress + cert-manager
│
├── databases/                     # Data layer
│   ├── postgres-statefulset.yaml # PostgreSQL (primary + replicas)
│   ├── redis-deployment.yaml     # Redis cache/queue
│   └── persistent-volumes.yaml   # Storage classes & PVCs
│
└── monitoring/                    # Observability stack
    ├── prometheus.yaml           # Metrics collection
    ├── grafana.yaml              # Visualization
    └── alertmanager.yaml         # Alert routing
```

## 📖 Deployment Guide

### Step-by-Step Production Deployment

#### 1. Prepare Cluster
```bash
# Verify cluster access
kubectl cluster-info

# Check available resources
kubectl top nodes

# Verify storage classes
kubectl get storageclasses
```

#### 2. Configure Environment

Edit `base/configmap.yaml`:
```yaml
# Update these values:
API_BASE_URL: "https://api.yourdomain.com"
WEB_PORT: "3001"
# ... other configurations
```

#### 3. Create Secrets

**IMPORTANT**: Never commit actual secrets!

```bash
# Database credentials
kubectl create secret generic postgres-admin-secret \
  --from-literal=POSTGRES_USER=lexiscan \
  --from-literal=POSTGRES_PASSWORD='YOUR_SECURE_PASSWORD' \
  --from-literal=POSTGRES_DB=lexiscan_production \
  --namespace=lexiscan-ai

# Application secrets
kubectl create secret generic lexiscan-ai-secrets \
  --from-literal=DATABASE_URL='postgresql://...' \
  --from-literal=JWT_SECRET='...' \
  --from-literal=STRIPE_SECRET_KEY='...' \
  --namespace=lexiscan-ai

# Redis password
kubectl create secret generic redis-secret \
  --from-literal=REDIS_PASSWORD='YOUR_REDIS_PASSWORD' \
  --namespace=lexiscan-ai

# TLS certificate
kubectl create secret tls lexiscan-tls-cert \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  --namespace=lexiscan-ai
```

#### 4. Deploy Base Configuration
```bash
kubectl apply -f base/namespace.yaml
kubectl apply -f base/configmap.yaml
kubectl apply -f base/service-account.yaml
```

#### 5. Deploy Databases
```bash
# Deploy PostgreSQL
kubectl apply -f databases/persistent-volumes.yaml
kubectl apply -f databases/postgres-statefulset.yaml

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n lexiscan-ai --timeout=300s

# Deploy Redis
kubectl apply -f databases/redis-deployment.yaml

# Verify databases
kubectl get pods -l app=postgres -n lexiscan-ai
kubectl get pods -l app=redis -n lexiscan-ai
```

#### 6. Deploy Applications
```bash
# Deploy API
kubectl apply -f deployments/api-deployment.yaml

# Wait for API to be ready
kubectl wait --for=condition=ready pod -l app=api -n lexiscan-ai --timeout=300s

# Deploy Web
kubectl apply -f deployments/web-deployment.yaml

# Deploy Worker
kubectl apply -f deployments/worker-deployment.yaml

# Deploy PDF Generator
kubectl apply -f deployments/pdf-generator-deployment.yaml
```

#### 7. Deploy Services & Ingress
```bash
# Deploy services
kubectl apply -f services/api-service.yaml
kubectl apply -f services/web-service.yaml

# Deploy ingress
kubectl apply -f services/ingress.yaml

# Get load balancer IP/hostname
kubectl get ingress -n lexiscan-ai
```

#### 8. Configure DNS
```bash
# Point your domains to the load balancer IP
# A records:
# api.lexiscan.ai -> LOAD_BALANCER_IP
# app.lexiscan.ai -> LOAD_BALANCER_IP
# lexiscan.ai -> LOAD_BALANCER_IP
```

#### 9. Deploy Monitoring
```bash
kubectl apply -f monitoring/prometheus.yaml
kubectl apply -f monitoring/grafana.yaml
kubectl apply -f monitoring/alertmanager.yaml
```

#### 10. Verify Deployment
```bash
# Check all pods
kubectl get pods -n lexiscan-ai

# Check services
kubectl get svc -n lexiscan-ai

# Check ingress
kubectl get ingress -n lexiscan-ai

# Check logs
kubectl logs -f deployment/api-deployment -n lexiscan-ai
```

## ⚙️ Configuration

### Environment Variables

All configuration is in `base/configmap.yaml`. Key settings:

- **Database**: Connection strings, pool sizes
- **Redis**: Host, port, DB index
- **API**: Port, CORS, rate limits
- **Storage**: Provider (S3/GCS/Azure), bucket
- **Email**: SMTP settings
- **Stripe**: API version, currency
- **Features**: Enable/disable features

### Resource Limits

Default resource allocations:

| Service | CPU Request | CPU Limit | Memory Request | Memory Limit |
|---------|-------------|-----------|----------------|--------------|
| API | 500m | 2000m | 1Gi | 4Gi |
| Web | 250m | 1000m | 512Mi | 2Gi |
| Worker | 1000m | 4000m | 2Gi | 8Gi |
| PDF Gen | 500m | 2000m | 1Gi | 4Gi |
| PostgreSQL | 1000m | 4000m | 2Gi | 8Gi |
| Redis | 250m | 1000m | 512Mi | 2Gi |

### Scaling Configuration

**HPA Settings**:
- API: 3-20 replicas (70% CPU)
- Web: 3-15 replicas (70% CPU)
- Worker: 2-20 replicas (queue-based)
- PDF: 2-10 replicas (70% CPU)

## 📊 Monitoring

### Access Grafana
```bash
kubectl port-forward svc/grafana-service 3000:3000 -n lexiscan-ai
# Navigate to http://localhost:3000
# Default: admin / (from secret)
```

### Access Prometheus
```bash
kubectl port-forward svc/prometheus-service 9090:9090 -n lexiscan-ai
# Navigate to http://localhost:9090
```

### Key Metrics

- **Request Rate**: `rate(http_requests_total[5m])`
- **Error Rate**: `rate(http_requests_total{status=~"5.."}[5m])`
- **Response Time**: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
- **Database Connections**: `pg_stat_database_numbackends`
- **Queue Length**: `redis_list_length{list="document-processing-queue"}`

### Alerts

AlertManager sends notifications for:
- High error rates (>5%)
- Slow response times (p95 > 1s)
- Pod crashes
- Resource exhaustion
- Database issues

## 💾 Backup & Recovery

### Automated Backups

**PostgreSQL**:
- Schedule: Daily at 2 AM
- Retention: 30 days
- Location: S3 bucket
- Format: Compressed SQL dump

**Redis**:
- Schedule: Daily at 3 AM
- Format: RDB snapshot
- Location: PVC

**Volume Snapshots**:
- Schedule: Daily at 4 AM
- Retention: 7 days
- Format: EBS/GCE snapshots

### Manual Backup
```bash
# PostgreSQL
kubectl exec -it postgres-0 -n lexiscan-ai -- \
  pg_dump -U lexiscan lexiscan_production | gzip > backup.sql.gz

# Redis
kubectl exec -it redis-deployment-xxx -n lexiscan-ai -- \
  redis-cli --rdb /tmp/dump.rdb
```

### Restore Process
```bash
# PostgreSQL
cat backup.sql.gz | gunzip | \
  kubectl exec -i postgres-0 -n lexiscan-ai -- \
  psql -U lexiscan lexiscan_production

# Redis
kubectl cp backup.rdb redis-deployment-xxx:/data/dump.rdb -n lexiscan-ai
kubectl rollout restart deployment/redis-deployment -n lexiscan-ai
```

## 📈 Scaling

### Manual Scaling
```bash
# Scale API
kubectl scale deployment api-deployment --replicas=10 -n lexiscan-ai

# Scale Worker
kubectl scale deployment worker-deployment --replicas=5 -n lexiscan-ai
```

### Auto-scaling (HPA)
```bash
# View HPA status
kubectl get hpa -n lexiscan-ai

# Adjust HPA
kubectl edit hpa api-hpa -n lexiscan-ai
```

### Cluster Scaling

For AWS EKS:
```bash
# Update node group
eksctl scale nodegroup --cluster=lexiscan-cluster --name=workers --nodes=10
```

## 🔒 Security

### Best Practices

1. **Secrets Management**
   - Use external secret managers (Vault, AWS Secrets Manager)
   - Never commit secrets to Git
   - Rotate secrets regularly (90 days)

2. **Network Security**
   - Network policies enabled
   - Ingress with WAF
   - TLS/SSL for all external traffic
   - mTLS for service-to-service

3. **RBAC**
   - Least privilege principle
   - Service accounts per service
   - Regular audit of permissions

4. **Pod Security**
   - Run as non-root
   - Read-only root filesystem
   - Drop all capabilities
   - Security contexts enforced

5. **Image Security**
   - Scan images for vulnerabilities
   - Use official base images
   - Pin image versions
   - Private registry with authentication

### Security Checklist

- [ ] All secrets encrypted at rest
- [ ] TLS certificates configured
- [ ] Network policies applied
- [ ] Pod security policies enabled
- [ ] RBAC configured
- [ ] Image scanning in CI/CD
- [ ] Audit logging enabled
- [ ] Monitoring and alerting active

## 🔧 Troubleshooting

### Common Issues

**Pods not starting**:
```bash
kubectl describe pod POD_NAME -n lexiscan-ai
kubectl logs POD_NAME -n lexiscan-ai --previous
```

**Database connection errors**:
```bash
# Check database pod
kubectl logs postgres-0 -n lexiscan-ai

# Test connection
kubectl run -it --rm debug --image=postgres:15 --restart=Never -- \
  psql -h postgres-service -U lexiscan -d lexiscan_production
```

**Ingress not working**:
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

# Check certificate
kubectl describe certificate lexiscan-tls-cert -n lexiscan-ai
```

**High memory usage**:
```bash
# Check resource usage
kubectl top pods -n lexiscan-ai

# Increase limits if needed
kubectl edit deployment api-deployment -n lexiscan-ai
```

### Debug Commands

```bash
# Get all resources
kubectl get all -n lexiscan-ai

# Watch pods
kubectl get pods -n lexiscan-ai -w

# Describe pod
kubectl describe pod POD_NAME -n lexiscan-ai

# Get events
kubectl get events -n lexiscan-ai --sort-by='.lastTimestamp'

# Shell into pod
kubectl exec -it POD_NAME -n lexiscan-ai -- /bin/sh

# Port forward
kubectl port-forward pod/POD_NAME 3000:3000 -n lexiscan-ai
```

## 📞 Support

For issues or questions:
- Check logs: `kubectl logs -f deployment/api-deployment -n lexiscan-ai`
- Review events: `kubectl get events -n lexiscan-ai`
- Contact: ops@lexiscan.ai

---

**Last Updated**: December 2024  
**Maintained By**: LexiScan AI Platform Team

