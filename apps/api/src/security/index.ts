/**
 * LexiScan AI - Security Module
 * 
 * Comprehensive security module for the LexiScan AI platform.
 * Provides encryption, compliance, and scanning services for enterprise-grade security.
 * 
 * @author LexiScan AI Platform Team
 * @version 1.0.0
 * @since 2024-12-01
 */

// Encryption Services
export { FieldEncryptionService } from './encryption/field-encryption.service';
export { FileEncryptionService } from './encryption/file-encryption.service';
export { KeyManagementService } from './encryption/key-management.service';

// Compliance Services
export { GdprService } from './compliance/gdpr.service';
export { HipaaService } from './compliance/hipaa.service';
export { PiiDetectionService } from './compliance/pii-detection.service';
export { DataRetentionService } from './compliance/data-retention.service';

// Scanning Services
export { VulnerabilityScannerService } from './scanning/vulnerability-scanner';
export { MalwareScannerService } from './scanning/malware-scanner';
export { ContentFilterService } from './scanning/content-filter';

// Encryption Types
export type {
  EncryptionContext,
  FieldEncryptionRequest,
  EncryptedField,
  DecryptedField,
  KeyRotationResult,
  EncryptionVerification
} from './encryption/field-encryption.service';

export type {
  FileEncryptionContext,
  FileEncryptionOptions,
  FileEncryptionRequest,
  EncryptedFileMetadata,
  DecryptedFileMetadata,
  FileKeyRotationResult,
  FileEncryptionVerification
} from './encryption/file-encryption.service';

export type {
  KeyType,
  KeyContext,
  KeyGenerationOptions,
  KeyMetadata,
  KeyRotationOptions,
  KeyRotationResult,
  KeyRevocationResult,
  KeyFilters,
  KeyUsageStats
} from './encryption/key-management.service';

// Compliance Types
export type {
  DataSubjectAccessOptions,
  DataSubjectAccessResponse,
  DataCorrection,
  DataSubjectRectificationResponse,
  DataCorrectionResult,
  DataSubjectErasureOptions,
  DataSubjectErasureResponse,
  DataErasureResult,
  LegalObligation,
  DataSubjectPortabilityOptions,
  DataSubjectPortabilityResponse,
  ConsentRequest,
  ConsentResponse,
  DataBreachDetails,
  DataBreachNotificationResponse,
  DataProcessingDetails,
  DPIAAssessment,
  IdentityProof,
  IdentityVerification,
  PersonalDataCollection,
  DataExport,
  PortableDataCollection,
  ConsentValidation,
  ConsentResult,
  BreachSeverityAssessment,
  NotificationRequirements,
  BreachNotification,
  ProcessingRiskAssessment,
  ProcessingRisk,
  PrivacyMeasuresEvaluation,
  PrivacyMeasure,
  DPIANecessity
} from './compliance/gdpr.service';

export type {
  DataContext,
  PHIElement,
  PHIClassificationDetails,
  PHISafeguard,
  PHIClassification,
  PHIAccessRequest,
  PHIAuthorization,
  PHIAccessControls,
  PHIAccessControl,
  PHIAccessLog,
  PHIAccessLogResult,
  PHIBreachDetails,
  PHIBreachAssessment,
  PHINotificationRequirements,
  PHINotification,
  PHIBreachNotificationResult,
  BAARequest,
  BAAResult,
  HIPAARiskAssessmentRequest,
  HIPAARiskAssessmentResult,
  WorkforceTrainingRequest,
  WorkforceTrainingResult
} from './compliance/hipaa.service';

export type {
  PiiPattern,
  PiiElement,
  PiiDetectionOptions,
  PiiDetectionResult,
  DocumentData,
  PiiClassificationOptions,
  PiiClassification,
  PiiClassificationResult,
  PiiAnonymizationOptions,
  PiiPseudonymizationOptions
} from './compliance/pii-detection.service';

export type {
  DataRetentionOptions,
  DataRetentionPolicy,
  DataRetentionPolicyResult,
  ExpiredData,
  DataRetentionExpirationOptions,
  ExpiredDataProcessingResult,
  DataRetentionExpirationResult,
  LegalHoldRequest,
  LegalHoldResult,
  LegalHoldReleaseOptions,
  LegalHoldReleaseResult,
  DataArchiveRequest,
  DataArchiveResult,
  DataRestoreRequest,
  DataRestoreResult,
  RetentionComplianceReportRequest,
  RetentionComplianceReport
} from './compliance/data-retention.service';

// Scanning Types
export type {
  VulnerabilityScanRequest,
  VulnerabilityScanOptions,
  Vulnerability,
  VulnerabilityScanResult
} from './scanning/vulnerability-scanner';

export type {
  MalwareScanOptions,
  MalwareThreat,
  MalwareScanResult,
  NetworkTrafficData,
  RealTimeMonitoringOptions,
  RealTimeMonitoringResult,
  QuarantineResult
} from './scanning/malware-scanner';

export type {
  ContentFilterOptions,
  ContentViolation,
  ContentFilterResult,
  RealTimeFilterResult,
  ImageData,
  DocumentData
} from './scanning/content-filter';
