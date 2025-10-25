# LexiScan AI - Security Module

This module provides comprehensive security services for the LexiScan AI platform, including encryption, compliance, and scanning capabilities.

## Overview

The security module is designed to provide enterprise-grade security features for the LexiScan AI platform, ensuring compliance with various regulations and standards while maintaining the highest levels of data protection.

## Features

### 🔐 Encryption Services

- **Field Encryption**: AES-256-GCM encryption for individual database fields
- **File Encryption**: Secure file encryption with streaming support
- **Key Management**: Enterprise-grade key lifecycle management

### 📋 Compliance Services

- **GDPR Compliance**: Complete GDPR compliance implementation
- **HIPAA Compliance**: Healthcare data protection and compliance
- **PII Detection**: Advanced PII detection and classification
- **Data Retention**: Automated data lifecycle management

### 🔍 Scanning Services

- **Vulnerability Scanner**: Comprehensive security vulnerability scanning
- **Malware Scanner**: Real-time malware detection and prevention
- **Content Filter**: Advanced content filtering and moderation

## Architecture

```
apps/api/src/security/
├── encryption/
│   ├── field-encryption.service.ts    # Field-level encryption
│   ├── file-encryption.service.ts     # File-level encryption
│   └── key-management.service.ts      # Key management
├── compliance/
│   ├── gdpr.service.ts               # GDPR compliance
│   ├── hipaa.service.ts              # HIPAA compliance
│   ├── pii-detection.service.ts      # PII detection
│   └── data-retention.service.ts     # Data retention
├── scanning/
│   ├── vulnerability-scanner.ts      # Vulnerability scanning
│   ├── malware-scanner.ts            # Malware scanning
│   └── content-filter.ts             # Content filtering
├── index.ts                          # Module exports
└── README.md                         # This file
```

## Services

### Encryption Services

#### Field Encryption Service
Provides field-level encryption for sensitive data in the database.

```typescript
import { FieldEncryptionService } from './security/encryption/field-encryption.service';

// Encrypt a field
const encryptedField = await fieldEncryptionService.encryptField(
  'sensitive data',
  'pii',
  'email',
  'tenant-123'
);

// Decrypt a field
const decryptedValue = await fieldEncryptionService.decryptField(
  encryptedField,
  'tenant-123'
);
```

#### File Encryption Service
Provides file-level encryption for documents and other files.

```typescript
import { FileEncryptionService } from './security/encryption/file-encryption.service';

// Encrypt a file
const encryptedFile = await fileEncryptionService.encryptFile(
  '/path/to/file.pdf',
  'legal',
  'tenant-123'
);

// Decrypt a file
const decryptedFile = await fileEncryptionService.decryptFile(
  encryptedFile,
  '/path/to/decrypted.pdf',
  'tenant-123'
);
```

#### Key Management Service
Provides comprehensive key management capabilities.

```typescript
import { KeyManagementService } from './security/encryption/key-management.service';

// Generate a new key
const key = await keyManagementService.generateKey(
  'aes-256',
  'tenant-123',
  'encryption'
);

// Rotate a key
const rotationResult = await keyManagementService.rotateKey(
  'key-123',
  'tenant-123'
);
```

### Compliance Services

#### GDPR Service
Provides GDPR compliance features including data subject rights management.

```typescript
import { GdprService } from './security/compliance/gdpr.service';

// Process data subject access request
const accessResponse = await gdprService.processDataSubjectAccessRequest(
  'data-subject-123',
  'request-456'
);

// Process data subject erasure request
const erasureResponse = await gdprService.processDataSubjectErasureRequest(
  'data-subject-123',
  'request-789'
);
```

#### HIPAA Service
Provides HIPAA compliance features for healthcare data.

```typescript
import { HipaaService } from './security/compliance/hipaa.service';

// Classify data as PHI
const phiClassification = await hipaaService.classifyPHI(
  data,
  context
);

// Manage PHI access controls
const accessControl = await hipaaService.managePHIAccess(
  accessRequest
);
```

#### PII Detection Service
Provides PII detection and classification capabilities.

```typescript
import { PiiDetectionService } from './security/compliance/pii-detection.service';

// Detect PII in text
const detectionResult = await piiDetectionService.detectPIIInText(
  'John Doe, SSN: 123-45-6789',
  { filterByConfidence: true }
);

// Anonymize text
const anonymizedText = await piiDetectionService.anonymizeText(
  text,
  detectionResult.piiElements
);
```

#### Data Retention Service
Provides automated data retention management.

```typescript
import { DataRetentionService } from './security/compliance/data-retention.service';

// Apply data retention policy
const retentionPolicy = await dataRetentionService.applyDataRetentionPolicy(
  'data-123',
  'user_data',
  context
);

// Process data retention expiration
const expirationResult = await dataRetentionService.processDataRetentionExpiration(
  expiredData
);
```

### Scanning Services

#### Vulnerability Scanner
Provides comprehensive vulnerability scanning capabilities.

```typescript
import { VulnerabilityScannerService } from './security/scanning/vulnerability-scanner';

// Perform vulnerability scan
const scanResult = await vulnerabilityScannerService.performVulnerabilityScan({
  scanId: 'scan-123',
  scanType: 'comprehensive',
  targetType: 'application',
  target: 'https://api.lexiscan.ai'
});
```

#### Malware Scanner
Provides malware detection and prevention capabilities.

