import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * GDPR Compliance Service
 * 
 * Provides comprehensive GDPR (General Data Protection Regulation) compliance
 * for the LexiScan AI platform. Implements data protection, privacy rights,
 * and regulatory compliance features required for EU data processing.
 * 
 * Features:
 * - Data subject rights management (access, rectification, erasure, portability)
 * - Consent management and tracking
 * - Data processing lawfulness verification
 * - Privacy by design implementation
 * - Data breach notification
 * - Data protection impact assessments (DPIA)
 * - Cross-border data transfer controls
 * - Automated compliance monitoring
 * 
 * @author LexiScan AI Platform Team
 * @version 1.0.0
 * @since 2024-12-01
 */
@Injectable()
export class GdprService {
  private readonly logger = new Logger(GdprService.name);
  private readonly dataRetentionPeriod: number;
  private readonly consentRetentionPeriod: number;
  private readonly breachNotificationPeriod: number;
  private readonly dpiaThreshold: number;

  constructor(private readonly configService: ConfigService) {
    this.dataRetentionPeriod = this.configService.get<number>('GDPR_DATA_RETENTION_DAYS', 2555) * 24 * 60 * 60 * 1000; // 7 years in milliseconds
    this.consentRetentionPeriod = this.configService.get<number>('GDPR_CONSENT_RETENTION_DAYS', 2555) * 24 * 60 * 60 * 1000; // 7 years in milliseconds
    this.breachNotificationPeriod = this.configService.get<number>('GDPR_BREACH_NOTIFICATION_HOURS', 72) * 60 * 60 * 1000; // 72 hours in milliseconds
    this.dpiaThreshold = this.configService.get<number>('GDPR_DPIA_THRESHOLD', 1000); // 1000 data subjects

    this.logger.log('GDPR compliance service initialized');
  }

  /**
   * Process data subject access request
   * 
   * @param dataSubjectId - Data subject identifier
   * @param requestId - Request identifier
   * @param options - Access request options
   * @returns Data subject access response
   */
  async processDataSubjectAccessRequest(
    dataSubjectId: string,
    requestId: string,
    options: DataSubjectAccessOptions = {}
  ): Promise<DataSubjectAccessResponse> {
    try {
      this.logger.log(`Processing data subject access request: ${requestId} for subject ${dataSubjectId}`);

      // Verify data subject identity
      const identityVerification = await this.verifyDataSubjectIdentity(dataSubjectId, options.identityProof);
      
      if (!identityVerification.verified) {
        throw new Error('Data subject identity verification failed');
      }

      // Collect all personal data for the subject
      const personalData = await this.collectPersonalData(dataSubjectId, options);
      
      // Generate data export
      const dataExport = await this.generateDataExport(personalData, options.format);
      
      // Create access response
      const response: DataSubjectAccessResponse = {
        requestId,
        dataSubjectId,
        processedAt: new Date().toISOString(),
        status: 'completed',
        dataExport: {
          format: options.format || 'json',
          size: dataExport.size,
          downloadUrl: dataExport.downloadUrl,
          expiresAt: this.calculateExpirationDate(30) // 30 days
        },
        personalData: {
          categories: personalData.categories,
          sources: personalData.sources,
          purposes: personalData.purposes,
          retentionPeriods: personalData.retentionPeriods
        },
        rights: {
          rectification: true,
          erasure: true,
          portability: true,
          restriction: true,
          objection: true
        },
        metadata: {
          processingTime: Date.now(),
          dataPoints: personalData.dataPoints,
          categories: personalData.categories.length,
          sources: personalData.sources.length
        }
      };

      // Log access request
      await this.logDataSubjectAccess(dataSubjectId, requestId, 'access', response);

      this.logger.log(`Data subject access request completed: ${requestId}`);
      return response;

    } catch (error) {
      this.logger.error(`Data subject access request failed: ${error.message}`, error.stack);
      throw new Error(`Failed to process data subject access request: ${error.message}`);
    }
  }

