# LexiScan AI - Operational Playbooks Quick Start

This guide provides a quick start for using operational playbooks in the LexiScan AI platform.

## Prerequisites

### 1. Install Ansible

```bash
# Install Ansible
pip install ansible

# Verify installation
ansible --version
```

### 2. Configure Inventory

Create `inventory/hosts.yml`:

```yaml
all:
  children:
    production:
      hosts:
        api-prod:
          ansible_host: api.lexiscan.ai
          ansible_user: ubuntu
        web-prod:
          ansible_host: web.lexiscan.ai
          ansible_user: ubuntu
        db-prod:
          ansible_host: db.lexiscan.ai
          ansible_user: ubuntu
      vars:
        environment: production
        region: us-east-1
    
    staging:
      hosts:
        api-staging:
          ansible_host: api-staging.lexiscan.ai
          ansible_user: ubuntu
        web-staging:
          ansible_host: web-staging.lexiscan.ai
          ansible_user: ubuntu
        db-staging:
          ansible_host: db-staging.lexiscan.ai
          ansible_user: ubuntu
      vars:
        environment: staging
        region: us-east-1
```

### 3. Configure Credentials

Create `ansible.cfg`:

```ini
[defaults]
inventory = inventory/hosts.yml
host_key_checking = False
remote_user = ubuntu
private_key_file = ~/.ssh/lexiscan.pem

[privilege_escalation]
become = True
become_method = sudo
become_user = root
become_ask_pass = False
```

## Quick Start Examples

### 1. Onboard New Tenant

```bash
# Basic tenant onboarding
ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml \
  -e tenant_name="Acme Corp" \
  -e tenant_slug="acme-corp" \
  -e owner_email="admin@acme-corp.com" \
  -e owner_first_name="John" \
  -e owner_last_name="Doe" \
  -e plan="enterprise" \
  -e region="us-east-1"

# With custom configuration
ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml \
  -e tenant_name="Acme Corp" \
  -e tenant_slug="acme-corp" \
  -e owner_email="admin@acme-corp.com" \
  -e owner_first_name="John" \
  -e owner_last_name="Doe" \
  -e plan="enterprise" \
  -e region="us-east-1" \
  -e custom_domain="acme.lexiscan.ai" \
  -e sso_enabled="true" \
  -e audit_logging="true"
```

### 2. Create Database Backup

```bash
# Full database backup
ansible-playbook -i inventory ops/playbooks/database-backup.yml \
  -e backup_type="full" \
  -e backup_location="s3://lexiscan-backups" \
  -e retention_days="30" \
  -e encryption="true" \
  -e compression="true"

# Incremental backup
ansible-playbook -i inventory ops/playbooks/database-backup.yml \
  -e backup_type="incremental" \
  -e backup_location="s3://lexiscan-backups" \
  -e retention_days="7" \
  -e encryption="true" \
  -e compression="true"
```

### 3. Run Security Audit

```bash
# Comprehensive security audit
ansible-playbook -i inventory ops/playbooks/security-audit.yml \
  -e audit_type="comprehensive" \
  -e audit_scope="full" \
  -e compliance_standard="SOC2" \
  -e audit_duration="7" \
  -e audit_frequency="monthly" \
  -e audit_team="security-team"

# Vulnerability scan only
ansible-playbook -i inventory ops/playbooks/security-audit.yml \
  -e audit_type="vulnerability" \
  -e audit_scope="application" \
  -e compliance_standard="SOC2" \
  -e audit_duration="1" \
  -e audit_frequency="weekly" \
  -e audit_team="security-team"
```

### 4. Migrate Users

```bash
# Migrate users between tenants
ansible-playbook -i inventory ops/playbooks/user-migration.yml \
  -e source_tenant="old-tenant" \
  -e target_tenant="new-tenant" \
  -e user_ids="user1,user2,user3" \
  -e migration_type="tenant" \
  -e dry_run="false"

# Dry run migration
ansible-playbook -i inventory ops/playbooks/user-migration.yml \
  -e source_tenant="old-tenant" \
  -e target_tenant="new-tenant" \
  -e user_ids="user1,user2,user3" \
  -e migration_type="tenant" \
  -e dry_run="true"
```

### 5. Execute Disaster Recovery

