# CI/CD Pipelines Documentation

Comprehensive CI/CD workflows for LexiScan AI enterprise SaaS application.

## 📋 Table of Contents

- [Overview](#overview)
- [Workflows](#workflows)
- [Setup & Configuration](#setup--configuration)
- [Secrets Management](#secrets-management)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Our CI/CD pipeline provides:

- **Automated Testing**: Unit, integration, E2E tests on every commit
- **Security Scanning**: Multiple security layers (SAST, DAST, container scanning)
- **Automated Deployments**: Staging and production with approval gates
- **Dependency Management**: Automated updates and security patches
- **Performance Monitoring**: Load testing and performance regression detection
- **Quality Gates**: Code quality, test coverage, security thresholds

## 🚀 Workflows

### 1. CI - Build & Test (`ci.yml`)

**Triggers:**
- Push to `main`, `develop`, `feature/**`, `hotfix/**`
- Pull requests to `main`, `develop`
- Manual dispatch

**Features:**
- ✅ Code quality & linting (ESLint, Prettier, TypeScript)
- ✅ Unit tests (parallel execution per workspace)
- ✅ Integration tests (with PostgreSQL & Redis)
- ✅ E2E tests (Playwright)
- ✅ Docker image building
- ✅ SonarQube analysis
- ✅ Dependency vulnerability check

**Jobs:**
1. **code-quality** - ESLint, Prettier, TypeScript checks
2. **unit-tests** - Jest unit tests with coverage
3. **integration-tests** - API integration tests
4. **e2e-tests** - Full end-to-end testing
5. **build-docker** - Docker image builds
6. **sonarqube** - Code quality analysis
7. **dependency-check** - npm audit & Snyk
8. **build-summary** - Overall status

**Duration:** ~25-30 minutes

### 2. CD - Deploy to Staging (`cd-staging.yml`)

**Triggers:**
- Push to `develop` branch
- Manual dispatch

**Features:**
- ✅ Docker image build & push
- ✅ Database migrations
- ✅ Kubernetes deployment
- ✅ Configuration updates
- ✅ Smoke tests
- ✅ Performance baseline

**Jobs:**
1. **build-and-push** - Build production images
2. **database-migration** - Run DB migrations
3. **deploy-kubernetes** - Deploy to K8s staging
4. **update-config** - Update ConfigMaps/Secrets
5. **smoke-tests** - Post-deployment health checks
6. **performance-check** - Lighthouse & load tests
7. **deployment-summary** - Status & notifications

**Duration:** ~20-25 minutes

**Deployment URL:** https://staging.lexiscan.ai

### 3. CD - Deploy to Production (`cd-production.yml`)

**Triggers:**
- Push to `main` branch
- Release tags (`v*.*.*`)
- Manual dispatch

**Features:**
- ✅ Pre-deployment validation
- ✅ **Manual approval gate** (required)
- ✅ Production image building & signing
- ✅ Pre-deployment database backup
- ✅ Blue-green deployment
- ✅ Canary releases (optional)
- ✅ Automated rollback
- ✅ Post-deployment validation

**Jobs:**
1. **pre-deployment-checks** - Verify staging, backups, monitoring
2. **approval** - Manual approval gate (environment: production)
3. **build-production** - Build & sign images
4. **pre-deployment-backup** - RDS snapshot
5. **blue-green-deploy** - Deploy to green, switch traffic
6. **post-deployment-validation** - Health checks, smoke tests
7. **deployment-summary** - Release notes, notifications

**Duration:** ~35-45 minutes (including approval wait time)

**Deployment URL:** https://lexiscan.ai

### 4. Security Scanning (`security-scan.yml`)

**Triggers:**
- Schedule: Daily at 2 AM UTC
- Push to `main`, `develop`
- Pull requests
- Manual dispatch

**Features:**
- ✅ Secret detection (Gitleaks, TruffleHog)
- ✅ Dependency vulnerabilities (npm audit, Snyk, OWASP)
- ✅ SAST - Static analysis (CodeQL, Semgrep, SonarQube)
- ✅ Container scanning (Trivy, Grype, Snyk)
- ✅ IaC scanning (Checkov, Kubesec, tfsec)
- ✅ API security testing (OWASP ZAP, fuzzing)
- ✅ License compliance

**Jobs:**
1. **secret-scan** - Detect hardcoded secrets
2. **dependency-scan** - Vulnerability scanning
3. **sast-scan** - Static code analysis
4. **container-scan** - Docker image scanning
5. **iac-scan** - Infrastructure security
6. **api-security** - API penetration testing
7. **license-scan** - License compliance
8. **security-summary** - Consolidated report

**Duration:** ~30-40 minutes

### 5. Dependency Updates (`dependency-update.yml`)

**Triggers:**
- Schedule: Weekly on Monday at 6 AM UTC
- Manual dispatch

**Features:**
- ✅ NPM dependency updates (patch, minor, major)
- ✅ Security patch automation
- ✅ Docker base image updates
- ✅ Renovate Bot integration
- ✅ GitHub Actions updates
- ✅ Migration compatibility checks

**Jobs:**
1. **check-updates** - Scan for available updates
2. **update-npm** - Update Node.js dependencies
3. **security-updates** - Apply security patches (high priority)
4. **update-docker-images** - Update base images
5. **renovate** - Automated dependency updates
6. **update-actions** - Update GitHub Actions
7. **check-migrations** - Verify DB compatibility
8. **update-summary** - Status report

**Duration:** ~30 minutes

**Output:** Automated PRs for dependency updates

### 6. Performance Testing (`performance-test.yml`)

**Triggers:**
- Schedule: Weekly on Sunday at 3 AM UTC
- Push to `main`
- PR labeled with `performance`
- Manual dispatch

**Features:**
- ✅ Lighthouse audits (Web Vitals)
- ✅ API load testing (k6)
- ✅ Stress testing (breaking point)
- ✅ Spike testing (traffic spikes)
- ✅ Endurance testing (2-hour soak test)
- ✅ Database performance
- ✅ Frontend bundle analysis
- ✅ API benchmarking
- ✅ Performance regression detection

**Jobs:**
1. **lighthouse-audit** - Web performance metrics
2. **api-load-test** - API load testing (50-200 VUs)
3. **stress-test** - Find breaking point (500+ VUs)
4. **spike-test** - Traffic spike handling
5. **endurance-test** - 2-hour sustained load
6. **database-performance** - Query optimization
7. **frontend-performance** - Bundle size, Core Web Vitals
8. **api-benchmark** - Endpoint benchmarking
9. **regression-check** - Compare with baseline
10. **performance-summary** - Consolidated report

**Duration:** ~45-120 minutes (depending on test type)

## ⚙️ Setup & Configuration

### Prerequisites

1. **GitHub Repository Settings**
   ```bash
   # Enable Actions
   Settings → Actions → General → Allow all actions
   
   # Configure environments
   Settings → Environments → New environment
   - Name: production
   - Required reviewers: [team members]
   - Deployment branches: main
   ```

2. **Required Secrets**

   Navigate to: `Settings → Secrets and variables → Actions`

   **AWS Credentials:**
   ```
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   ```

   **Container Registry:**
   ```
   GITHUB_TOKEN (automatically provided)
   COSIGN_PRIVATE_KEY (for image signing)
   COSIGN_PASSWORD
   ```

   **Security Tools:**
   ```
   SNYK_TOKEN
   SONAR_TOKEN
   SONAR_HOST_URL
   GITLEAKS_LICENSE (optional)
   ```

   **Notifications:**
   ```
   SLACK_WEBHOOK_URL
   ```

   **Renovate:**
   ```
   RENOVATE_TOKEN (GitHub PAT with repo access)
   ```

3. **Kubernetes Configuration**
   ```bash
   # Update kubeconfig in workflows
   # Replace cluster names:
   # - lexiscan-staging
   # - lexiscan-production
   ```

4. **Domain Configuration**
   ```yaml
   # Update in workflows:
   STAGING_URL: https://staging.lexiscan.ai
   PRODUCTION_URL: https://lexiscan.ai
   API_STAGING_URL: https://api-staging.lexiscan.ai
   API_PRODUCTION_URL: https://api.lexiscan.ai
   ```

### Configuration Files

Create these files in your repository:

1. **`.lighthouserc.json`** (Lighthouse CI config)
   ```json
   {
     "ci": {
       "collect": {
         "numberOfRuns": 3
       },
       "assert": {
         "preset": "lighthouse:recommended",
         "assertions": {
           "categories:performance": ["error", {"minScore": 0.9}],
           "categories:accessibility": ["error", {"minScore": 0.9}],
           "categories:best-practices": ["error", {"minScore": 0.9}],
           "categories:seo": ["error", {"minScore": 0.9}]
         }
       }
     }
   }
   ```

2. **`.github/renovate.json`** (Renovate config)
   ```json
   {
     "extends": ["config:base"],
     "packageRules": [
       {
         "updateTypes": ["minor", "patch"],
         "automerge": true
       }
     ]
   }
   ```

3. **`.zap/rules.tsv`** (OWASP ZAP rules)
   ```
   10020	IGNORE	(X-Frame-Options)
   10021	IGNORE	(X-Content-Type-Options)
   ```

## 🔒 Secrets Management

### Required Secrets by Workflow

| Secret | CI | Staging | Production | Security | Dependencies | Performance |
|--------|----|---------| ------------|----------|--------------|-------------|
| AWS_ACCESS_KEY_ID | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| AWS_SECRET_ACCESS_KEY | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| GITHUB_TOKEN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SNYK_TOKEN | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| SONAR_TOKEN | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| SLACK_WEBHOOK_URL | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| COSIGN_PRIVATE_KEY | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

### Secret Rotation

**Monthly Rotation:**
- AWS credentials
- Snyk token
- SonarQube token

**Quarterly Rotation:**
- Cosign keys
- GitHub PATs

**Annual Rotation:**
- Slack webhooks

## 🎯 Best Practices

### 1. Branch Protection

Configure branch protection for `main` and `develop`:

```yaml
Required status checks:
  - code-quality
  - unit-tests
  - integration-tests
  - e2e-tests
  - security-scan

Require pull request reviews: 2
Require linear history: true
```

### 2. Pull Request Workflow

1. Create feature branch: `feature/your-feature`
2. Make changes and commit
3. CI runs automatically
4. Request reviews
5. Merge to `develop` (triggers staging deployment)
6. Test on staging
7. Create PR to `main`
8. Approval + merge triggers production deployment

### 3. Hotfix Workflow

1. Create hotfix branch from `main`: `hotfix/critical-fix`
2. Make fix and commit
3. CI runs
4. Create PR to `main`
5. Get emergency approval
6. Merge triggers production deployment
7. Backport to `develop`

### 4. Release Workflow

1. Update version in `package.json`
2. Create git tag: `git tag -a v1.2.3 -m "Release 1.2.3"`
3. Push tag: `git push origin v1.2.3`
4. Production deployment triggered
5. GitHub release created automatically

## 📊 Monitoring & Metrics

### CI Metrics

Track these metrics in GitHub Insights:

- **Build Success Rate:** Target > 95%
- **Average Build Time:** Target < 30 minutes
- **Test Pass Rate:** Target = 100%
- **Code Coverage:** Target > 80%

### Deployment Metrics

- **Deployment Frequency:** Daily to staging, weekly to production
- **Lead Time:** < 1 hour from commit to production
- **Mean Time to Recovery (MTTR):** < 15 minutes
- **Change Failure Rate:** < 5%

### Performance Metrics

- **Lighthouse Score:** > 90
- **API P95 Response Time:** < 500ms
- **Error Rate:** < 0.5%
- **Uptime:** > 99.9%

## 🐛 Troubleshooting

### Common Issues

**1. CI Failing on Dependency Installation**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**2. Docker Build Timeout**
```bash
# Increase timeout in workflow
timeout-minutes: 30

# Optimize Dockerfile (multi-stage builds, layer caching)
```

**3. Kubernetes Deployment Fails**
```bash
# Check pod status
kubectl get pods -n lexiscan-ai-staging

# Check logs
kubectl logs -f deployment/api-deployment -n lexiscan-ai-staging

# Rollback if needed
kubectl rollout undo deployment/api-deployment -n lexiscan-ai-staging
```

**4. Performance Tests Failing**
```bash
# Check if staging environment is healthy
curl https://api-staging.lexiscan.ai/health

# Verify resource limits
kubectl top pods -n lexiscan-ai-staging
```

**5. Security Scan False Positives**
```bash
# Add exclusions to security tools
# Update .zap/rules.tsv for OWASP ZAP
# Configure Snyk ignore policy
```

### Getting Help

1. Check workflow logs in Actions tab
2. Review error messages in Annotations
3. Check Slack notifications for detailed alerts
4. Contact DevOps team: devops@lexiscan.ai
5. Create issue with `ci/cd` label

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Kubernetes Deployment Guide](/infra/k8s/README.md)
- [Security Best Practices](/docs/SECURITY.md)
- [Performance Optimization Guide](/docs/PERFORMANCE.md)

---

**Last Updated:** December 2024  
**Maintained By:** LexiScan AI Platform Team  
**Version:** 1.0.0