  /**
   * Process data subject rectification request
   * 
   * @param dataSubjectId - Data subject identifier
   * @param requestId - Request identifier
   * @param corrections - Data corrections to apply
   * @returns Data subject rectification response
   */
  async processDataSubjectRectificationRequest(
    dataSubjectId: string,
    requestId: string,
    corrections: DataCorrection[]
  ): Promise<DataSubjectRectificationResponse> {
    try {
      this.logger.log(`Processing data subject rectification request: ${requestId} for subject ${dataSubjectId}`);

      // Verify data subject identity
      const identityVerification = await this.verifyDataSubjectIdentity(dataSubjectId);
      
      if (!identityVerification.verified) {
        throw new Error('Data subject identity verification failed');
      }

      // Apply data corrections
      const correctionResults = await this.applyDataCorrections(dataSubjectId, corrections);
      
      // Create rectification response
      const response: DataSubjectRectificationResponse = {
        requestId,
        dataSubjectId,
        processedAt: new Date().toISOString(),
        status: 'completed',
        corrections: correctionResults,
        metadata: {
          processingTime: Date.now(),
          correctionsApplied: correctionResults.filter(r => r.status === 'applied').length,
          correctionsFailed: correctionResults.filter(r => r.status === 'failed').length
        }
      };

      // Log rectification request
      await this.logDataSubjectAccess(dataSubjectId, requestId, 'rectification', response);

      this.logger.log(`Data subject rectification request completed: ${requestId}`);
      return response;

    } catch (error) {
      this.logger.error(`Data subject rectification request failed: ${error.message}`, error.stack);
      throw new Error(`Failed to process data subject rectification request: ${error.message}`);
    }
  }

  /**
   * Process data subject erasure request (Right to be forgotten)
   * 
   * @param dataSubjectId - Data subject identifier
   * @param requestId - Request identifier
   * @param options - Erasure request options
   * @returns Data subject erasure response
   */
  async processDataSubjectErasureRequest(
    dataSubjectId: string,
    requestId: string,
    options: DataSubjectErasureOptions = {}
  ): Promise<DataSubjectErasureResponse> {
    try {
      this.logger.log(`Processing data subject erasure request: ${requestId} for subject ${dataSubjectId}`);

      // Verify data subject identity
      const identityVerification = await this.verifyDataSubjectIdentity(dataSubjectId);
      
      if (!identityVerification.verified) {
        throw new Error('Data subject identity verification failed');
      }

      // Check for legal obligations that prevent erasure
      const legalObligations = await this.checkLegalObligations(dataSubjectId);
      
      if (legalObligations.length > 0) {
        return {
          requestId,
          dataSubjectId,
          processedAt: new Date().toISOString(),
          status: 'partially_completed',
          erasureResults: [],
          legalObligations,
          metadata: {
            processingTime: Date.now(),
            erasureBlocked: true,
            legalObligationsCount: legalObligations.length
          }
        };
      }

      // Perform data erasure
      const erasureResults = await this.performDataErasure(dataSubjectId, options);
      
      // Create erasure response
      const response: DataSubjectErasureResponse = {
        requestId,
        dataSubjectId,
        processedAt: new Date().toISOString(),
        status: 'completed',
        erasureResults,
        metadata: {
          processingTime: Date.now(),
          dataPointsErasured: erasureResults.filter(r => r.status === 'erased').length,
          dataPointsRetained: erasureResults.filter(r => r.status === 'retained').length
        }
      };

      // Log erasure request
      await this.logDataSubjectAccess(dataSubjectId, requestId, 'erasure', response);

      this.logger.log(`Data subject erasure request completed: ${requestId}`);
      return response;

    } catch (error) {
      this.logger.error(`Data subject erasure request failed: ${error.message}`, error.stack);
      throw new Error(`Failed to process data subject erasure request: ${error.message}`);
    }
  }

