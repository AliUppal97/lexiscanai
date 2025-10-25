# Rate Limiting Guide

## Overview

LexiScan AI implements comprehensive rate limiting to ensure fair usage, prevent abuse, and maintain system stability. This guide covers rate limiting policies, implementation details, and best practices for handling rate limits.

## Table of Contents

- [Rate Limiting Policies](#rate-limiting-policies)
- [Rate Limit Headers](#rate-limit-headers)
- [Handling Rate Limits](#handling-rate-limits)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Rate Limiting Policies

### Subscription-Based Limits

| Plan | Requests/Hour | Requests/Day | Burst Limit | Concurrent Requests |
|------|---------------|--------------|-------------|-------------------|
| **Free** | 100 | 1,000 | 10 | 2 |
| **Professional** | 1,000 | 10,000 | 50 | 5 |
| **Enterprise** | 10,000 | 100,000 | 200 | 20 |
| **Custom** | Variable | Variable | Variable | Variable |

### Endpoint-Specific Limits

| Endpoint Category | Free | Professional | Enterprise |
|------------------|------|-------------|------------|
| **Document Upload** | 10/hour | 100/hour | 1,000/hour |
| **AI Analysis** | 5/hour | 50/hour | 500/hour |
| **Bulk Operations** | 1/hour | 10/hour | 100/hour |
| **Webhook Calls** | 100/hour | 1,000/hour | 10,000/hour |

### Rate Limiting Algorithms

#### 1. Sliding Window Counter
- **Purpose**: Smooth rate limiting over time windows
- **Implementation**: Redis-based counters with TTL
- **Benefits**: More accurate than fixed windows

#### 2. Token Bucket
- **Purpose**: Burst handling with sustained rate limits
- **Implementation**: Bucket refill algorithm
- **Benefits**: Allows short bursts within limits

#### 3. Leaky Bucket
- **Purpose**: Strict rate limiting with no bursts
- **Implementation**: Fixed processing rate
- **Benefits**: Predictable processing times

## Rate Limit Headers

### Standard Headers

All API responses include rate limiting headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642234567
X-RateLimit-Window: 3600
X-RateLimit-Policy: professional
```

### Header Descriptions

| Header | Description | Example |
|--------|-------------|---------|
| `X-RateLimit-Limit` | Maximum requests allowed in window | `1000` |
| `X-RateLimit-Remaining` | Requests remaining in current window | `999` |
| `X-RateLimit-Reset` | Unix timestamp when limit resets | `1642234567` |
| `X-RateLimit-Window` | Window size in seconds | `3600` |
| `X-RateLimit-Policy` | Active rate limiting policy | `professional` |

### Custom Headers

```http
X-RateLimit-Burst: 50
X-RateLimit-Concurrent: 5
X-RateLimit-Retry-After: 3600
X-RateLimit-Scope: tenant
```

## Handling Rate Limits

### HTTP Status Codes

| Status Code | Description | Action Required |
|-------------|-------------|-----------------|
| `200` | Request successful | Continue normal operation |
| `429` | Rate limit exceeded | Implement backoff strategy |
| `503` | Service overloaded | Retry with exponential backoff |

### Rate Limit Response Format

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "resetTime": "2024-01-15T11:30:00Z",
      "retryAfter": 3600,
      "policy": "professional"
    }
  }
}
```

### Retry Strategies

#### 1. Exponential Backoff

```javascript
class RateLimitHandler {
  constructor() {
    this.baseDelay = 1000; // 1 second
    this.maxDelay = 60000; // 1 minute
    this.maxRetries = 5;
  }

  async makeRequest(url, options = {}, retryCount = 0) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        return this.handleRateLimit(response, url, options, retryCount);
      }
      
      return response;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        return this.retryWithBackoff(url, options, retryCount);
      }
      throw error;
    }
  }

  async handleRateLimit(response, url, options, retryCount) {
    const errorData = await response.json();
    const retryAfter = errorData.error.details.retryAfter;
    
    if (retryCount < this.maxRetries) {
      const delay = Math.min(
        this.baseDelay * Math.pow(2, retryCount),
        this.maxDelay
      );
      
      console.log(`Rate limited. Retrying in ${delay}ms...`);
      await this.sleep(delay);
      
      return this.makeRequest(url, options, retryCount + 1);
    }
    
    throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
  }

  async retryWithBackoff(url, options, retryCount) {
    const delay = Math.min(
      this.baseDelay * Math.pow(2, retryCount),
      this.maxDelay
    );
    
    await this.sleep(delay);
    return this.makeRequest(url, options, retryCount + 1);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### 2. Adaptive Rate Limiting

```javascript
class AdaptiveRateLimiter {
  constructor() {
    this.requestTimes = [];
    this.windowSize = 3600000; // 1 hour
    this.maxRequests = 1000;
  }

  async makeRequest(url, options = {}) {
    this.cleanOldRequests();
    
    if (this.requestTimes.length >= this.maxRequests) {
      const oldestRequest = this.requestTimes[0];
      const timeUntilReset = this.windowSize - (Date.now() - oldestRequest);
      
      if (timeUntilReset > 0) {
        await this.sleep(timeUntilReset);
      }
    }
    
    this.requestTimes.push(Date.now());
    return fetch(url, options);
  }

  cleanOldRequests() {
    const cutoff = Date.now() - this.windowSize;
    this.requestTimes = this.requestTimes.filter(time => time > cutoff);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### 3. Circuit Breaker Pattern

```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000;
    this.resetTimeout = options.resetTimeout || 30000;
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

## Best Practices

### 1. Request Batching

```javascript
class BatchProcessor {
  constructor(batchSize = 10, delay = 1000) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.processing = false;
  }

  async addRequest(request) {
    this.queue.push(request);
    
    if (this.queue.length >= this.batchSize && !this.processing) {
      this.processBatch();
    }
  }

  async processBatch() {
    if (this.processing) return;
    
    this.processing = true;
    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      await Promise.all(batch.map(request => request()));
    } catch (error) {
      console.error('Batch processing failed:', error);
    } finally {
      this.processing = false;
      
      if (this.queue.length > 0) {
        setTimeout(() => this.processBatch(), this.delay);
      }
    }
  }
}
```

### 2. Request Queuing

```javascript
class RequestQueue {
  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  async add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { request, resolve, reject } = this.queue.shift();

    try {
      const result = await request();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}
```

### 3. Caching Strategies

```javascript
class ApiCache {
  constructor(ttl = 300000) { // 5 minutes
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async fetchWithCache(url, options = {}) {
    const cacheKey = `${url}:${JSON.stringify(options)}`;
    const cached = this.get(cacheKey);
    
    if (cached) return cached;
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    this.set(cacheKey, data);
    return data;
  }
}
```

## Examples

### Complete Rate-Limited API Client

```javascript
class LexiScanApiClient {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.lexiscan.ai';
    this.rateLimiter = new RateLimitHandler();
    this.cache = new ApiCache(options.cacheTtl);
    this.queue = new RequestQueue(options.maxConcurrent);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    return this.queue.add(async () => {
      // Try cache first
      if (options.method === 'GET' && !options.skipCache) {
        const cached = this.cache.get(url);
        if (cached) return cached;
      }

      // Make rate-limited request
      const response = await this.rateLimiter.makeRequest(url, {
        ...options,
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      const data = await response.json();
      
      // Cache successful GET requests
      if (options.method === 'GET' && response.ok) {
        this.cache.set(url, data);
      }

      return data;
    });
  }

  async getDocuments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/documents?${query}`);
  }

  async uploadDocument(file, metadata) {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return this.request('/documents', {
      method: 'POST',
      body: formData,
      headers: {} // Don't set Content-Type for FormData
    });
  }

  async analyzeDocument(documentId, options = {}) {
    return this.request(`/documents/${documentId}/analyze`, {
      method: 'POST',
      body: JSON.stringify(options)
    });
  }
}

// Usage
const client = new LexiScanApiClient('your-api-key', {
  cacheTtl: 300000, // 5 minutes
  maxConcurrent: 5
});

// These requests will be rate-limited and queued automatically
const documents = await client.getDocuments();
const analysis = await client.analyzeDocument('doc-123', {
  analysisType: 'contract_review'
});
```

### Monitoring Rate Limits

```javascript
class RateLimitMonitor {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      rateLimitedRequests: 0,
      averageResponseTime: 0,
      errorRate: 0
    };
  }

  async makeRequest(url, options = {}) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        this.metrics.rateLimitedRequests++;
        this.handleRateLimit(response);
      }

      this.updateMetrics(Date.now() - startTime, false);
      return response;
    } catch (error) {
      this.updateMetrics(Date.now() - startTime, true);
      throw error;
    }
  }

  handleRateLimit(response) {
    const headers = response.headers;
    const limit = headers.get('X-RateLimit-Limit');
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');

    console.warn('Rate limit exceeded:', {
      limit,
      remaining,
      resetTime: new Date(parseInt(reset) * 1000)
    });

    // Send metrics to monitoring service
    this.sendMetrics();
  }

  updateMetrics(responseTime, isError) {
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + responseTime) / 2;
    
    if (isError) {
      this.metrics.errorRate = 
        (this.metrics.errorRate + 1) / this.metrics.totalRequests;
    }
  }

  sendMetrics() {
    // Send to monitoring service (e.g., DataDog, New Relic)
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.metrics)
    });
  }
}
```

## Troubleshooting

### Common Issues

1. **"Rate limit exceeded" errors**
   - Check your subscription plan limits
   - Implement proper backoff strategies
   - Consider upgrading your plan

2. **Slow API responses**
   - Check for rate limiting headers
   - Implement request queuing
   - Use caching for repeated requests

3. **Inconsistent rate limits**
   - Verify tenant context
   - Check for API key scopes
   - Contact support for plan verification

### Debug Mode

```javascript
// Enable rate limit debugging
localStorage.setItem('debug', 'lexiscan:rate-limit');

// Monitor rate limit headers
function debugRateLimits(response) {
  const headers = response.headers;
  console.log('Rate Limit Headers:', {
    limit: headers.get('X-RateLimit-Limit'),
    remaining: headers.get('X-RateLimit-Remaining'),
    reset: headers.get('X-RateLimit-Reset'),
    policy: headers.get('X-RateLimit-Policy')
  });
}

// Check current usage
async function checkRateLimitUsage() {
  const response = await fetch('/api/rate-limit/usage');
  const usage = await response.json();
  console.log('Current usage:', usage);
}
```

### Rate Limit Testing

```javascript
// Test rate limits
async function testRateLimits() {
  const promises = [];
  
  for (let i = 0; i < 100; i++) {
    promises.push(
      fetch('/api/documents', {
        headers: { 'X-API-Key': 'test-key' }
      }).then(response => ({
        status: response.status,
        headers: {
          limit: response.headers.get('X-RateLimit-Limit'),
          remaining: response.headers.get('X-RateLimit-Remaining')
        }
      }))
    );
  }
  
  const results = await Promise.all(promises);
  const rateLimited = results.filter(r => r.status === 429);
  
  console.log(`Rate limited ${rateLimited.length} out of ${results.length} requests`);
}
```

## Support

For rate limiting issues:

- **Email**: rate-limit-support@lexiscan.ai
- **Documentation**: https://docs.lexiscan.ai/rate-limiting
- **Status Page**: https://status.lexiscan.ai
- **Emergency**: support@lexiscan.ai

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial rate limiting implementation |
| 1.1.0 | 2024-01-20 | Added sliding window algorithm |
| 1.2.0 | 2024-01-25 | Enhanced burst handling |
| 1.3.0 | 2024-02-01 | Added circuit breaker pattern |