```typescript
import { MalwareScannerService } from './security/scanning/malware-scanner';

// Scan file for malware
const scanResult = await malwareScannerService.scanFileForMalware(
  '/path/to/file.exe',
  { includeBehavioral: true }
);

// Quarantine infected file
const quarantineResult = await malwareScannerService.quarantineFile(
  '/path/to/infected.exe',
  scanResult
);
```

#### Content Filter
Provides content filtering and moderation capabilities.

```typescript
import { ContentFilterService } from './security/scanning/content-filter';

// Filter text content
const filterResult = await contentFilterService.filterTextContent(
  'This is some text content',
  { filterLevel: 'strict' }
);

// Filter image content
const imageFilterResult = await contentFilterService.filterImageContent(
  imageData,
  { includeSpamDetection: true }
);
```

## Configuration

### Environment Variables

```bash
# Encryption
ENCRYPTION_MASTER_KEY=your_master_key_here
ENCRYPTION_SALT=your_salt_here

# GDPR
GDPR_DATA_RETENTION_DAYS=2555
GDPR_CONSENT_RETENTION_DAYS=2555
GDPR_BREACH_NOTIFICATION_HOURS=72
GDPR_DPIA_THRESHOLD=1000

# HIPAA
HIPAA_AUDIT_LOG_RETENTION_DAYS=2555
HIPAA_BREACH_NOTIFICATION_HOURS=60
HIPAA_ACCESS_LOG_RETENTION_DAYS=2555
HIPAA_ENCRYPTION_REQUIRED=true
HIPAA_MINIMUM_ACCESS_LEVEL=role_based

# PII Detection
PII_DETECTION_THRESHOLD=0.7
PII_CONFIDENCE_THRESHOLD=0.8
PII_ML_DETECTION_ENABLED=true
PII_CONTEXTUAL_ANALYSIS_ENABLED=true
PII_ANONYMIZATION_ENABLED=true

# Data Retention
DATA_RETENTION_DEFAULT_DAYS=2555
DATA_RETENTION_MAX_DAYS=3650
DATA_RETENTION_AUTOMATED_DELETION=true
DATA_RETENTION_ARCHIVING=true
DATA_RETENTION_LEGAL_HOLD=true
DATA_RETENTION_AUDIT_LOG_DAYS=2555

# Vulnerability Scanner
VULNERABILITY_SCAN_TIMEOUT=300
VULNERABILITY_MAX_CONCURRENT_SCANS=5
VULNERABILITY_REAL_TIME_SCANNING=true
VULNERABILITY_AUTOMATED_SCANNING=true
VULNERABILITY_SEVERITY_THRESHOLD=medium
VULNERABILITY_COMPLIANCE_STANDARDS=OWASP,NIST,CIS

# Malware Scanner
MALWARE_SCAN_TIMEOUT=300
MALWARE_MAX_FILE_SIZE=100
MALWARE_REAL_TIME_SCANNING=true
MALWARE_BEHAVIORAL_ANALYSIS=true
MALWARE_THREAT_INTELLIGENCE=true
MALWARE_QUARANTINE_ENABLED=true

# Content Filter
CONTENT_FILTER_TIMEOUT=30
CONTENT_FILTER_REAL_TIME=true
CONTENT_FILTER_IMAGE=true
CONTENT_FILTER_DOCUMENT=true
CONTENT_FILTER_SPAM=true
CONTENT_FILTER_PHISHING=true
CONTENT_FILTER_POLICY=true
```

## Security Considerations

### Encryption
- All encryption uses AES-256-GCM with authenticated encryption
- Keys are derived using PBKDF2 with 100,000 iterations
- Master keys are stored securely and never logged
- Key rotation is automated and configurable

### Compliance
- GDPR compliance includes all required data subject rights
- HIPAA compliance includes all required safeguards
- PII detection uses advanced ML models and pattern matching
- Data retention policies are automatically enforced

### Scanning
- Vulnerability scanning covers all OWASP Top 10 vulnerabilities
- Malware scanning uses multiple detection methods
- Content filtering supports multiple content types
- All scans are logged and auditable

## Best Practices

### Encryption
1. Always use field encryption for sensitive data
2. Implement proper key rotation policies
3. Use different encryption contexts for different data types
4. Monitor encryption performance and adjust as needed

### Compliance
1. Regularly review and update compliance policies
2. Implement automated compliance monitoring
3. Train staff on compliance requirements
4. Maintain detailed audit logs

### Scanning
1. Run vulnerability scans regularly
2. Implement real-time malware scanning
3. Use content filtering for user-generated content
4. Monitor scan results and take action on findings

## Troubleshooting

### Common Issues

1. **Encryption Performance**: If encryption is slow, consider using hardware acceleration or optimizing key derivation
2. **Compliance Violations**: Review compliance policies and ensure they are properly configured
3. **Scan False Positives**: Adjust scan sensitivity and review detection rules
4. **Content Filter Overblocking**: Review filter rules and adjust sensitivity

### Debugging

1. Enable debug logging for specific services
2. Check configuration values
3. Review audit logs for issues
4. Monitor performance metrics

## Support

For support with the security module:

1. Check the logs for error messages
2. Review the configuration
3. Consult the documentation
4. Contact the security team

## Contributing

When contributing to the security module:

1. Follow security best practices
2. Add comprehensive tests
3. Update documentation
4. Review security implications
5. Get security team approval

---

For more information about the security module, contact the security team or refer to the individual service documentation.