  /**
   * Process data subject portability request
   * 
   * @param dataSubjectId - Data subject identifier
   * @param requestId - Request identifier
   * @param options - Portability request options
   * @returns Data subject portability response
   */
  async processDataSubjectPortabilityRequest(
    dataSubjectId: string,
    requestId: string,
    options: DataSubjectPortabilityOptions = {}
  ): Promise<DataSubjectPortabilityResponse> {
    try {
      this.logger.log(`Processing data subject portability request: ${requestId} for subject ${dataSubjectId}`);

      // Verify data subject identity
      const identityVerification = await this.verifyDataSubjectIdentity(dataSubjectId);
      
      if (!identityVerification.verified) {
        throw new Error('Data subject identity verification failed');
      }

      // Collect portable data
      const portableData = await this.collectPortableData(dataSubjectId, options);
      
      // Generate portable data export
      const dataExport = await this.generatePortableDataExport(portableData, options.format);
      
      // Create portability response
      const response: DataSubjectPortabilityResponse = {
        requestId,
        dataSubjectId,
        processedAt: new Date().toISOString(),
        status: 'completed',
        dataExport: {
          format: options.format || 'json',
          size: dataExport.size,
          downloadUrl: dataExport.downloadUrl,
          expiresAt: this.calculateExpirationDate(30) // 30 days
        },
        portableData: {
          categories: portableData.categories,
          sources: portableData.sources,
          purposes: portableData.purposes
        },
        metadata: {
          processingTime: Date.now(),
          dataPoints: portableData.dataPoints,
          categories: portableData.categories.length,
          sources: portableData.sources.length
        }
      };

      // Log portability request
      await this.logDataSubjectAccess(dataSubjectId, requestId, 'portability', response);

      this.logger.log(`Data subject portability request completed: ${requestId}`);
      return response;

    } catch (error) {
      this.logger.error(`Data subject portability request failed: ${error.message}`, error.stack);
      throw new Error(`Failed to process data subject portability request: ${error.message}`);
    }
  }

  /**
   * Manage consent for data processing
   * 
   * @param dataSubjectId - Data subject identifier
   * @param consentRequest - Consent request details
   * @returns Consent management response
   */
  async manageConsent(
    dataSubjectId: string,
    consentRequest: ConsentRequest
  ): Promise<ConsentResponse> {
    try {
      this.logger.log(`Managing consent for data subject: ${dataSubjectId}`);

      // Validate consent request
      const validation = await this.validateConsentRequest(consentRequest);
      
      if (!validation.valid) {
        throw new Error(`Invalid consent request: ${validation.errors.join(', ')}`);
      }

      // Process consent
      const consentResult = await this.processConsent(dataSubjectId, consentRequest);
      
      // Create consent response
      const response: ConsentResponse = {
        dataSubjectId,
        consentId: consentResult.consentId,
        processedAt: new Date().toISOString(),
        status: 'completed',
        consent: {
          given: consentRequest.given,
          purposes: consentRequest.purposes,
          categories: consentRequest.categories,
          lawfulBasis: consentRequest.lawfulBasis,
          givenAt: consentRequest.givenAt,
          expiresAt: consentRequest.expiresAt,
          withdrawnAt: consentRequest.withdrawnAt
        },
        metadata: {
          processingTime: Date.now(),
          consentVersion: consentResult.version,
          consentMethod: consentRequest.method,
          consentSource: consentRequest.source
        }
      };

      // Log consent management
      await this.logConsentManagement(dataSubjectId, consentRequest, response);

      this.logger.log(`Consent managed for data subject: ${dataSubjectId}`);
      return response;

    } catch (error) {
      this.logger.error(`Consent management failed: ${error.message}`, error.stack);
      throw new Error(`Failed to manage consent: ${error.message}`);
    }
  }

  /**
   * Process data breach notification
   * 
   * @param breachDetails - Data breach details
   * @returns Data breach notification response
   */
  async processDataBreachNotification(
    breachDetails: DataBreachDetails
  ): Promise<DataBreachNotificationResponse> {
    try {
      this.logger.log(`Processing data breach notification: ${breachDetails.breachId}`);

      // Assess breach severity
      const severityAssessment = await this.assessBreachSeverity(breachDetails);
      
      // Determine notification requirements
      const notificationRequirements = await this.determineNotificationRequirements(severityAssessment);
      
      // Send notifications
      const notifications = await this.sendBreachNotifications(breachDetails, notificationRequirements);
      
      // Create breach notification response
      const response: DataBreachNotificationResponse = {
        breachId: breachDetails.breachId,
        processedAt: new Date().toISOString(),
        status: 'completed',
        severity: severityAssessment.severity,
        notifications: notifications,
        regulatoryReporting: {
          required: notificationRequirements.regulatoryReporting,
          deadline: notificationRequirements.deadline,
          authorities: notificationRequirements.authorities
        },
        metadata: {
          processingTime: Date.now(),
          dataSubjectsAffected: breachDetails.dataSubjectsAffected,
          notificationChannels: notifications.length,
          regulatoryDeadline: notificationRequirements.deadline
        }
      };

      // Log breach notification
      await this.logDataBreachNotification(breachDetails, response);

      this.logger.log(`Data breach notification processed: ${breachDetails.breachId}`);
      return response;

    } catch (error) {
      this.logger.error(`Data breach notification failed: ${error.message}`, error.stack);
      throw new Error(`Failed to process data breach notification: ${error.message}`);
    }
  }

