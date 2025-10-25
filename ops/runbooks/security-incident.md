# LexiScan AI - Security Incident Runbook

## 🔒 Overview

This runbook provides comprehensive procedures for responding to security incidents in the LexiScan AI platform. It covers incident classification, response procedures, containment measures, and recovery operations.

## 📋 Table of Contents

- [Security Incident Classification](#security-incident-classification)
- [Response Procedures](#response-procedures)
- [Containment Measures](#containment-measures)
- [Recovery Procedures](#recovery-procedures)
- [Post-Incident Activities](#post-incident-activities)
- [Prevention Measures](#prevention-measures)

## 🚨 Security Incident Classification

### Severity Levels

#### P1 - Critical (Response: 15 minutes)
- **Data Breach**: Unauthorized access to sensitive data
- **System Compromise**: Complete system takeover
- **Ransomware**: System encryption or data hostage
- **Insider Threat**: Malicious insider activity
- **Zero-Day Exploit**: Unknown vulnerability exploitation

#### P2 - High (Response: 1 hour)
- **Unauthorized Access**: Successful unauthorized login
- **Privilege Escalation**: Unauthorized privilege gain
- **Data Exfiltration**: Sensitive data theft
- **Malware Infection**: System malware detection
- **DDoS Attack**: Service availability impact

#### P3 - Medium (Response: 4 hours)
- **Suspicious Activity**: Unusual user behavior
- **Failed Intrusion**: Attempted unauthorized access
- **Vulnerability Exploitation**: Known vulnerability abuse
- **Social Engineering**: Phishing or social attacks
- **Insider Misuse**: Policy violations

#### P4 - Low (Response: 24 hours)
- **Security Alerts**: Automated security warnings
- **Policy Violations**: Minor security policy breaches
- **Vulnerability Reports**: Non-critical vulnerabilities
- **Security Training**: User education needs
- **Compliance Issues**: Minor compliance violations

## 🚀 Response Procedures

### Initial Response (0-15 minutes)

#### 1. Incident Acknowledgment
```bash
# Check system status
kubectl get pods
kubectl get services
kubectl get ingress

# Check security logs
kubectl logs deployment/lexiscan-api | grep -i "security\|auth\|unauthorized"
kubectl logs deployment/lexiscan-postgres | grep -i "security\|auth\|unauthorized"

# Check network connections
kubectl exec -it deployment/lexiscan-api -- netstat -an | grep ESTABLISHED
```

#### 2. Impact Assessment
- **Data Impact**: What data is affected?
- **System Impact**: Which systems are compromised?
- **User Impact**: How many users are affected?
- **Business Impact**: What is the business impact?
- **Timeline**: When did the incident occur?

#### 3. Initial Containment
```bash
# Isolate affected systems
kubectl scale deployment lexiscan-api --replicas=0
kubectl scale deployment lexiscan-web --replicas=0

# Block suspicious IPs
kubectl patch networkpolicy lexiscan-network-policy -p '{"spec":{"ingress":[{"from":[{"ipBlock":{"cidr":"10.0.0.0/8"}}]}]}}'

# Revoke compromised tokens
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "UPDATE user_sessions SET revoked = true WHERE ip_address = 'SUSPICIOUS_IP';"
```

### Investigation Phase (15-60 minutes)

#### 1. Evidence Collection
```bash
# Collect system logs
kubectl logs deployment/lexiscan-api --since=24h > security-logs-api-$(date +%Y%m%d-%H%M%S).log
kubectl logs deployment/lexiscan-web --since=24h > security-logs-web-$(date +%Y%m%d-%H%M%S).log
kubectl logs deployment/lexiscan-postgres --since=24h > security-logs-postgres-$(date +%Y%m%d-%H%M%S).log

# Collect network logs
kubectl exec -it deployment/lexiscan-api -- netstat -an > network-connections-$(date +%Y%m%d-%H%M%S).log
kubectl exec -it deployment/lexiscan-api -- ss -tuln > listening-ports-$(date +%Y%m%d-%H%M%S).log

# Collect process information
kubectl exec -it deployment/lexiscan-api -- ps aux > running-processes-$(date +%Y%m%d-%H%M%S).log
kubectl exec -it deployment/lexiscan-api -- lsof > open-files-$(date +%Y%m%d-%H%M%S).log
```

#### 2. Forensic Analysis
```bash
# Check for suspicious processes
kubectl exec -it deployment/lexiscan-api -- ps aux | grep -v "PID\|USER\|COMMAND"

# Check for suspicious network connections
kubectl exec -it deployment/lexiscan-api -- netstat -an | grep -v "127.0.0.1\|::1"

# Check for suspicious files
kubectl exec -it deployment/lexiscan-api -- find /app -type f -name "*.sh" -o -name "*.py" -o -name "*.pl" | head -20

# Check for suspicious users
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT * FROM users WHERE created_at > NOW() - INTERVAL '24 hours' ORDER BY created_at DESC;"
```

#### 3. Threat Identification
- **Attack Vector**: How was the system compromised?
- **Threat Actor**: Who is responsible?
- **Malware Type**: What type of malware is involved?
- **Data Access**: What data was accessed?
- **System Changes**: What changes were made?

### Containment Phase (1-4 hours)

#### 1. Immediate Containment
```bash
# Isolate compromised systems
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","securityContext":{"runAsNonRoot":true,"readOnlyRootFilesystem":true}}]}}}}'

# Block malicious IPs
kubectl patch networkpolicy lexiscan-network-policy -p '{"spec":{"ingress":[{"from":[{"ipBlock":{"cidr":"0.0.0.0/0","except":["10.0.0.0/8","172.16.0.0/12","192.168.0.0/16"]}}]}]}}'

# Revoke all sessions
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "UPDATE user_sessions SET revoked = true;"
```

#### 2. System Hardening
```bash
# Update security policies
kubectl patch podsecuritypolicy lexiscan-psp -p '{"spec":{"runAsUser":{"rule":"MustRunAsNonRoot"},"readOnlyRootFilesystem":true}}'

# Enable audit logging
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","env":[{"name":"AUDIT_LEVEL","value":"debug"}]}]}}}}'

# Enable security monitoring
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","env":[{"name":"SECURITY_MONITORING","value":"enabled"}]}]}}}}'
```

#### 3. Data Protection
```bash
# Encrypt sensitive data
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "UPDATE users SET password = crypt(password, gen_salt('bf'));"

# Backup critical data
kubectl exec -it deployment/lexiscan-postgres -- pg_dump -U lexiscan -d lexiscan --verbose --format=custom > security-backup-$(date +%Y%m%d-%H%M%S).sql

# Verify data integrity
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM users;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM documents;"
```

## 🔒 Containment Measures

### Network Containment

#### 1. Firewall Rules
```bash
# Block malicious IPs
kubectl patch networkpolicy lexiscan-network-policy -p '{"spec":{"ingress":[{"from":[{"ipBlock":{"cidr":"0.0.0.0/0","except":["10.0.0.0/8","172.16.0.0/12","192.168.0.0/16"]}}]}]}}'

# Block suspicious ports
kubectl patch networkpolicy lexiscan-network-policy -p '{"spec":{"ingress":[{"ports":[{"port":80,"protocol":"TCP"},{"port":443,"protocol":"TCP"}]}]}}'

# Enable DDoS protection
kubectl patch ingress lexiscan-ingress -p '{"metadata":{"annotations":{"nginx.ingress.kubernetes.io/rate-limit":"100","nginx.ingress.kubernetes.io/rate-limit-window":"1m"}}}'
```

#### 2. Service Isolation
```bash
# Isolate compromised services
kubectl patch service lexiscan-api -p '{"spec":{"selector":{"security":"isolated"}}}'

# Block external access
kubectl patch ingress lexiscan-ingress -p '{"spec":{"rules":[]}}'

# Enable service mesh security
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"metadata":{"annotations":{"sidecar.istio.io/inject":"true"}}}}}}'
```

### Access Control

#### 1. User Access Control
```bash
# Disable compromised accounts
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "UPDATE users SET is_active = false WHERE email = 'COMPROMISED_EMAIL';"

# Revoke all sessions
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "UPDATE user_sessions SET revoked = true;"

# Reset passwords
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "UPDATE users SET password = crypt('TEMP_PASSWORD', gen_salt('bf'));"
```

#### 2. API Access Control
```bash
# Revoke API keys
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "UPDATE api_keys SET revoked = true;"

# Enable rate limiting
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","env":[{"name":"RATE_LIMIT","value":"100"}]}]}}}}'

# Enable IP whitelisting
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","env":[{"name":"IP_WHITELIST","value":"10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"}]}]}}}}'
```

### Data Protection

#### 1. Data Encryption
```bash
# Encrypt sensitive data
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "UPDATE users SET password = crypt(password, gen_salt('bf'));"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "UPDATE documents SET content = pgp_sym_encrypt(content, 'ENCRYPTION_KEY');"

# Enable database encryption
kubectl patch deployment lexiscan-postgres -p '{"spec":{"template":{"spec":{"containers":[{"name":"postgres","env":[{"name":"POSTGRES_ENCRYPTION","value":"enabled"}]}]}}}}'
```

#### 2. Data Backup
```bash
# Create secure backup
kubectl exec -it deployment/lexiscan-postgres -- pg_dump -U lexiscan -d lexiscan --verbose --format=custom --compress=9 > secure-backup-$(date +%Y%m%d-%H%M%S).sql

# Encrypt backup
gpg --symmetric --cipher-algo AES256 secure-backup-$(date +%Y%m%d-%H%M%S).sql

# Store backup securely
mv secure-backup-$(date +%Y%m%d-%H%M%S).sql.gpg /secure-backups/
```

## 🔄 Recovery Procedures

### System Recovery

#### 1. Clean System Deployment
```bash
# Deploy clean system
kubectl delete all --all
kubectl delete pvc --all
kubectl delete secrets --all
kubectl delete configmaps --all

# Deploy fresh infrastructure
kubectl apply -f infra/k8s/base/
kubectl apply -f infra/k8s/deployments/
kubectl apply -f infra/k8s/services/
```

#### 2. Data Recovery
```bash
# Restore from secure backup
kubectl exec -it deployment/lexiscan-postgres -- pg_restore -U lexiscan -d lexiscan --clean --if-exists /secure-backups/secure-backup-20241201-120000.sql

# Verify data integrity
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM users;"
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "SELECT COUNT(*) FROM documents;"
```

#### 3. Security Hardening
```bash
# Enable security features
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","securityContext":{"runAsNonRoot":true,"readOnlyRootFilesystem":true,"allowPrivilegeEscalation":false}}]}}}}'

# Enable network policies
kubectl apply -f infra/k8s/security/network-policies.yaml

# Enable pod security policies
kubectl apply -f infra/k8s/security/pod-security-policies.yaml
```

### User Recovery

#### 1. Password Reset
```bash
# Reset all user passwords
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "UPDATE users SET password = crypt('TEMP_PASSWORD', gen_salt('bf'));"

# Send password reset emails
kubectl exec -it deployment/lexiscan-api -- npm run send-password-reset-emails
```

#### 2. Session Management
```bash
# Revoke all sessions
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "UPDATE user_sessions SET revoked = true;"

# Clear session storage
kubectl exec -it deployment/lexiscan-redis -- redis-cli FLUSHALL
```

#### 3. API Key Management
```bash
# Revoke all API keys
kubectl exec -it deployment/lexiscan-postgres -- psql -U lexiscan -d lexiscan -c "UPDATE api_keys SET revoked = true;"

# Generate new API keys
kubectl exec -it deployment/lexiscan-api -- npm run generate-api-keys
```

## 📋 Post-Incident Activities

### Incident Documentation

#### 1. Incident Report
```markdown
# Security Incident Report - [INCIDENT_ID]

## Summary
- **Incident ID**: [Unique identifier]
- **Severity**: P[1-4]
- **Duration**: [Start time] - [End time]
- **Systems Affected**: [List of affected systems]
- **Data Impact**: [Description of data impact]
- **Business Impact**: [Financial/reputation impact]

## Timeline
- [Time] - Incident detected
- [Time] - Incident acknowledged
- [Time] - Investigation started
- [Time] - Threat identified
- [Time] - Containment implemented
- [Time] - Recovery completed

## Threat Analysis
- **Attack Vector**: [How the system was compromised]
- **Threat Actor**: [Who is responsible]
- **Malware Type**: [Type of malware involved]
- **Data Access**: [What data was accessed]
- **System Changes**: [What changes were made]

## Response Actions
- **Immediate Actions**: [What was done immediately]
- **Containment Actions**: [What was done to contain the threat]
- **Recovery Actions**: [What was done to recover]
- **Prevention Actions**: [What was done to prevent recurrence]

## Lessons Learned
- **What Went Well**: [Positive aspects]
- **What Could Be Improved**: [Areas for improvement]
- **Action Items**: [Specific tasks to complete]
```

#### 2. Evidence Preservation
```bash
# Preserve evidence
mkdir -p /evidence/incident-$(date +%Y%m%d-%H%M%S)
cp security-logs-*.log /evidence/incident-$(date +%Y%m%d-%H%M%S)/
cp network-connections-*.log /evidence/incident-$(date +%Y%m%d-%H%M%S)/
cp running-processes-*.log /evidence/incident-$(date +%Y%m%d-%H%M%S)/

# Create evidence hash
cd /evidence/incident-$(date +%Y%m%d-%H%M%S)
sha256sum * > evidence-hash.txt
```

### Team Debrief

#### 1. Incident Review
- **Timeline Review**: Walk through incident timeline
- **Response Review**: What worked, what didn't
- **Tool Review**: Security tools and monitoring
- **Process Review**: Security procedures and policies

#### 2. Process Improvements
- **Security Monitoring**: Add missing security alerts
- **Automation**: Automate security responses
- **Documentation**: Update security procedures
- **Training**: Provide additional security training

## 🛡️ Prevention Measures

### Security Hardening

#### 1. System Hardening
```bash
# Enable security features
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","securityContext":{"runAsNonRoot":true,"readOnlyRootFilesystem":true,"allowPrivilegeEscalation":false}}]}}}}'

# Enable network policies
kubectl apply -f infra/k8s/security/network-policies.yaml

# Enable pod security policies
kubectl apply -f infra/k8s/security/pod-security-policies.yaml
```

#### 2. Access Control
```bash
# Enable multi-factor authentication
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","env":[{"name":"MFA_ENABLED","value":"true"}]}]}}}}'

# Enable IP whitelisting
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","env":[{"name":"IP_WHITELIST","value":"10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"}]}]}}}}'

# Enable rate limiting
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","env":[{"name":"RATE_LIMIT","value":"100"}]}]}}}}'
```

### Monitoring and Alerting

#### 1. Security Monitoring
```bash
# Enable security logging
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","env":[{"name":"SECURITY_LOGGING","value":"enabled"}]}]}}}}'

# Enable audit logging
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","env":[{"name":"AUDIT_LOGGING","value":"enabled"}]}]}}}}'

# Enable threat detection
kubectl patch deployment lexiscan-api -p '{"spec":{"template":{"spec":{"containers":[{"name":"api","env":[{"name":"THREAT_DETECTION","value":"enabled"}]}]}}}}'
```

#### 2. Security Alerts
```yaml
# security-alerts.yaml
groups:
  - name: security
    rules:
      - alert: SecurityBreach
        expr: security_events_total{type="breach"} > 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Security breach detected"
          description: "Security breach detected: {{ $labels.description }}"
      
      - alert: UnauthorizedAccess
        expr: security_events_total{type="unauthorized_access"} > 0
        for: 1m
        labels:
          severity: high
        annotations:
          summary: "Unauthorized access detected"
          description: "Unauthorized access detected: {{ $labels.description }}"
      
      - alert: SuspiciousActivity
        expr: security_events_total{type="suspicious_activity"} > 0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Suspicious activity detected"
          description: "Suspicious activity detected: {{ $labels.description }}"
```

## 📞 Emergency Contacts

### Security Team
- **Primary**: [Name] - [Phone] - [Email]
- **Secondary**: [Name] - [Phone] - [Email]
- **Manager**: [Name] - [Phone] - [Email]
- **Executive**: [Name] - [Phone] - [Email]

### External Contacts
- **Law Enforcement**: [Contact information]
- **Legal Team**: [Contact information]
- **Insurance**: [Contact information]
- **Forensics**: [Contact information]

## 📚 Additional Resources

- [Security Documentation](ops/security/)
- [Incident Response](ops/runbooks/incident-response.md)
- [Database Maintenance](ops/runbooks/database-maintenance.md)
- [Monitoring Dashboards](http://localhost:3003)

---

**Last Updated**: December 2024  
**Maintained By**: LexiScan AI Platform Team  
**Version**: 1.0.0
