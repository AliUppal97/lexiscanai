# LexiScan AI - Operational Playbooks

This directory contains automated playbooks for operational procedures in the LexiScan AI platform.

## Overview

Operational playbooks are automated procedures that can be executed to perform common operational tasks. They are designed to be:

- **Automated**: Can be executed without manual intervention
- **Repeatable**: Can be run multiple times with consistent results
- **Auditable**: All actions are logged and tracked
- **Scalable**: Can be adapted to different environments and requirements

## Playbooks

### 1. Onboarding New Tenant (`onboarding-new-tenant.yml`)

**Purpose**: Automate the onboarding process for new tenants in the multi-tenant SaaS platform.

**Key Features**:
- Tenant creation and configuration
- User account setup
- Resource provisioning
- Security configuration
- Monitoring setup
- Documentation generation

**Usage**:
```bash
# Execute onboarding playbook
ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml \
  -e tenant_name="acme-corp" \
  -e tenant_slug="acme-corp" \
  -e owner_email="admin@acme-corp.com" \
  -e owner_first_name="John" \
  -e owner_last_name="Doe" \
  -e plan="enterprise" \
  -e region="us-east-1"
```

**Variables**:
- `tenant_name`: Name of the tenant organization
- `tenant_slug`: URL-friendly slug for the tenant
- `owner_email`: Email of the tenant owner
- `owner_first_name`: First name of the tenant owner
- `owner_last_name`: Last name of the tenant owner
- `plan`: Subscription plan (starter, professional, enterprise)
- `region`: AWS region for deployment

### 2. User Migration (`user-migration.yml`)

**Purpose**: Migrate users between tenants or environments.

**Key Features**:
- User data migration
- Permission mapping
- Data validation
- Rollback capabilities
- Audit logging

**Usage**:
```bash
# Execute user migration playbook
ansible-playbook -i inventory ops/playbooks/user-migration.yml \
  -e source_tenant="old-tenant" \
  -e target_tenant="new-tenant" \
  -e user_ids="user1,user2,user3" \
  -e migration_type="tenant" \
  -e dry_run="false"
```

**Variables**:
- `source_tenant`: Source tenant for migration
- `target_tenant`: Target tenant for migration
- `user_ids`: Comma-separated list of user IDs to migrate
- `migration_type`: Type of migration (tenant, environment, region)
- `dry_run`: Whether to perform a dry run (true/false)

### 3. Database Backup (`database-backup.yml`)

**Purpose**: Create and manage database backups.

**Key Features**:
- Automated backup creation
- Backup verification
- Storage management
- Retention policies
- Recovery testing

**Usage**:
```bash
# Execute database backup playbook
ansible-playbook -i inventory ops/playbooks/database-backup.yml \
  -e backup_type="full" \
  -e backup_location="s3://lexiscan-backups" \
  -e retention_days="30" \
  -e encryption="true" \
  -e compression="true"
```

**Variables**:
- `backup_type`: Type of backup (full, incremental, differential)
- `backup_location`: Location to store backups
- `retention_days`: Number of days to retain backups
- `encryption`: Whether to encrypt backups (true/false)
- `compression`: Whether to compress backups (true/false)

### 4. Disaster Recovery (`disaster-recovery.yml`)

**Purpose**: Execute disaster recovery procedures.

**Key Features**:
- Disaster assessment
- Recovery environment creation
- Data restoration
- Service recovery
- Traffic switching
- Monitoring setup

**Usage**:
```bash
# Execute disaster recovery playbook
ansible-playbook -i inventory ops/playbooks/disaster-recovery.yml \
  -e disaster_type="complete" \
  -e recovery_target="disaster-recovery" \
  -e backup_location="/backups" \
  -e recovery_location="/recovery" \
  -e recovery_time_objective="4" \
  -e recovery_point_objective="1"
```

**Variables**:
- `disaster_type`: Type of disaster (complete, partial, database, application, network)
- `recovery_target`: Target for recovery
- `backup_location`: Location of backups
- `recovery_location`: Location for recovery
- `recovery_time_objective`: RTO in hours
- `recovery_point_objective`: RPO in hours

### 5. Security Audit (`security-audit.yml`)

**Purpose**: Perform comprehensive security audits.

**Key Features**:
- Vulnerability scanning
- Code security analysis
- Infrastructure security assessment
- Network security testing
- API security testing
- Database security testing
- Compliance reporting

**Usage**:
```bash
# Execute security audit playbook
ansible-playbook -i inventory ops/playbooks/security-audit.yml \
  -e audit_type="comprehensive" \
  -e audit_scope="full" \
  -e compliance_standard="SOC2" \
  -e audit_duration="7" \
  -e audit_frequency="monthly" \
  -e audit_team="security-team"
```