  /**
   * Perform Data Protection Impact Assessment (DPIA)
   * 
   * @param processingDetails - Data processing details
   * @returns DPIA assessment result
   */
  async performDPIA(
    processingDetails: DataProcessingDetails
  ): Promise<DPIAAssessment> {
    try {
      this.logger.log(`Performing DPIA for processing: ${processingDetails.processingId}`);

      // Assess processing risks
      const riskAssessment = await this.assessProcessingRisks(processingDetails);
      
      // Evaluate privacy measures
      const privacyMeasures = await this.evaluatePrivacyMeasures(processingDetails);
      
      // Determine DPIA necessity
      const dpiaNecessity = await this.determineDPIANecessity(processingDetails, riskAssessment);
      
      // Create DPIA assessment
      const assessment: DPIAAssessment = {
        processingId: processingDetails.processingId,
        assessedAt: new Date().toISOString(),
        status: 'completed',
        necessity: dpiaNecessity.required,
        riskLevel: riskAssessment.riskLevel,
        risks: riskAssessment.risks,
        privacyMeasures: privacyMeasures,
        recommendations: dpiaNecessity.recommendations,
        metadata: {
          processingTime: Date.now(),
          dataSubjectsCount: processingDetails.dataSubjectsCount,
          processingCategories: processingDetails.categories.length,
          riskFactors: riskAssessment.risks.length
        }
      };

      // Log DPIA assessment
      await this.logDPIAAssessment(processingDetails, assessment);

      this.logger.log(`DPIA assessment completed: ${processingDetails.processingId}`);
      return assessment;

    } catch (error) {
      this.logger.error(`DPIA assessment failed: ${error.message}`, error.stack);
      throw new Error(`Failed to perform DPIA: ${error.message}`);
    }
  }

  /**
   * Verify data subject identity
   * 
   * @param dataSubjectId - Data subject identifier
   * @param identityProof - Identity proof (optional)
   * @returns Identity verification result
   */
  private async verifyDataSubjectIdentity(
    dataSubjectId: string,
    identityProof?: IdentityProof
  ): Promise<IdentityVerification> {
    // In a real implementation, this would verify identity using various methods
    return {
      verified: true,
      method: 'email_verification',
      verifiedAt: new Date().toISOString(),
      confidence: 0.95
    };
  }

  /**
   * Collect personal data for a data subject
   * 
   * @param dataSubjectId - Data subject identifier
   * @param options - Collection options
   * @returns Personal data collection result
   */
  private async collectPersonalData(
    dataSubjectId: string,
    options: DataSubjectAccessOptions
  ): Promise<PersonalDataCollection> {
    // In a real implementation, this would collect all personal data
    return {
      categories: ['identity', 'contact', 'usage', 'preferences'],
      sources: ['user_registration', 'usage_analytics', 'support_tickets'],
      purposes: ['service_provision', 'analytics', 'support'],
      retentionPeriods: ['7_years', '2_years', '1_year'],
      dataPoints: 150
    };
  }

  /**
   * Generate data export
   * 
   * @param personalData - Personal data collection
   * @param format - Export format
   * @returns Data export result
   */
  private async generateDataExport(
    personalData: PersonalDataCollection,
    format: string = 'json'
  ): Promise<DataExport> {
    // In a real implementation, this would generate the actual export
    return {
      size: 1024 * 1024, // 1MB
      downloadUrl: `https://api.lexiscan.ai/exports/${Date.now()}.${format}`,
      expiresAt: this.calculateExpirationDate(30)
    };
  }

  /**
   * Apply data corrections
   * 
   * @param dataSubjectId - Data subject identifier
   * @param corrections - Data corrections
   * @returns Correction results
   */
  private async applyDataCorrections(
    dataSubjectId: string,
    corrections: DataCorrection[]
  ): Promise<DataCorrectionResult[]> {
    // In a real implementation, this would apply the corrections
    return corrections.map(correction => ({
      field: correction.field,
      status: 'applied' as const,
      correctedAt: new Date().toISOString(),
      oldValue: correction.oldValue,
      newValue: correction.newValue
    }));
  }