```bash
# Complete disaster recovery
ansible-playbook -i inventory ops/playbooks/disaster-recovery.yml \
  -e disaster_type="complete" \
  -e recovery_target="disaster-recovery" \
  -e backup_location="/backups" \
  -e recovery_location="/recovery" \
  -e recovery_time_objective="4" \
  -e recovery_point_objective="1"

# Partial disaster recovery
ansible-playbook -i inventory ops/playbooks/disaster-recovery.yml \
  -e disaster_type="partial" \
  -e recovery_target="disaster-recovery" \
  -e backup_location="/backups" \
  -e recovery_location="/recovery" \
  -e recovery_time_objective="2" \
  -e recovery_point_objective="0.5"
```

## Common Options

### Dry Run

Test playbook execution without making changes:

```bash
ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml --check
```

### Verbose Output

Get detailed output during execution:

```bash
# Basic verbose
ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml -v

# More verbose
ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml -vv

# Maximum verbose
ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml -vvv
```

### Limit Hosts

Run playbook on specific hosts:

```bash
# Run on production only
ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml --limit "production"

# Run on specific host
ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml --limit "api-prod"
```

### Tags

Run specific tasks with tags:

```bash
# Run only tenant creation tasks
ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml --tags "tenant-creation"

# Skip specific tasks
ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml --skip-tags "monitoring"
```

## Scheduling

### Cron

Schedule playbooks using cron:

```bash
# Edit crontab
crontab -e

# Add entries
# Run database backup daily at 2 AM
0 2 * * * ansible-playbook -i inventory ops/playbooks/database-backup.yml

# Run security audit weekly on Sunday at 3 AM
0 3 * * 0 ansible-playbook -i inventory ops/playbooks/security-audit.yml

# Run user migration monthly on the 1st at 4 AM
0 4 1 * * ansible-playbook -i inventory ops/playbooks/user-migration.yml
```

### Kubernetes CronJob

Create `k8s/playbook-scheduler.yml`:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup-scheduler
  namespace: lexiscan
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: ansible
            image: ansible/ansible:latest
            command:
            - ansible-playbook
            - -i
            - inventory
            - ops/playbooks/database-backup.yml
            - -e
            - backup_type=full
            - -e
            - backup_location=s3://lexiscan-backups
            - -e
            - retention_days=30
            - -e
            - encryption=true
            - -e
            - compression=true
          restartPolicy: OnFailure
```

## Monitoring

### Logging

All playbook executions are logged to:

- `/var/log/ansible/playbook.log`
- `/var/log/ansible/task.log`
- `/var/log/ansible/error.log`

### Notifications

Playbooks send notifications to:

- **Email**: `admin@lexiscan.ai`, `oncall@lexiscan.ai`
- **Slack**: `#platform-alerts`
- **PagerDuty**: `platform-team`

### Metrics

Track playbook metrics:

- Execution duration
- Success/failure rates
- Task performance
- Resource usage

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   # Check permissions
   ls -la ~/.ssh/lexiscan.pem
   
   # Fix permissions
   chmod 600 ~/.ssh/lexiscan.pem
   ```

2. **Connection Failed**
   ```bash
   # Test connection
   ansible all -i inventory -m ping
   
   # Test specific host
   ansible api-prod -i inventory -m ping
   ```

3. **Task Failed**
   ```bash
   # Check logs
   tail -f /var/log/ansible/error.log
   
   # Run with verbose output
   ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml -vvv
   ```

4. **Variable Not Found**
   ```bash
   # Check variable file
   cat group_vars/all.yml
   
   # Override variables
   ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml -e "variable_name=value"
   ```

### Debugging

1. **Check Mode**: Test without making changes
   ```bash
   ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml --check
   ```

2. **Step Mode**: Execute tasks one by one
   ```bash
   ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml --step
   ```

3. **Debug Mode**: Get detailed output
   ```bash
   ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml -vvv
   ```

## Best Practices

### 1. Testing

- Always test playbooks in non-production environments
- Use dry-run mode for testing
- Validate results after execution

### 2. Security

- Use Ansible Vault for sensitive data
- Implement proper access controls
- Audit playbook executions

### 3. Documentation

- Document all playbooks thoroughly
- Include usage examples
- Provide troubleshooting guides

### 4. Monitoring

- Monitor playbook execution
- Track performance metrics
- Set up alerts for failures

## Support

For support with playbooks:

1. **Documentation**: Check this guide and playbook documentation
2. **Logs**: Review execution logs for errors
3. **Team**: Contact the platform team
4. **Issues**: Submit issues through the support system

## Next Steps

1. **Explore Playbooks**: Review available playbooks
2. **Test Playbooks**: Try playbooks in non-production
3. **Customize**: Adapt playbooks for your needs
4. **Schedule**: Set up automated execution
5. **Monitor**: Implement monitoring and alerting

---

For more information, see the full documentation or contact the platform team.