**Variables**:
- `audit_type`: Type of audit (comprehensive, vulnerability, compliance, penetration, code, infrastructure)
- `audit_scope`: Scope of audit (full, application, infrastructure, network, database, api)
- `compliance_standard`: Compliance standard (SOC2, ISO27001, HIPAA, GDPR, FedRAMP, PCI-DSS, NIST)
- `audit_duration`: Duration of audit in days
- `audit_frequency`: Frequency of audits (daily, weekly, monthly, quarterly, annually)
- `audit_team`: Team responsible for audit

## Execution

### Prerequisites

1. **Ansible**: Install Ansible 2.9 or later
2. **Inventory**: Configure Ansible inventory with target hosts
3. **Credentials**: Ensure proper credentials are configured
4. **Permissions**: Ensure execution user has necessary permissions

### Running Playbooks

1. **Dry Run**: Test playbook execution without making changes
   ```bash
   ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml --check
   ```

2. **Verbose Output**: Get detailed output during execution
   ```bash
   ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml -v
   ```

3. **Limit Hosts**: Run playbook on specific hosts
   ```bash
   ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml --limit "production"
   ```

4. **Tags**: Run specific tasks with tags
   ```bash
   ansible-playbook -i inventory ops/playbooks/onboarding-new-tenant.yml --tags "tenant-creation"
   ```

### Scheduling

Playbooks can be scheduled using:

1. **Cron**: Schedule playbooks using cron
   ```bash
   # Run database backup daily at 2 AM
   0 2 * * * ansible-playbook -i inventory ops/playbooks/database-backup.yml
   ```

2. **Ansible Tower/AWX**: Use Ansible Tower for advanced scheduling
3. **Kubernetes CronJob**: Schedule playbooks in Kubernetes
4. **CI/CD Pipelines**: Integrate with CI/CD pipelines

## Monitoring

### Logging

All playbook executions are logged with:
- Execution start/end times
- Task results
- Error messages
- Variable values
- Host information

### Notifications

Playbooks send notifications for:
- Execution start
- Task completion
- Errors and failures
- Final results

### Metrics

Track playbook metrics:
- Execution duration
- Success/failure rates
- Task performance
- Resource usage

## Best Practices

### 1. Idempotency

- Ensure playbooks can be run multiple times safely
- Use Ansible's built-in idempotency features
- Check for existing resources before creating new ones

### 2. Error Handling

- Implement proper error handling
- Use `failed_when` and `changed_when` conditions
- Provide meaningful error messages
- Implement rollback procedures

### 3. Security

- Use Ansible Vault for sensitive data
- Implement proper access controls
- Audit playbook executions
- Use least privilege principles

### 4. Documentation

- Document all playbooks thoroughly
- Include usage examples
- Document variable requirements
- Provide troubleshooting guides

### 5. Testing

- Test playbooks in non-production environments
- Use dry-run mode for testing
- Implement automated testing
- Validate results after execution

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure proper permissions for execution user
2. **Connection Failed**: Check network connectivity and credentials
3. **Task Failed**: Review error messages and logs
4. **Variable Not Found**: Ensure all required variables are provided

### Debugging

1. **Verbose Output**: Use `-v`, `-vv`, or `-vvv` for detailed output
2. **Check Mode**: Use `--check` to test without making changes
3. **Step Mode**: Use `--step` to execute tasks one by one
4. **Log Files**: Review Ansible log files for detailed information

### Support

For support with playbooks:
- Check documentation
- Review logs and error messages
- Contact the platform team
- Submit issues through the support system

## Contributing

### Adding New Playbooks

1. Create new playbook file in `ops/playbooks/`
2. Follow naming convention: `{purpose}.yml`
3. Include comprehensive documentation
4. Add to this README
5. Test thoroughly
6. Submit for review

### Updating Existing Playbooks

1. Test changes in non-production environment
2. Update documentation
3. Review with team
4. Deploy to production
5. Monitor execution

## Security Considerations

### Access Control

- Implement proper access controls for playbook execution
- Use role-based access control (RBAC)
- Audit playbook executions
- Limit playbook permissions

### Data Protection

- Encrypt sensitive data
- Use secure communication channels
- Implement data retention policies
- Follow data protection regulations

### Compliance

- Ensure playbooks comply with security policies
- Implement audit logging
- Follow compliance requirements
- Regular security reviews

## Performance

### Optimization

- Optimize playbook performance
- Use parallel execution where possible
- Implement caching strategies
- Monitor resource usage

### Scaling

- Design playbooks for scalability
- Use inventory groups effectively
- Implement proper error handling
- Monitor execution performance

## Maintenance

### Regular Updates

- Keep playbooks up to date
- Review and update documentation
- Test playbooks regularly
- Update dependencies

### Monitoring

- Monitor playbook execution
- Track performance metrics
- Identify optimization opportunities
- Regular reviews and updates

---

For more information about operational playbooks, contact the platform team or refer to the Ansible documentation.