  /**
   * Check legal obligations
   * 
   * @param dataSubjectId - Data subject identifier
   * @returns Legal obligations
   */
  private async checkLegalObligations(dataSubjectId: string): Promise<LegalObligation[]> {
    // In a real implementation, this would check for legal obligations
    return [];
  }

  /**
   * Perform data erasure
   * 
   * @param dataSubjectId - Data subject identifier
   * @param options - Erasure options
   * @returns Erasure results
   */
  private async performDataErasure(
    dataSubjectId: string,
    options: DataSubjectErasureOptions
  ): Promise<DataErasureResult[]> {
    // In a real implementation, this would perform the actual erasure
    return [
      {
        dataCategory: 'identity',
        status: 'erased',
        erasedAt: new Date().toISOString(),
        dataPoints: 25
      },
      {
        dataCategory: 'contact',
        status: 'erased',
        erasedAt: new Date().toISOString(),
        dataPoints: 15
      }
    ];
  }

  /**
   * Collect portable data
   * 
   * @param dataSubjectId - Data subject identifier
   * @param options - Portability options
   * @returns Portable data collection
   */
  private async collectPortableData(
    dataSubjectId: string,
    options: DataSubjectPortabilityOptions
  ): Promise<PortableDataCollection> {
    // In a real implementation, this would collect portable data
    return {
      categories: ['identity', 'contact', 'preferences'],
      sources: ['user_registration', 'profile_updates'],
      purposes: ['service_provision'],
      dataPoints: 50
    };
  }

  /**
   * Generate portable data export
   * 
   * @param portableData - Portable data collection
   * @param format - Export format
   * @returns Data export result
   */
  private async generatePortableDataExport(
    portableData: PortableDataCollection,
    format: string = 'json'
  ): Promise<DataExport> {
    // In a real implementation, this would generate the portable export
    return {
      size: 512 * 1024, // 512KB
      downloadUrl: `https://api.lexiscan.ai/exports/portable/${Date.now()}.${format}`,
      expiresAt: this.calculateExpirationDate(30)
    };
  }

  /**
   * Validate consent request
   * 
   * @param consentRequest - Consent request
   * @returns Validation result
   */
  private async validateConsentRequest(consentRequest: ConsentRequest): Promise<ConsentValidation> {
    // In a real implementation, this would validate the consent request
    return {
      valid: true,
      errors: []
    };
  }

  /**
   * Process consent
   * 
   * @param dataSubjectId - Data subject identifier
   * @param consentRequest - Consent request
   * @returns Consent result
   */
  private async processConsent(
    dataSubjectId: string,
    consentRequest: ConsentRequest
  ): Promise<ConsentResult> {
    // In a real implementation, this would process the consent
    return {
      consentId: `consent_${Date.now()}`,
      version: '1.0'
    };
  }

  /**
   * Assess breach severity
   * 
   * @param breachDetails - Breach details
   * @returns Severity assessment
   */
  private async assessBreachSeverity(breachDetails: DataBreachDetails): Promise<BreachSeverityAssessment> {
    // In a real implementation, this would assess the breach severity
    return {
      severity: 'high',
      riskScore: 0.8,
      factors: ['data_subjects_affected', 'sensitive_data_involved', 'unauthorized_access']
    };
  }

  /**
   * Determine notification requirements
   * 
   * @param severityAssessment - Severity assessment
   * @returns Notification requirements
   */
  private async determineNotificationRequirements(
    severityAssessment: BreachSeverityAssessment
  ): Promise<NotificationRequirements> {
    // In a real implementation, this would determine notification requirements
    return {
      regulatoryReporting: true,
      deadline: new Date(Date.now() + this.breachNotificationPeriod).toISOString(),
      authorities: ['DPA', 'ICO', 'CNIL']
    };
  }

  /**
   * Send breach notifications
   * 
   * @param breachDetails - Breach details
   * @param requirements - Notification requirements
   * @returns Notification results
   */
  private async sendBreachNotifications(
    breachDetails: DataBreachDetails,
    requirements: NotificationRequirements
  ): Promise<BreachNotification[]> {
    // In a real implementation, this would send the notifications
    return [
      {
        channel: 'email',
        recipient: 'dpo@lexiscan.ai',
        sentAt: new Date().toISOString(),
        status: 'sent'
      }
    ];
  }

