import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CacheService } from '../../services/cache.service';
import { AnalyticsService } from '../../services/analytics.service';

/**
 * Document Analytics Service
 * 
 * Provides comprehensive document analytics and processing insights for the LexiScan AI platform.
 * Tracks document processing, AI performance, content analysis, and document lifecycle metrics.
 * 
 * Key Features:
 * - Document processing analytics
 * - AI performance tracking
 * - Content analysis metrics
 * - Document lifecycle tracking
 * - Processing efficiency metrics
 * - Quality and accuracy analytics
 * 
 * @author LexiScan AI Team
 * @version 1.0.0
 * @since 2024-01-01
 */
@Injectable()
export class DocumentAnalyticsService {
  private readonly logger = new Logger(DocumentAnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly analytics: AnalyticsService,
  ) {}

  /**
   * Track document processing
   * 
   * @param tenantId - Tenant identifier
   * @param userId - User identifier
   * @param documentData - Document processing data
   * @returns Promise<void>
   */
  async trackDocumentProcessing(
    tenantId: string,
    userId: string,
    documentData: {
      documentId: string;
      documentType: string;
      fileSize: number;
      processingTime: number;
      aiProcessingTime: number;
      success: boolean;
      errorMessage?: string;
      features: string[];
      accuracy: number;
      confidence: number;
      entities: Array<{
        type: string;
        value: string;
        confidence: number;
      }>;
      metadata: Record<string, any>;
    },
  ): Promise<void> {
    try {
      // Store document processing data
      await this.prisma.documentProcessing.create({
        data: {
          tenantId,
          userId,
          documentId: documentData.documentId,
          documentType: documentData.documentType,
          fileSize: documentData.fileSize,
          processingTime: documentData.processingTime,
          aiProcessingTime: documentData.aiProcessingTime,
          success: documentData.success,
          errorMessage: documentData.errorMessage,
          features: documentData.features,
          accuracy: documentData.accuracy,
          confidence: documentData.confidence,
          entities: documentData.entities,
          metadata: documentData.metadata,
          timestamp: new Date(),
        },
      });

      // Track document analytics
      await this.analytics.track({
        tenantId,
        userId,
        event: 'document_processing',
        category: 'document_analytics',
        properties: {
          documentId: documentData.documentId,
          documentType: documentData.documentType,
          fileSize: documentData.fileSize,
          processingTime: documentData.processingTime,
          aiProcessingTime: documentData.aiProcessingTime,
          success: documentData.success,
          features: documentData.features,
          accuracy: documentData.accuracy,
          confidence: documentData.confidence,
        },
      });

      // Update document processing metrics
      await this.updateDocumentProcessingMetrics(tenantId, documentData);

      this.logger.log(`Document processing tracked: ${documentData.documentId} for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to track document processing: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Track document content analysis
   * 
   * @param tenantId - Tenant identifier
   * @param userId - User identifier
   * @param contentData - Content analysis data
   * @returns Promise<void>
   */
  async trackContentAnalysis(
    tenantId: string,
    userId: string,
    contentData: {
      documentId: string;
      analysisType: string;
      contentLength: number;
      wordCount: number;
      sentenceCount: number;
      paragraphCount: number;
      language: string;
      sentiment: {
        score: number;
        magnitude: number;
        label: string;
      };
      topics: Array<{
        topic: string;
        confidence: number;
        relevance: number;
      }>;
      keywords: Array<{
        keyword: string;
        frequency: number;
        importance: number;
      }>;
      readability: {
        score: number;
        level: string;
        grade: number;
      };
      complexity: {
        score: number;
        level: string;
        factors: string[];
      };
    },
  ): Promise<void> {
    try {
      // Store content analysis data
      await this.prisma.contentAnalysis.create({
        data: {
          tenantId,
          userId,
          documentId: contentData.documentId,
          analysisType: contentData.analysisType,
          contentLength: contentData.contentLength,
          wordCount: contentData.wordCount,
          sentenceCount: contentData.sentenceCount,
          paragraphCount: contentData.paragraphCount,
          language: contentData.language,
          sentiment: contentData.sentiment,
          topics: contentData.topics,
          keywords: contentData.keywords,
          readability: contentData.readability,
          complexity: contentData.complexity,
          timestamp: new Date(),
        },
      });

      // Track content analytics
      await this.analytics.track({
        tenantId,
        userId,
        event: 'content_analysis',
        category: 'document_analytics',
        properties: {
          documentId: contentData.documentId,
          analysisType: contentData.analysisType,
          contentLength: contentData.contentLength,
          wordCount: contentData.wordCount,
          language: contentData.language,
          sentiment: contentData.sentiment,
          topics: contentData.topics,
          readability: contentData.readability,
          complexity: contentData.complexity,
        },
      });

      // Update content analysis metrics
      await this.updateContentAnalysisMetrics(tenantId, contentData);

      this.logger.log(`Content analysis tracked: ${contentData.documentId} for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to track content analysis: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Track document lifecycle
   * 
   * @param tenantId - Tenant identifier
   * @param userId - User identifier
   * @param lifecycleData - Document lifecycle data
   * @returns Promise<void>
   */
  async trackDocumentLifecycle(
    tenantId: string,
    userId: string,
    lifecycleData: {
      documentId: string;
      stage: string;
      action: string;
      duration: number;
      success: boolean;
      errorMessage?: string;
      metadata: Record<string, any>;
    },
  ): Promise<void> {
    try {
      // Store document lifecycle data
      await this.prisma.documentLifecycle.create({
        data: {
          tenantId,
          userId,
          documentId: lifecycleData.documentId,
          stage: lifecycleData.stage,
          action: lifecycleData.action,
          duration: lifecycleData.duration,
          success: lifecycleData.success,
          errorMessage: lifecycleData.errorMessage,
          metadata: lifecycleData.metadata,
          timestamp: new Date(),
        },
      });

      // Track lifecycle analytics
      await this.analytics.track({
        tenantId,
        userId,
        event: 'document_lifecycle',
        category: 'document_analytics',
        properties: {
          documentId: lifecycleData.documentId,
          stage: lifecycleData.stage,
          action: lifecycleData.action,
          duration: lifecycleData.duration,
          success: lifecycleData.success,
        },
      });

      // Update lifecycle metrics
      await this.updateLifecycleMetrics(tenantId, lifecycleData);

      this.logger.log(`Document lifecycle tracked: ${lifecycleData.stage} for document ${lifecycleData.documentId}`);
    } catch (error) {
      this.logger.error(`Failed to track document lifecycle: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get document processing analytics
   * 
   * @param tenantId - Tenant identifier
   * @param startDate - Start date for analytics
   * @param endDate - End date for analytics
   * @returns Promise<DocumentProcessingAnalytics>
   */
  async getDocumentProcessingAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalDocuments: number;
    processedDocuments: number;
    failedDocuments: number;
    successRate: number;
    averageProcessingTime: number;
    averageAITime: number;
    processingEfficiency: number;
    documentTypes: Array<{
      type: string;
      count: number;
      percentage: number;
      averageProcessingTime: number;
      successRate: number;
    }>;
    processingTrend: Array<{
      period: string;
      documents: number;
      successRate: number;
      averageProcessingTime: number;
    }>;
    featureUsage: Array<{
      feature: string;
      usage: number;
      percentage: number;
      successRate: number;
    }>;
    accuracyMetrics: {
      averageAccuracy: number;
      averageConfidence: number;
      accuracyDistribution: Array<{
        range: string;
        count: number;
        percentage: number;
      }>;
    };
  }> {
    try {
      const cacheKey = `document_processing_analytics:${tenantId}:${startDate.toISOString()}:${endDate.toISOString()}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Get document processing data
      const documentProcessing = await this.prisma.documentProcessing.findMany({
        where: {
          tenantId,
          timestamp: { gte: startDate, lte: endDate },
        },
      });

      // Calculate processing metrics
      const totalDocuments = documentProcessing.length;
      const processedDocuments = documentProcessing.filter(doc => doc.success).length;
      const failedDocuments = totalDocuments - processedDocuments;
      const successRate = (processedDocuments / totalDocuments) * 100;
      const averageProcessingTime = documentProcessing.reduce((sum, doc) => sum + doc.processingTime, 0) / totalDocuments;
      const averageAITime = documentProcessing.reduce((sum, doc) => sum + doc.aiProcessingTime, 0) / totalDocuments;
      const processingEfficiency = (averageAITime / averageProcessingTime) * 100;

      // Calculate document types
      const documentTypes = this.calculateDocumentTypes(documentProcessing);

      // Calculate processing trend
      const processingTrend = this.calculateProcessingTrend(documentProcessing);

      // Calculate feature usage
      const featureUsage = this.calculateFeatureUsage(documentProcessing);

      // Calculate accuracy metrics
      const accuracyMetrics = this.calculateAccuracyMetrics(documentProcessing);

      const analytics = {
        totalDocuments,
        processedDocuments,
        failedDocuments,
        successRate,
        averageProcessingTime,
        averageAITime,
        processingEfficiency,
        documentTypes,
        processingTrend,
        featureUsage,
        accuracyMetrics,
      };

      // Cache for 1 hour
      await this.cache.set(cacheKey, JSON.stringify(analytics), 3600);

      return analytics;
    } catch (error) {
      this.logger.error(`Failed to get document processing analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get content analysis analytics
   * 
   * @param tenantId - Tenant identifier
   * @param startDate - Start date for analytics
   * @param endDate - End date for analytics
   * @returns Promise<ContentAnalysisAnalytics>
   */
  async getContentAnalysisAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalAnalyses: number;
    averageContentLength: number;
    averageWordCount: number;
    languageDistribution: Array<{
      language: string;
      count: number;
      percentage: number;
    }>;
    sentimentAnalysis: {
      averageScore: number;
      averageMagnitude: number;
      distribution: Array<{
        sentiment: string;
        count: number;
        percentage: number;
      }>;
    };
    topicAnalysis: Array<{
      topic: string;
      frequency: number;
      averageConfidence: number;
      averageRelevance: number;
    }>;
    readabilityAnalysis: {
      averageScore: number;
      averageGrade: number;
      distribution: Array<{
        level: string;
        count: number;
        percentage: number;
      }>;
    };
    complexityAnalysis: {
      averageScore: number;
      distribution: Array<{
        level: string;
        count: number;
        percentage: number;
      }>;
    };
  }> {
    try {
      const cacheKey = `content_analysis_analytics:${tenantId}:${startDate.toISOString()}:${endDate.toISOString()}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Get content analysis data
      const contentAnalysis = await this.prisma.contentAnalysis.findMany({
        where: {
          tenantId,
          timestamp: { gte: startDate, lte: endDate },
        },
      });

      // Calculate content metrics
      const totalAnalyses = contentAnalysis.length;
      const averageContentLength = contentAnalysis.reduce((sum, analysis) => sum + analysis.contentLength, 0) / totalAnalyses;
      const averageWordCount = contentAnalysis.reduce((sum, analysis) => sum + analysis.wordCount, 0) / totalAnalyses;

      // Calculate language distribution
      const languageDistribution = this.calculateLanguageDistribution(contentAnalysis);

      // Calculate sentiment analysis
      const sentimentAnalysis = this.calculateSentimentAnalysis(contentAnalysis);

      // Calculate topic analysis
      const topicAnalysis = this.calculateTopicAnalysis(contentAnalysis);

      // Calculate readability analysis
      const readabilityAnalysis = this.calculateReadabilityAnalysis(contentAnalysis);

      // Calculate complexity analysis
      const complexityAnalysis = this.calculateComplexityAnalysis(contentAnalysis);

      const analytics = {
        totalAnalyses,
        averageContentLength,
        averageWordCount,
        languageDistribution,
        sentimentAnalysis,
        topicAnalysis,
        readabilityAnalysis,
        complexityAnalysis,
      };

      // Cache for 1 hour
      await this.cache.set(cacheKey, JSON.stringify(analytics), 3600);

      return analytics;
    } catch (error) {
      this.logger.error(`Failed to get content analysis analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get document lifecycle analytics
   * 
   * @param tenantId - Tenant identifier
   * @param startDate - Start date for analytics
   * @param endDate - End date for analytics
   * @returns Promise<DocumentLifecycleAnalytics>
   */
  async getDocumentLifecycleAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalLifecycleEvents: number;
    averageLifecycleDuration: number;
    stageDistribution: Array<{
      stage: string;
      count: number;
      percentage: number;
      averageDuration: number;
      successRate: number;
    }>;
    actionDistribution: Array<{
      action: string;
      count: number;
      percentage: number;
      averageDuration: number;
      successRate: number;
    }>;
    lifecycleTrend: Array<{
      period: string;
      events: number;
      averageDuration: number;
      successRate: number;
    }>;
    bottlenecks: Array<{
      stage: string;
      averageDuration: number;
      frequency: number;
      impact: number;
    }>;
  }> {
    try {
      const cacheKey = `document_lifecycle_analytics:${tenantId}:${startDate.toISOString()}:${endDate.toISOString()}`;
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      // Get document lifecycle data
      const documentLifecycle = await this.prisma.documentLifecycle.findMany({
        where: {
          tenantId,
          timestamp: { gte: startDate, lte: endDate },
        },
      });

      // Calculate lifecycle metrics
      const totalLifecycleEvents = documentLifecycle.length;
      const averageLifecycleDuration = documentLifecycle.reduce((sum, event) => sum + event.duration, 0) / totalLifecycleEvents;

      // Calculate stage distribution
      const stageDistribution = this.calculateStageDistribution(documentLifecycle);

      // Calculate action distribution
      const actionDistribution = this.calculateActionDistribution(documentLifecycle);

      // Calculate lifecycle trend
      const lifecycleTrend = this.calculateLifecycleTrend(documentLifecycle);

      // Calculate bottlenecks
      const bottlenecks = this.calculateBottlenecks(documentLifecycle);

      const analytics = {
        totalLifecycleEvents,
        averageLifecycleDuration,
        stageDistribution,
        actionDistribution,
        lifecycleTrend,
        bottlenecks,
      };

      // Cache for 1 hour
      await this.cache.set(cacheKey, JSON.stringify(analytics), 3600);

      return analytics;
    } catch (error) {
      this.logger.error(`Failed to get document lifecycle analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update document processing metrics cache
   * 
   * @param tenantId - Tenant identifier
   * @param documentData - Document data
   * @returns Promise<void>
   */
  private async updateDocumentProcessingMetrics(tenantId: string, documentData: any): Promise<void> {
    try {
      const cacheKey = `document_processing_analytics:${tenantId}`;
      await this.cache.del(cacheKey);
    } catch (error) {
      this.logger.error(`Failed to update document processing metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Update content analysis metrics cache
   * 
   * @param tenantId - Tenant identifier
   * @param contentData - Content data
   * @returns Promise<void>
   */
  private async updateContentAnalysisMetrics(tenantId: string, contentData: any): Promise<void> {
    try {
      const cacheKey = `content_analysis_analytics:${tenantId}`;
      await this.cache.del(cacheKey);
    } catch (error) {
      this.logger.error(`Failed to update content analysis metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Update lifecycle metrics cache
   * 
   * @param tenantId - Tenant identifier
   * @param lifecycleData - Lifecycle data
   * @returns Promise<void>
   */
  private async updateLifecycleMetrics(tenantId: string, lifecycleData: any): Promise<void> {
    try {
      const cacheKey = `document_lifecycle_analytics:${tenantId}`;
      await this.cache.del(cacheKey);
    } catch (error) {
      this.logger.error(`Failed to update lifecycle metrics: ${error.message}`, error.stack);
    }
  }

  /**
   * Calculate document types
   * 
   * @param documentProcessing - Document processing data
   * @returns Document types breakdown
   */
  private calculateDocumentTypes(documentProcessing: any[]): Array<{
    type: string;
    count: number;
    percentage: number;
    averageProcessingTime: number;
    successRate: number;
  }> {
    const typeMap = new Map<string, { count: number; totalProcessingTime: number; successes: number }>();
    
    documentProcessing.forEach(doc => {
      if (!typeMap.has(doc.documentType)) {
        typeMap.set(doc.documentType, { count: 0, totalProcessingTime: 0, successes: 0 });
      }
      
      const typeData = typeMap.get(doc.documentType);
      typeData.count += 1;
      typeData.totalProcessingTime += doc.processingTime;
      if (doc.success) {
        typeData.successes += 1;
      }
    });

    const totalDocuments = documentProcessing.length;

    return Array.from(typeMap.entries())
      .map(([type, data]) => ({
        type,
        count: data.count,
        percentage: (data.count / totalDocuments) * 100,
        averageProcessingTime: data.totalProcessingTime / data.count,
        successRate: (data.successes / data.count) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate processing trend
   * 
   * @param documentProcessing - Document processing data
   * @returns Processing trend
   */
  private calculateProcessingTrend(documentProcessing: any[]): Array<{
    period: string;
    documents: number;
    successRate: number;
    averageProcessingTime: number;
  }> {
    // Group by day
    const dailyProcessing = new Map<string, { documents: number; successes: number; totalProcessingTime: number }>();
    
    documentProcessing.forEach(doc => {
      const day = doc.timestamp.toISOString().substring(0, 10);
      if (!dailyProcessing.has(day)) {
        dailyProcessing.set(day, { documents: 0, successes: 0, totalProcessingTime: 0 });
      }
      
      const dayData = dailyProcessing.get(day);
      dayData.documents += 1;
      dayData.totalProcessingTime += doc.processingTime;
      if (doc.success) {
        dayData.successes += 1;
      }
    });

    return Array.from(dailyProcessing.entries())
      .map(([period, data]) => ({
        period,
        documents: data.documents,
        successRate: (data.successes / data.documents) * 100,
        averageProcessingTime: data.totalProcessingTime / data.documents,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Calculate feature usage
   * 
   * @param documentProcessing - Document processing data
   * @returns Feature usage breakdown
   */
  private calculateFeatureUsage(documentProcessing: any[]): Array<{
    feature: string;
    usage: number;
    percentage: number;
    successRate: number;
  }> {
    const featureMap = new Map<string, { usage: number; successes: number }>();
    
    documentProcessing.forEach(doc => {
      doc.features.forEach(feature => {
        if (!featureMap.has(feature)) {
          featureMap.set(feature, { usage: 0, successes: 0 });
        }
        
        const featureData = featureMap.get(feature);
        featureData.usage += 1;
        if (doc.success) {
          featureData.successes += 1;
        }
      });
    });

    const totalUsage = documentProcessing.reduce((sum, doc) => sum + doc.features.length, 0);

    return Array.from(featureMap.entries())
      .map(([feature, data]) => ({
        feature,
        usage: data.usage,
        percentage: (data.usage / totalUsage) * 100,
        successRate: (data.successes / data.usage) * 100,
      }))
      .sort((a, b) => b.usage - a.usage);
  }

  /**
   * Calculate accuracy metrics
   * 
   * @param documentProcessing - Document processing data
   * @returns Accuracy metrics
   */
  private calculateAccuracyMetrics(documentProcessing: any[]): {
    averageAccuracy: number;
    averageConfidence: number;
    accuracyDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
  } {
    const successfulDocs = documentProcessing.filter(doc => doc.success);
    const averageAccuracy = successfulDocs.reduce((sum, doc) => sum + doc.accuracy, 0) / successfulDocs.length;
    const averageConfidence = successfulDocs.reduce((sum, doc) => sum + doc.confidence, 0) / successfulDocs.length;

    // Calculate accuracy distribution
    const accuracyRanges = [
      { range: '0-20%', min: 0, max: 20 },
      { range: '21-40%', min: 21, max: 40 },
      { range: '41-60%', min: 41, max: 60 },
      { range: '61-80%', min: 61, max: 80 },
      { range: '81-100%', min: 81, max: 100 },
    ];

    const accuracyDistribution = accuracyRanges.map(range => {
      const count = successfulDocs.filter(doc => doc.accuracy >= range.min && doc.accuracy <= range.max).length;
      return {
        range: range.range,
        count,
        percentage: (count / successfulDocs.length) * 100,
      };
    });

    return {
      averageAccuracy,
      averageConfidence,
      accuracyDistribution,
    };
  }

  /**
   * Calculate language distribution
   * 
   * @param contentAnalysis - Content analysis data
   * @returns Language distribution
   */
  private calculateLanguageDistribution(contentAnalysis: any[]): Array<{
    language: string;
    count: number;
    percentage: number;
  }> {
    const languageMap = new Map<string, number>();
    const totalAnalyses = contentAnalysis.length;

    contentAnalysis.forEach(analysis => {
      const current = languageMap.get(analysis.language) || 0;
      languageMap.set(analysis.language, current + 1);
    });

    return Array.from(languageMap.entries())
      .map(([language, count]) => ({
        language,
        count,
        percentage: (count / totalAnalyses) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate sentiment analysis
   * 
   * @param contentAnalysis - Content analysis data
   * @returns Sentiment analysis
   */
  private calculateSentimentAnalysis(contentAnalysis: any[]): {
    averageScore: number;
    averageMagnitude: number;
    distribution: Array<{
      sentiment: string;
      count: number;
      percentage: number;
    }>;
  } {
    const averageScore = contentAnalysis.reduce((sum, analysis) => sum + analysis.sentiment.score, 0) / contentAnalysis.length;
    const averageMagnitude = contentAnalysis.reduce((sum, analysis) => sum + analysis.sentiment.magnitude, 0) / contentAnalysis.length;

    // Calculate sentiment distribution
    const sentimentMap = new Map<string, number>();
    contentAnalysis.forEach(analysis => {
      const current = sentimentMap.get(analysis.sentiment.label) || 0;
      sentimentMap.set(analysis.sentiment.label, current + 1);
    });

    const distribution = Array.from(sentimentMap.entries())
      .map(([sentiment, count]) => ({
        sentiment,
        count,
        percentage: (count / contentAnalysis.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      averageScore,
      averageMagnitude,
      distribution,
    };
  }

  /**
   * Calculate topic analysis
   * 
   * @param contentAnalysis - Content analysis data
   * @returns Topic analysis
   */
  private calculateTopicAnalysis(contentAnalysis: any[]): Array<{
    topic: string;
    frequency: number;
    averageConfidence: number;
    averageRelevance: number;
  }> {
    const topicMap = new Map<string, { frequency: number; confidence: number[]; relevance: number[] }>();
    
    contentAnalysis.forEach(analysis => {
      analysis.topics.forEach(topic => {
        if (!topicMap.has(topic.topic)) {
          topicMap.set(topic.topic, { frequency: 0, confidence: [], relevance: [] });
        }
        
        const topicData = topicMap.get(topic.topic);
        topicData.frequency += 1;
        topicData.confidence.push(topic.confidence);
        topicData.relevance.push(topic.relevance);
      });
    });

    return Array.from(topicMap.entries())
      .map(([topic, data]) => ({
        topic,
        frequency: data.frequency,
        averageConfidence: data.confidence.reduce((sum, c) => sum + c, 0) / data.confidence.length,
        averageRelevance: data.relevance.reduce((sum, r) => sum + r, 0) / data.relevance.length,
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Calculate readability analysis
   * 
   * @param contentAnalysis - Content analysis data
   * @returns Readability analysis
   */
  private calculateReadabilityAnalysis(contentAnalysis: any[]): {
    averageScore: number;
    averageGrade: number;
    distribution: Array<{
      level: string;
      count: number;
      percentage: number;
    }>;
  } {
    const averageScore = contentAnalysis.reduce((sum, analysis) => sum + analysis.readability.score, 0) / contentAnalysis.length;
    const averageGrade = contentAnalysis.reduce((sum, analysis) => sum + analysis.readability.grade, 0) / contentAnalysis.length;

    // Calculate readability distribution
    const levelMap = new Map<string, number>();
    contentAnalysis.forEach(analysis => {
      const current = levelMap.get(analysis.readability.level) || 0;
      levelMap.set(analysis.readability.level, current + 1);
    });

    const distribution = Array.from(levelMap.entries())
      .map(([level, count]) => ({
        level,
        count,
        percentage: (count / contentAnalysis.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      averageScore,
      averageGrade,
      distribution,
    };
  }

  /**
   * Calculate complexity analysis
   * 
   * @param contentAnalysis - Content analysis data
   * @returns Complexity analysis
   */
  private calculateComplexityAnalysis(contentAnalysis: any[]): {
    averageScore: number;
    distribution: Array<{
      level: string;
      count: number;
      percentage: number;
    }>;
  } {
    const averageScore = contentAnalysis.reduce((sum, analysis) => sum + analysis.complexity.score, 0) / contentAnalysis.length;

    // Calculate complexity distribution
    const levelMap = new Map<string, number>();
    contentAnalysis.forEach(analysis => {
      const current = levelMap.get(analysis.complexity.level) || 0;
      levelMap.set(analysis.complexity.level, current + 1);
    });

    const distribution = Array.from(levelMap.entries())
      .map(([level, count]) => ({
        level,
        count,
        percentage: (count / contentAnalysis.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      averageScore,
      distribution,
    };
  }

  /**
   * Calculate stage distribution
   * 
   * @param documentLifecycle - Document lifecycle data
   * @returns Stage distribution
   */
  private calculateStageDistribution(documentLifecycle: any[]): Array<{
    stage: string;
    count: number;
    percentage: number;
    averageDuration: number;
    successRate: number;
  }> {
    const stageMap = new Map<string, { count: number; totalDuration: number; successes: number }>();
    
    documentLifecycle.forEach(event => {
      if (!stageMap.has(event.stage)) {
        stageMap.set(event.stage, { count: 0, totalDuration: 0, successes: 0 });
      }
      
      const stageData = stageMap.get(event.stage);
      stageData.count += 1;
      stageData.totalDuration += event.duration;
      if (event.success) {
        stageData.successes += 1;
      }
    });

    const totalEvents = documentLifecycle.length;

    return Array.from(stageMap.entries())
      .map(([stage, data]) => ({
        stage,
        count: data.count,
        percentage: (data.count / totalEvents) * 100,
        averageDuration: data.totalDuration / data.count,
        successRate: (data.successes / data.count) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate action distribution
   * 
   * @param documentLifecycle - Document lifecycle data
   * @returns Action distribution
   */
  private calculateActionDistribution(documentLifecycle: any[]): Array<{
    action: string;
    count: number;
    percentage: number;
    averageDuration: number;
    successRate: number;
  }> {
    const actionMap = new Map<string, { count: number; totalDuration: number; successes: number }>();
    
    documentLifecycle.forEach(event => {
      if (!actionMap.has(event.action)) {
        actionMap.set(event.action, { count: 0, totalDuration: 0, successes: 0 });
      }
      
      const actionData = actionMap.get(event.action);
      actionData.count += 1;
      actionData.totalDuration += event.duration;
      if (event.success) {
        actionData.successes += 1;
      }
    });

    const totalEvents = documentLifecycle.length;

    return Array.from(actionMap.entries())
      .map(([action, data]) => ({
        action,
        count: data.count,
        percentage: (data.count / totalEvents) * 100,
        averageDuration: data.totalDuration / data.count,
        successRate: (data.successes / data.count) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate lifecycle trend
   * 
   * @param documentLifecycle - Document lifecycle data
   * @returns Lifecycle trend
   */
  private calculateLifecycleTrend(documentLifecycle: any[]): Array<{
    period: string;
    events: number;
    averageDuration: number;
    successRate: number;
  }> {
    // Group by day
    const dailyLifecycle = new Map<string, { events: number; totalDuration: number; successes: number }>();
    
    documentLifecycle.forEach(event => {
      const day = event.timestamp.toISOString().substring(0, 10);
      if (!dailyLifecycle.has(day)) {
        dailyLifecycle.set(day, { events: 0, totalDuration: 0, successes: 0 });
      }
      
      const dayData = dailyLifecycle.get(day);
      dayData.events += 1;
      dayData.totalDuration += event.duration;
      if (event.success) {
        dayData.successes += 1;
      }
    });

    return Array.from(dailyLifecycle.entries())
      .map(([period, data]) => ({
        period,
        events: data.events,
        averageDuration: data.totalDuration / data.events,
        successRate: (data.successes / data.events) * 100,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Calculate bottlenecks
   * 
   * @param documentLifecycle - Document lifecycle data
   * @returns Bottlenecks
   */
  private calculateBottlenecks(documentLifecycle: any[]): Array<{
    stage: string;
    averageDuration: number;
    frequency: number;
    impact: number;
  }> {
    const stageMap = new Map<string, { totalDuration: number; count: number }>();
    
    documentLifecycle.forEach(event => {
      if (!stageMap.has(event.stage)) {
        stageMap.set(event.stage, { totalDuration: 0, count: 0 });
      }
      
      const stageData = stageMap.get(event.stage);
      stageData.totalDuration += event.duration;
      stageData.count += 1;
    });

    const totalDuration = documentLifecycle.reduce((sum, event) => sum + event.duration, 0);

    return Array.from(stageMap.entries())
      .map(([stage, data]) => ({
        stage,
        averageDuration: data.totalDuration / data.count,
        frequency: data.count,
        impact: (data.totalDuration / totalDuration) * 100,
      }))
      .sort((a, b) => b.impact - a.impact);
  }
}
