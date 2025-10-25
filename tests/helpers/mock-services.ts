/**
 * Mock Services
 * 
 * Provides mock implementations of external services for testing.
 */

/**
 * Mock Email Service
 */
export const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendInvoiceEmail: jest.fn().mockResolvedValue(true),
  sendNotificationEmail: jest.fn().mockResolvedValue(true),
};

/**
 * Mock Storage Service
 */
export const mockStorageService = {
  uploadFile: jest.fn().mockResolvedValue({
    key: 'test-file-key',
    url: 'https://example.com/test-file.pdf',
    bucket: 'test-bucket',
  }),
  downloadFile: jest.fn().mockResolvedValue(Buffer.from('test content')),
  deleteFile: jest.fn().mockResolvedValue(true),
  getSignedUrl: jest.fn().mockResolvedValue('https://example.com/signed-url'),
  listFiles: jest.fn().mockResolvedValue([]),
};

/**
 * Mock Cache Service
 */
export const mockCacheService = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(true),
  del: jest.fn().mockResolvedValue(true),
  flush: jest.fn().mockResolvedValue(true),
  remember: jest.fn().mockImplementation(async (key, ttl, fn) => await fn()),
  setWithTTL: jest.fn().mockResolvedValue(true),
};

/**
 * Mock Queue Service
 */
export const mockQueueService = {
  addJob: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
  getJob: jest.fn().mockResolvedValue(null),
  removeJob: jest.fn().mockResolvedValue(true),
  getQueueMetrics: jest.fn().mockResolvedValue({
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
  }),
};

/**
 * Mock Notification Service
 */
export const mockNotificationService = {
  send: jest.fn().mockResolvedValue(true),
  sendInApp: jest.fn().mockResolvedValue(true),
  sendEmail: jest.fn().mockResolvedValue(true),
  sendPush: jest.fn().mockResolvedValue(true),
  sendSMS: jest.fn().mockResolvedValue(true),
  sendBulk: jest.fn().mockResolvedValue(true),
};

/**
 * Mock Webhook Service
 */
export const mockWebhookService = {
  send: jest.fn().mockResolvedValue({ success: true, statusCode: 200 }),
  sendBatch: jest.fn().mockResolvedValue([]),
  verifySignature: jest.fn().mockReturnValue(true),
  generateSignature: jest.fn().mockReturnValue('test-signature'),
};

/**
 * Mock Audit Service
 */
export const mockAuditService = {
  log: jest.fn().mockResolvedValue(true),
  logAuth: jest.fn().mockResolvedValue(true),
  logDocumentChange: jest.fn().mockResolvedValue(true),
  logUserActivity: jest.fn().mockResolvedValue(true),
  query: jest.fn().mockResolvedValue([]),
  exportLogs: jest.fn().mockResolvedValue([]),
};

/**
 * Mock Encryption Service
 */
export const mockEncryptionService = {
  encrypt: jest.fn().mockReturnValue('encrypted-data'),
  decrypt: jest.fn().mockReturnValue('decrypted-data'),
  encryptAsymmetric: jest.fn().mockReturnValue('encrypted-data'),
  decryptAsymmetric: jest.fn().mockReturnValue('decrypted-data'),
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  verifyPassword: jest.fn().mockResolvedValue(true),
  encryptPII: jest.fn().mockReturnValue('encrypted-pii'),
  decryptPII: jest.fn().mockReturnValue('decrypted-pii'),
  generateHMAC: jest.fn().mockReturnValue('hmac-signature'),
  verifyHMAC: jest.fn().mockReturnValue(true),
};

/**
 * Mock Rate Limit Service
 */
export const mockRateLimitService = {
  checkLimit: jest.fn().mockResolvedValue({ allowed: true, remaining: 100 }),
  checkIPLimit: jest.fn().mockResolvedValue({ allowed: true, remaining: 100 }),
  resetLimit: jest.fn().mockResolvedValue(true),
};

/**
 * Mock Analytics Service
 */
export const mockAnalyticsService = {
  track: jest.fn().mockResolvedValue(true),
  trackUser: jest.fn().mockResolvedValue(true),
  trackDocument: jest.fn().mockResolvedValue(true),
  trackBilling: jest.fn().mockResolvedValue(true),
  trackAPI: jest.fn().mockResolvedValue(true),
  getMetrics: jest.fn().mockResolvedValue({}),
  getTimeSeries: jest.fn().mockResolvedValue([]),
};

/**
 * Mock Stripe Service
 */
export const mockStripeService = {
  createCustomer: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
  createSubscription: jest.fn().mockResolvedValue({ id: 'sub_test123', status: 'active' }),
  cancelSubscription: jest.fn().mockResolvedValue({ id: 'sub_test123', status: 'canceled' }),
  createPaymentIntent: jest.fn().mockResolvedValue({ id: 'pi_test123', client_secret: 'secret' }),
  constructWebhookEvent: jest.fn().mockReturnValue({ type: 'payment_intent.succeeded' }),
};

/**
 * Mock Processing Service
 */
export const mockProcessingService = {
  processDocumentContent: jest.fn().mockResolvedValue({
    summary: 'Test summary',
    entities: [],
    keywords: [],
  }),
  extractEntities: jest.fn().mockResolvedValue([]),
  summarizeDocument: jest.fn().mockResolvedValue('Test summary'),
};

/**
 * Reset all mocks
 */
export function resetAllMocks() {
  Object.values(mockEmailService).forEach(mock => mock.mockClear());
  Object.values(mockStorageService).forEach(mock => mock.mockClear());
  Object.values(mockCacheService).forEach(mock => mock.mockClear());
  Object.values(mockQueueService).forEach(mock => mock.mockClear());
  Object.values(mockNotificationService).forEach(mock => mock.mockClear());
  Object.values(mockWebhookService).forEach(mock => mock.mockClear());
  Object.values(mockAuditService).forEach(mock => mock.mockClear());
  Object.values(mockEncryptionService).forEach(mock => mock.mockClear());
  Object.values(mockRateLimitService).forEach(mock => mock.mockClear());
  Object.values(mockAnalyticsService).forEach(mock => mock.mockClear());
  Object.values(mockStripeService).forEach(mock => mock.mockClear());
  Object.values(mockProcessingService).forEach(mock => mock.mockClear());
}