  /**
   * Assess processing risks
   * 
   * @param processingDetails - Processing details
   * @returns Risk assessment
   */
  private async assessProcessingRisks(processingDetails: DataProcessingDetails): Promise<ProcessingRiskAssessment> {
    // In a real implementation, this would assess the processing risks
    return {
      riskLevel: 'medium',
      risks: [
        {
          category: 'data_subject_rights',
          severity: 'medium',
          description: 'Potential impact on data subject rights'
        }
      ]
    };
  }

  /**
   * Evaluate privacy measures
   * 
   * @param processingDetails - Processing details
   * @returns Privacy measures evaluation
   */
  private async evaluatePrivacyMeasures(processingDetails: DataProcessingDetails): Promise<PrivacyMeasuresEvaluation> {
    // In a real implementation, this would evaluate privacy measures
    return {
      measures: [
        {
          type: 'encryption',
          implemented: true,
          effectiveness: 'high'
        },
        {
          type: 'access_controls',
          implemented: true,
          effectiveness: 'medium'
        }
      ]
    };
  }

  /**
   * Determine DPIA necessity
   * 
   * @param processingDetails - Processing details
   * @param riskAssessment - Risk assessment
   * @returns DPIA necessity
   */
  private async determineDPIANecessity(
    processingDetails: DataProcessingDetails,
    riskAssessment: ProcessingRiskAssessment
  ): Promise<DPIANecessity> {
    // In a real implementation, this would determine DPIA necessity
    return {
      required: processingDetails.dataSubjectsCount > this.dpiaThreshold,
      recommendations: [
        'Implement additional privacy measures',
        'Conduct regular risk assessments'
      ]
    };
  }

  /**
   * Calculate expiration date
   * 
   * @param days - Number of days
   * @returns Expiration date
   */
  private calculateExpirationDate(days: number): string {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    return expirationDate.toISOString();
  }

  /**
   * Log data subject access
   * 
   * @param dataSubjectId - Data subject identifier
   * @param requestId - Request identifier
   * @param requestType - Request type
   * @param response - Response data
   */
  private async logDataSubjectAccess(
    dataSubjectId: string,
    requestId: string,
    requestType: string,
    response: any
  ): Promise<void> {
    // In a real implementation, this would log the access
    this.logger.debug(`Data subject access logged: ${requestType} for ${dataSubjectId}`);
  }

  /**
   * Log consent management
   * 
   * @param dataSubjectId - Data subject identifier
   * @param consentRequest - Consent request
   * @param response - Consent response
   */
  private async logConsentManagement(
    dataSubjectId: string,
    consentRequest: ConsentRequest,
    response: ConsentResponse
  ): Promise<void> {
    // In a real implementation, this would log the consent management
    this.logger.debug(`Consent management logged for ${dataSubjectId}`);
  }

  /**
   * Log data breach notification
   * 
   * @param breachDetails - Breach details
   * @param response - Notification response
   */
  private async logDataBreachNotification(
    breachDetails: DataBreachDetails,
    response: DataBreachNotificationResponse
  ): Promise<void> {
    // In a real implementation, this would log the breach notification
    this.logger.debug(`Data breach notification logged: ${breachDetails.breachId}`);
  }

  /**
   * Log DPIA assessment
   * 
   * @param processingDetails - Processing details
   * @param assessment - DPIA assessment
   */
  private async logDPIAAssessment(
    processingDetails: DataProcessingDetails,
    assessment: DPIAAssessment
  ): Promise<void> {
    // In a real implementation, this would log the DPIA assessment
    this.logger.debug(`DPIA assessment logged: ${processingDetails.processingId}`);
  }
}

/**
 * Data Subject Access Options
 * 
 * Configuration options for data subject access requests.
 */
export interface DataSubjectAccessOptions {
  format?: 'json' | 'csv' | 'xml';
  categories?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  identityProof?: IdentityProof;
}

/**
 * Data Subject Access Response
 * 
 * Represents the response to a data subject access request.
 */
