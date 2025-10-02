// User types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

// Document types
export interface Document {
  id: string;
  title: string;
  content?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  status: DocumentStatus;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum DocumentStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

// Review types
export interface Review {
  id: string;
  documentId: string;
  userId: string;
  status: ReviewStatus;
  score?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// Billing types
export interface Billing {
  id: string;
  userId: string;
  plan: BillingPlan;
  status: BillingStatus;
  amount: number;
  currency: string;
  periodStart: Date;
  periodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum BillingPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

export enum BillingStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  PAST_DUE = 'PAST_DUE',
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request types
export interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface CreateDocumentRequest {
  title: string;
  file: File;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
}

export interface CreateReviewRequest {
  documentId: string;
  score: number;
  feedback?: string;
}

export interface UpdateReviewRequest {
  score?: number;
  feedback?: string;
}

// Search types
export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  pagination?: PaginationParams;
}

export interface SearchFilters {
  documentStatus?: DocumentStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  scoreRange?: {
    min: number;
    max: number;
  };
  userId?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SearchResult {
  documentId: string;
  title: string;
  similarityScore: number;
  chunkText: string;
  highlights?: string[];
}

// Processing types
export interface ProcessingTask {
  id: string;
  documentId: string;
  status: ProcessingStatus;
  progress: number;
  result?: ProcessingResult;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProcessingStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface ProcessingResult {
  chunksCount: number;
  embeddingsCount: number;
  processingTime: number;
  extractedText?: string;
}

// Report types
export interface ReportRequest {
  reportType: ReportType;
  documentIds: string[];
  templateData: Record<string, any>;
  format: ReportFormat;
}

export enum ReportType {
  SUMMARY = 'SUMMARY',
  DETAILED = 'DETAILED',
  ANALYTICS = 'ANALYTICS',
  CUSTOM = 'CUSTOM',
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
}

export interface ReportTask {
  id: string;
  reportType: ReportType;
  status: ProcessingStatus;
  progress: number;
  filePath?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