export interface DataSubjectAccessResponse {
  requestId: string;
  dataSubjectId: string;
  processedAt: string;
  status: 'completed' | 'failed' | 'in_progress';
  dataExport: {
    format: string;
    size: number;
    downloadUrl: string;
    expiresAt: string;
  };
  personalData: {
    categories: string[];
    sources: string[];
    purposes: string[];
    retentionPeriods: string[];
  };
  rights: {
    rectification: boolean;
    erasure: boolean;
    portability: boolean;
    restriction: boolean;
    objection: boolean;
  };
  metadata: {
    processingTime: number;
    dataPoints: number;
    categories: number;
    sources: number;
  };
}

/**
 * Data Correction
 * 
 * Represents a data correction request.
 */
export interface DataCorrection {
  field: string;
  oldValue: string;
  newValue: string;
  reason?: string;
}

/**
 * Data Subject Rectification Response
 * 
 * Represents the response to a data subject rectification request.
 */
export interface DataSubjectRectificationResponse {
  requestId: string;
  dataSubjectId: string;
  processedAt: string;
  status: 'completed' | 'failed' | 'in_progress';
  corrections: DataCorrectionResult[];
  metadata: {
    processingTime: number;
    correctionsApplied: number;
    correctionsFailed: number;
  };
}

/**
 * Data Correction Result
 * 
 * Represents the result of a data correction.
 */
export interface DataCorrectionResult {
  field: string;
  status: 'applied' | 'failed';
  correctedAt: string;
  oldValue: string;
  newValue: string;
  error?: string;
}

/**
 * Data Subject Erasure Options
 * 
 * Configuration options for data subject erasure requests.
 */
export interface DataSubjectErasureOptions {
  categories?: string[];
  reason?: string;
  verifyIdentity?: boolean;
}

/**
 * Data Subject Erasure Response
 * 
 * Represents the response to a data subject erasure request.
 */
export interface DataSubjectErasureResponse {
  requestId: string;
  dataSubjectId: string;
  processedAt: string;
  status: 'completed' | 'partially_completed' | 'failed';
  erasureResults: DataErasureResult[];
  legalObligations?: LegalObligation[];
  metadata: {
    processingTime: number;
    dataPointsErasured: number;
    dataPointsRetained: number;
  };
}

/**
 * Data Erasure Result
 * 
 * Represents the result of a data erasure operation.
 */
export interface DataErasureResult {
  dataCategory: string;
  status: 'erased' | 'retained';
  erasedAt: string;
  dataPoints: number;
  reason?: string;
}

/**
 * Legal Obligation
 * 
 * Represents a legal obligation that prevents data erasure.
 */
export interface LegalObligation {
  type: string;
  description: string;
  retentionPeriod: string;
  authority: string;
}

/**
 * Data Subject Portability Options
 * 
 * Configuration options for data subject portability requests.
 */
export interface DataSubjectPortabilityOptions {
  format?: 'json' | 'csv' | 'xml';
  categories?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Data Subject Portability Response
 * 
 * Represents the response to a data subject portability request.
 */
export interface DataSubjectPortabilityResponse {
  requestId: string;
  dataSubjectId: string;
  processedAt: string;
  status: 'completed' | 'failed' | 'in_progress';
  dataExport: {
    format: string;
    size: number;
    downloadUrl: string;
    expiresAt: string;
  };
  portableData: {
    categories: string[];
    sources: string[];
    purposes: string[];
  };
  metadata: {
    processingTime: number;
    dataPoints: number;
    categories: number;
    sources: number;
  };
}

/**
 * Consent Request
 * 
 * Represents a consent request for data processing.
 */
export interface ConsentRequest {
  given: boolean;
  purposes: string[];
  categories: string[];
  lawfulBasis: string;
  givenAt: string;
  expiresAt?: string;
  withdrawnAt?: string;
  method: string;
  source: string;
}

/**
 * Consent Response
 * 
 * Represents the response to a consent request.
 */
export interface ConsentResponse {
  dataSubjectId: string;
  consentId: string;
  processedAt: string;
  status: 'completed' | 'failed';
  consent: {
    given: boolean;
    purposes: string[];
    categories: string[];
    lawfulBasis: string;
    givenAt: string;
    expiresAt?: string;
    withdrawnAt?: string;
  };
  metadata: {
    processingTime: number;
    consentVersion: string;
    consentMethod: string;
    consentSource: string;
  };
}

/**
 * Data Breach Details
 * 
 * Represents details of a data breach.
 */
export interface DataBreachDetails {
  breachId: string;
  discoveredAt: string;
  dataSubjectsAffected: number;
  dataCategories: string[];
  breachType: string;
  description: string;
  impact: string;
}

/**
 * Data Breach Notification Response
 * 
 * Represents the response to a data breach notification.
 */
export interface DataBreachNotificationResponse {
  breachId: string;
  processedAt: string;
  status: 'completed' | 'failed';
  severity: string;
  notifications: BreachNotification[];
  regulatoryReporting: {
    required: boolean;
    deadline: string;
    authorities: string[];
  };
  metadata: {
    processingTime: number;
    dataSubjectsAffected: number;
    notificationChannels: number;
    regulatoryDeadline: string;
  };
}

/**
 * Data Processing Details
 * 
 * Represents details of data processing.
 */
export interface DataProcessingDetails {
  processingId: string;
  dataSubjectsCount: number;
  categories: string[];
  purposes: string[];
  lawfulBasis: string;
  description: string;
}

/**
 * DPIA Assessment
 * 
 * Represents the result of a Data Protection Impact Assessment.
 */
export interface DPIAAssessment {
  processingId: string;
  assessedAt: string;
  status: 'completed' | 'failed';
  necessity: boolean;
  riskLevel: string;
  risks: ProcessingRisk[];
  privacyMeasures: PrivacyMeasure[];
  recommendations: string[];
  metadata: {
    processingTime: number;
    dataSubjectsCount: number;
    processingCategories: number;
    riskFactors: number;
  };
}

/**
 * Identity Proof
 * 
 * Represents proof of identity for data subject verification.
 */
export interface IdentityProof {
  type: string;
  value: string;
  verified: boolean;
}

/**
 * Identity Verification
 * 
 * Represents the result of identity verification.
 */
export interface IdentityVerification {
  verified: boolean;
  method: string;
  verifiedAt: string;
  confidence: number;
}

/**
 * Personal Data Collection
 * 
 * Represents a collection of personal data for a data subject.
 */
export interface PersonalDataCollection {
  categories: string[];
  sources: string[];
  purposes: string[];
  retentionPeriods: string[];
  dataPoints: number;
}

/**
 * Data Export
 * 
 * Represents a data export result.
 */
export interface DataExport {
  size: number;
  downloadUrl: string;
  expiresAt: string;
}

/**
 * Portable Data Collection
 * 
 * Represents a collection of portable data for a data subject.
 */
export interface PortableDataCollection {
  categories: string[];
  sources: string[];
  purposes: string[];
  dataPoints: number;
}

/**
 * Consent Validation
 * 
 * Represents the result of consent request validation.
 */
export interface ConsentValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Consent Result
 * 
 * Represents the result of consent processing.
 */
export interface ConsentResult {
  consentId: string;
  version: string;
}

/**
 * Breach Severity Assessment
 * 
 * Represents the assessment of breach severity.
 */
export interface BreachSeverityAssessment {
  severity: string;
  riskScore: number;
  factors: string[];
}

/**
 * Notification Requirements
 * 
 * Represents the requirements for breach notifications.
 */
export interface NotificationRequirements {
  regulatoryReporting: boolean;
  deadline: string;
  authorities: string[];
}

/**
 * Breach Notification
 * 
 * Represents a breach notification.
 */
export interface BreachNotification {
  channel: string;
  recipient: string;
  sentAt: string;
  status: string;
}

/**
 * Processing Risk Assessment
 * 
 * Represents the assessment of processing risks.
 */
export interface ProcessingRiskAssessment {
  riskLevel: string;
  risks: ProcessingRisk[];
}

/**
 * Processing Risk
 * 
 * Represents a processing risk.
 */
export interface ProcessingRisk {
  category: string;
  severity: string;
  description: string;
}

/**
 * Privacy Measures Evaluation
 * 
 * Represents the evaluation of privacy measures.
 */
export interface PrivacyMeasuresEvaluation {
  measures: PrivacyMeasure[];
}

/**
 * Privacy Measure
 * 
 * Represents a privacy measure.
 */
export interface PrivacyMeasure {
  type: string;
  implemented: boolean;
  effectiveness: string;
}

/**
 * DPIA Necessity
 * 
 * Represents the necessity of a DPIA.
 */
export interface DPIANecessity {
  required: boolean;
  recommendations: string[];
}
