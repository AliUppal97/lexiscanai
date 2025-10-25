# API Integration Guide

## Overview

This guide provides comprehensive instructions for developers integrating with the LexiScan AI API. It covers authentication, endpoints, SDKs, webhooks, and best practices.

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [SDKs and Libraries](#sdks-and-libraries)
- [Webhooks](#webhooks)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Getting Started

### 1. API Access

#### Getting API Keys

1. Log in to your LexiScan AI account
2. Navigate to **Settings** → **API Keys**
3. Click **Generate New Key**
4. Configure key settings:
   - **Name**: Descriptive name for the key
   - **Scopes**: Required permissions
   - **Expiration**: Key expiration date
5. Copy and securely store the API key

#### API Base URL

- **Production**: `https://api.lexiscan.ai/v1`
- **Staging**: `https://staging-api.lexiscan.ai/v1`
- **Development**: `http://localhost:3001/api`

### 2. Quick Start

#### Basic Request

```bash
curl -X GET "https://api.lexiscan.ai/v1/health" \
  -H "X-API-Key: your-api-key-here"
```

#### Response Format

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### 3. API Documentation

- **Interactive Docs**: [https://api.lexiscan.ai/docs](https://api.lexiscan.ai/docs)
- **OpenAPI Spec**: [https://api.lexiscan.ai/openapi.json](https://api.lexiscan.ai/openapi.json)
- **Postman Collection**: [Download Collection](https://api.lexiscan.ai/postman.json)

## Authentication

### 1. API Key Authentication

#### Header Authentication

```bash
curl -X GET "https://api.lexiscan.ai/v1/documents" \
  -H "X-API-Key: your-api-key-here"
```

#### JavaScript Example

```javascript
const response = await fetch('https://api.lexiscan.ai/v1/documents', {
  headers: {
    'X-API-Key': 'your-api-key-here',
    'Content-Type': 'application/json'
  }
});
```

### 2. JWT Authentication

#### Login Request

```bash
curl -X POST "https://api.lexiscan.ai/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Using JWT Token

```bash
curl -X GET "https://api.lexiscan.ai/v1/documents" \
  -H "Authorization: Bearer your-jwt-token"
```

### 3. OAuth 2.0

#### OAuth Flow

1. **Authorization URL**: `https://api.lexiscan.ai/oauth/authorize`
2. **Token URL**: `https://api.lexiscan.ai/oauth/token`
3. **Scopes**: `read`, `write`, `admin`

#### OAuth Example

```javascript
// Step 1: Redirect to authorization URL
const authUrl = 'https://api.lexiscan.ai/oauth/authorize?' +
  'client_id=your-client-id&' +
  'redirect_uri=your-redirect-uri&' +
  'scope=read write&' +
  'response_type=code';

// Step 2: Exchange code for token
const tokenResponse = await fetch('https://api.lexiscan.ai/oauth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: 'your-client-id',
    client_secret: 'your-client-secret',
    code: 'authorization-code',
    redirect_uri: 'your-redirect-uri'
  })
});

const { access_token } = await tokenResponse.json();
```

## API Endpoints

### 1. Document Management

#### Upload Document

```bash
curl -X POST "https://api.lexiscan.ai/v1/documents" \
  -H "X-API-Key: your-api-key-here" \
  -F "file=@document.pdf" \
  -F "title=Contract Review" \
  -F "description=Legal contract for review"
```

#### List Documents

```bash
curl -X GET "https://api.lexiscan.ai/v1/documents?page=1&limit=20" \
  -H "X-API-Key: your-api-key-here"
```

#### Get Document

```bash
curl -X GET "https://api.lexiscan.ai/v1/documents/{document-id}" \
  -H "X-API-Key: your-api-key-here"
```

#### Update Document

```bash
curl -X PUT "https://api.lexiscan.ai/v1/documents/{document-id}" \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Contract Title",
    "description": "Updated description"
  }'
```

#### Delete Document

```bash
curl -X DELETE "https://api.lexiscan.ai/v1/documents/{document-id}" \
  -H "X-API-Key: your-api-key-here"
```

### 2. AI Analysis

#### Start Analysis

```bash
curl -X POST "https://api.lexiscan.ai/v1/documents/{document-id}/analyze" \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "analysisType": "contract_review",
    "options": {
      "includeRiskAssessment": true,
      "includeClauseAnalysis": true,
      "includeComplianceCheck": false
    }
  }'
```

#### Get Analysis Results

```bash
curl -X GET "https://api.lexiscan.ai/v1/analysis/{analysis-id}" \
  -H "X-API-Key: your-api-key-here"
```

#### List Analyses

```bash
curl -X GET "https://api.lexiscan.ai/v1/analyses?documentId={document-id}" \
  -H "X-API-Key: your-api-key-here"
```

### 3. User Management

#### Create User

```bash
curl -X POST "https://api.lexiscan.ai/v1/users" \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }'
```

#### List Users

```bash
curl -X GET "https://api.lexiscan.ai/v1/users?page=1&limit=20" \
  -H "X-API-Key: your-api-key-here"
```

#### Update User

```bash
curl -X PUT "https://api.lexiscan.ai/v1/users/{user-id}" \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

### 4. Analytics

#### Get Usage Statistics

```bash
curl -X GET "https://api.lexiscan.ai/v1/analytics/usage" \
  -H "X-API-Key: your-api-key-here"
```

#### Get Document Analytics

```bash
curl -X GET "https://api.lexiscan.ai/v1/analytics/documents" \
  -H "X-API-Key: your-api-key-here"
```

## SDKs and Libraries

### 1. JavaScript/Node.js SDK

#### Installation

```bash
npm install @lexiscan/lexiscan-sdk
```

#### Basic Usage

```javascript
import { LexiScanClient } from '@lexiscan/lexiscan-sdk';

const client = new LexiScanClient({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.lexiscan.ai/v1'
});

// Upload document
const document = await client.documents.upload({
  file: 'path/to/document.pdf',
  title: 'Contract Review',
  description: 'Legal contract for review'
});

// Start analysis
const analysis = await client.analysis.start({
  documentId: document.id,
  analysisType: 'contract_review',
  options: {
    includeRiskAssessment: true
  }
});

// Get results
const results = await client.analysis.getResults(analysis.id);
```

#### Advanced Usage

```javascript
// Batch operations
const documents = await client.documents.uploadBatch([
  { file: 'doc1.pdf', title: 'Contract 1' },
  { file: 'doc2.pdf', title: 'Contract 2' }
]);

// Webhook handling
client.webhooks.on('document.processed', (event) => {
  console.log('Document processed:', event.data);
});

// Error handling
try {
  const result = await client.documents.upload({ file: 'document.pdf' });
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Handle rate limit
  } else if (error.code === 'VALIDATION_ERROR') {
    // Handle validation error
  }
}
```

### 2. Python SDK

#### Installation

```bash
pip install lexiscan-sdk
```

#### Basic Usage

```python
from lexiscan import LexiScanClient

client = LexiScanClient(
    api_key='your-api-key-here',
    base_url='https://api.lexiscan.ai/v1'
)

# Upload document
document = client.documents.upload(
    file_path='document.pdf',
    title='Contract Review',
    description='Legal contract for review'
)

# Start analysis
analysis = client.analysis.start(
    document_id=document.id,
    analysis_type='contract_review',
    options={
        'include_risk_assessment': True
    }
)

# Get results
results = client.analysis.get_results(analysis.id)
```

#### Advanced Usage

```python
# Async operations
import asyncio
from lexiscan import AsyncLexiScanClient

async def process_documents():
    client = AsyncLexiScanClient(api_key='your-api-key-here')
    
    # Upload multiple documents
    tasks = []
    for file_path in ['doc1.pdf', 'doc2.pdf']:
        task = client.documents.upload(file_path=file_path)
        tasks.append(task)
    
    documents = await asyncio.gather(*tasks)
    
    # Start analyses
    analysis_tasks = []
    for doc in documents:
        task = client.analysis.start(
            document_id=doc.id,
            analysis_type='contract_review'
        )
        analysis_tasks.append(task)
    
    analyses = await asyncio.gather(*analysis_tasks)
    
    return analyses

# Run async function
analyses = asyncio.run(process_documents())
```

### 3. PHP SDK

#### Installation

```bash
composer require lexiscan/lexiscan-sdk
```

#### Basic Usage

```php
<?php
use LexiScan\LexiScanClient;

$client = new LexiScanClient([
    'api_key' => 'your-api-key-here',
    'base_url' => 'https://api.lexiscan.ai/v1'
]);

// Upload document
$document = $client->documents->upload([
    'file' => 'document.pdf',
    'title' => 'Contract Review',
    'description' => 'Legal contract for review'
]);

// Start analysis
$analysis = $client->analysis->start([
    'document_id' => $document->id,
    'analysis_type' => 'contract_review',
    'options' => [
        'include_risk_assessment' => true
    ]
]);

// Get results
$results = $client->analysis->getResults($analysis->id);
?>
```

### 4. Java SDK

#### Installation

```xml
<dependency>
    <groupId>ai.lexiscan</groupId>
    <artifactId>lexiscan-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

#### Basic Usage

```java
import ai.lexiscan.LexiScanClient;
import ai.lexiscan.models.Document;
import ai.lexiscan.models.Analysis;

LexiScanClient client = new LexiScanClient.Builder()
    .apiKey("your-api-key-here")
    .baseUrl("https://api.lexiscan.ai/v1")
    .build();

// Upload document
Document document = client.documents().upload(
    DocumentUploadRequest.builder()
        .file(new File("document.pdf"))
        .title("Contract Review")
        .description("Legal contract for review")
        .build()
);

// Start analysis
Analysis analysis = client.analysis().start(
    AnalysisRequest.builder()
        .documentId(document.getId())
        .analysisType("contract_review")
        .options(AnalysisOptions.builder()
            .includeRiskAssessment(true)
            .build())
        .build()
);

// Get results
AnalysisResults results = client.analysis().getResults(analysis.getId());
```

## Webhooks

### 1. Webhook Setup

#### Creating Webhooks

```bash
curl -X POST "https://api.lexiscan.ai/v1/webhooks" \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/lexiscan",
    "events": [
      "document.processed",
      "user.created",
      "subscription.updated"
    ],
    "secret": "your-webhook-secret"
  }'
```

#### Webhook Events

| Event | Description | Payload |
|-------|-------------|---------|
| `document.uploaded` | Document uploaded | Document metadata |
| `document.processed` | Analysis completed | Analysis results |
| `document.failed` | Processing failed | Error details |
| `user.created` | User registered | User profile |
| `user.updated` | User profile updated | Updated fields |
| `subscription.updated` | Subscription changed | Subscription details |

### 2. Webhook Handling

#### Express.js Example

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.raw({ type: 'application/json' }));

app.post('/webhooks/lexiscan', (req, res) => {
  const signature = req.headers['x-lexiscan-signature'];
  const payload = req.body;
  
  // Verify signature
  if (!verifySignature(payload, signature)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(payload);
  
  switch (event.type) {
    case 'document.processed':
      handleDocumentProcessed(event.data);
      break;
    case 'user.created':
      handleUserCreated(event.data);
      break;
    default:
      console.log('Unknown event type:', event.type);
  }
  
  res.status(200).send('OK');
});

function verifySignature(payload, signature) {
  const secret = process.env.WEBHOOK_SECRET;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

function handleDocumentProcessed(data) {
  console.log('Document processed:', data.documentId);
  // Update your database, send notifications, etc.
}

function handleUserCreated(data) {
  console.log('New user created:', data.user.email);
  // Send welcome email, create user profile, etc.
}
```

#### Python Flask Example

```python
from flask import Flask, request, jsonify
import hmac
import hashlib
import json

app = Flask(__name__)

@app.route('/webhooks/lexiscan', methods=['POST'])
def webhook():
    signature = request.headers.get('X-LexiScan-Signature')
    payload = request.get_data()
    
    # Verify signature
    if not verify_signature(payload, signature):
        return 'Invalid signature', 401
    
    event = json.loads(payload)
    
    if event['type'] == 'document.processed':
        handle_document_processed(event['data'])
    elif event['type'] == 'user.created':
        handle_user_created(event['data'])
    
    return 'OK', 200

def verify_signature(payload, signature):
    secret = os.environ['WEBHOOK_SECRET']
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

def handle_document_processed(data):
    print(f"Document processed: {data['documentId']}")
    # Update your database, send notifications, etc.

def handle_user_created(data):
    print(f"New user created: {data['user']['email']}")
    # Send welcome email, create user profile, etc.
```

## Rate Limiting

### 1. Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642234567
X-RateLimit-Window: 3600
```

### 2. Handling Rate Limits

#### JavaScript Example

```javascript
class LexiScanClient {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl || 'https://api.lexiscan.ai/v1';
    this.retryDelay = options.retryDelay || 1000;
    this.maxRetries = options.maxRetries || 3;
  }
  
  async makeRequest(endpoint, options = {}) {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.retryDelay * Math.pow(2, attempt);
          
          console.log(`Rate limited. Retrying in ${delay}ms...`);
          await this.sleep(delay);
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        if (attempt === this.maxRetries - 1) {
          throw error;
        }
        
        await this.sleep(this.retryDelay * Math.pow(2, attempt));
      }
    }
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### Python Example

```python
import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class LexiScanClient:
    def __init__(self, api_key, base_url='https://api.lexiscan.ai/v1'):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        
        # Configure retry strategy
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504]
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
    
    def make_request(self, method, endpoint, **kwargs):
        url = f"{self.base_url}{endpoint}"
        headers = {
            'X-API-Key': self.api_key,
            'Content-Type': 'application/json'
        }
        headers.update(kwargs.get('headers', {}))
        
        response = self.session.request(
            method, url, headers=headers, **kwargs
        )
        
        if response.status_code == 429:
            retry_after = response.headers.get('Retry-After')
            if retry_after:
                time.sleep(int(retry_after))
            else:
                time.sleep(1)
            
            return self.make_request(method, endpoint, **kwargs)
        
        response.raise_for_status()
        return response.json()
```

## Error Handling

### 1. Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_1234567890"
  }
}
```

### 2. Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

### 3. Error Handling Examples

#### JavaScript

```javascript
try {
  const result = await client.documents.upload({ file: 'document.pdf' });
} catch (error) {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      console.error('Invalid input:', error.details);
      break;
    case 'RATE_LIMIT_EXCEEDED':
      console.error('Rate limit exceeded. Retry after:', error.retryAfter);
      break;
    case 'UNAUTHORIZED':
      console.error('Authentication failed. Check your API key.');
      break;
    default:
      console.error('Unexpected error:', error.message);
  }
}
```

#### Python

```python
try:
    result = client.documents.upload(file_path='document.pdf')
except LexiScanError as e:
    if e.code == 'VALIDATION_ERROR':
        print(f"Invalid input: {e.details}")
    elif e.code == 'RATE_LIMIT_EXCEEDED':
        print(f"Rate limit exceeded. Retry after: {e.retry_after}")
    elif e.code == 'UNAUTHORIZED':
        print("Authentication failed. Check your API key.")
    else:
        print(f"Unexpected error: {e.message}")
```

## Best Practices

### 1. Security

#### API Key Management

```javascript
// ✅ Good: Use environment variables
const apiKey = process.env.LEXISCAN_API_KEY;

// ❌ Bad: Hardcode API keys
const apiKey = 'sk-1234567890abcdef';
```

#### Request Security

```javascript
// ✅ Good: Use HTTPS
const client = new LexiScanClient({
  apiKey: process.env.LEXISCAN_API_KEY,
  baseUrl: 'https://api.lexiscan.ai/v1'
});

// ❌ Bad: Use HTTP
const client = new LexiScanClient({
  apiKey: process.env.LEXISCAN_API_KEY,
  baseUrl: 'http://api.lexiscan.ai/v1'
});
```

### 2. Performance

#### Request Batching

```javascript
// ✅ Good: Batch requests
const documents = await Promise.all([
  client.documents.upload({ file: 'doc1.pdf' }),
  client.documents.upload({ file: 'doc2.pdf' }),
  client.documents.upload({ file: 'doc3.pdf' })
]);

// ❌ Bad: Sequential requests
const doc1 = await client.documents.upload({ file: 'doc1.pdf' });
const doc2 = await client.documents.upload({ file: 'doc2.pdf' });
const doc3 = await client.documents.upload({ file: 'doc3.pdf' });
```

#### Caching

```javascript
// ✅ Good: Cache responses
const cache = new Map();

async function getDocument(id) {
  if (cache.has(id)) {
    return cache.get(id);
  }
  
  const document = await client.documents.get(id);
  cache.set(id, document);
  return document;
}
```

### 3. Error Handling

#### Retry Logic

```javascript
async function makeRequestWithRetry(requestFn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        const delay = error.retryAfter || Math.pow(2, attempt) * 1000;
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
}
```

#### Logging

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

try {
  const result = await client.documents.upload({ file: 'document.pdf' });
  logger.info('Document uploaded successfully', { documentId: result.id });
} catch (error) {
  logger.error('Document upload failed', { error: error.message, code: error.code });
  throw error;
}
```

## Examples

### 1. Document Processing Workflow

```javascript
async function processDocument(filePath, title) {
  try {
    // Upload document
    const document = await client.documents.upload({
      file: filePath,
      title: title
    });
    
    console.log('Document uploaded:', document.id);
    
    // Start analysis
    const analysis = await client.analysis.start({
      documentId: document.id,
      analysisType: 'contract_review',
      options: {
        includeRiskAssessment: true,
        includeClauseAnalysis: true
      }
    });
    
    console.log('Analysis started:', analysis.id);
    
    // Poll for results
    let results = null;
    while (!results) {
      await sleep(5000); // Wait 5 seconds
      
      const status = await client.analysis.getStatus(analysis.id);
      if (status.status === 'completed') {
        results = await client.analysis.getResults(analysis.id);
      } else if (status.status === 'failed') {
        throw new Error('Analysis failed');
      }
    }
    
    console.log('Analysis completed:', results);
    return results;
    
  } catch (error) {
    console.error('Document processing failed:', error);
    throw error;
  }
}
```

### 2. Webhook Integration

```javascript
const express = require('express');
const app = express();

app.use(express.raw({ type: 'application/json' }));

app.post('/webhooks/lexiscan', async (req, res) => {
  try {
    const event = JSON.parse(req.body);
    
    switch (event.type) {
      case 'document.processed':
        await handleDocumentProcessed(event.data);
        break;
      case 'analysis.completed':
        await handleAnalysisCompleted(event.data);
        break;
      default:
        console.log('Unknown event type:', event.type);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function handleDocumentProcessed(data) {
  // Update your database
  await updateDocumentStatus(data.documentId, 'processed');
  
  // Send notification
  await sendNotification({
    userId: data.userId,
    message: 'Your document has been processed'
  });
}

async function handleAnalysisCompleted(data) {
  // Store analysis results
  await storeAnalysisResults(data.analysisId, data.results);
  
  // Trigger next workflow step
  await triggerWorkflow(data.analysisId);
}
```

### 3. Batch Processing

```javascript
async function processBatchDocuments(files) {
  const results = [];
  const errors = [];
  
  // Process files in parallel (with concurrency limit)
  const concurrency = 5;
  const chunks = chunkArray(files, concurrency);
  
  for (const chunk of chunks) {
    const promises = chunk.map(async (file) => {
      try {
        const document = await client.documents.upload({
          file: file.path,
          title: file.name
        });
        
        const analysis = await client.analysis.start({
          documentId: document.id,
          analysisType: 'contract_review'
        });
        
        return { document, analysis };
      } catch (error) {
        errors.push({ file: file.name, error: error.message });
        return null;
      }
    });
    
    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults.filter(Boolean));
  }
  
  return { results, errors };
}
```

## Troubleshooting

### 1. Common Issues

#### Authentication Issues

**Problem**: 401 Unauthorized
**Solutions**:
1. Check API key is correct
2. Verify API key has required permissions
3. Check API key hasn't expired
4. Ensure you're using the correct base URL

#### Rate Limiting Issues

**Problem**: 429 Too Many Requests
**Solutions**:
1. Implement exponential backoff
2. Reduce request frequency
3. Use request batching
4. Consider upgrading your plan

#### File Upload Issues

**Problem**: File upload fails
**Solutions**:
1. Check file format is supported
2. Verify file size is within limits
3. Check file isn't corrupted
4. Ensure proper multipart encoding

### 2. Debugging

#### Request Logging

```javascript
// Enable request logging
const client = new LexiScanClient({
  apiKey: process.env.LEXISCAN_API_KEY,
  debug: true
});

// Log all requests
client.on('request', (request) => {
  console.log('Request:', request.method, request.url);
});

client.on('response', (response) => {
  console.log('Response:', response.status, response.data);
});
```

#### Error Debugging

```javascript
try {
  const result = await client.documents.upload({ file: 'document.pdf' });
} catch (error) {
  console.error('Error details:', {
    code: error.code,
    message: error.message,
    details: error.details,
    requestId: error.requestId,
    timestamp: error.timestamp
  });
}
```

### 3. Support Resources

#### Documentation

- **API Reference**: [https://docs.lexiscan.ai/api](https://docs.lexiscan.ai/api)
- **SDK Documentation**: [https://docs.lexiscan.ai/sdk](https://docs.lexiscan.ai/sdk)
- **Webhook Guide**: [https://docs.lexiscan.ai/webhooks](https://docs.lexiscan.ai/webhooks)

#### Support Channels

- **Email**: api-support@lexiscan.ai
- **Slack**: #api-support
- **GitHub**: [https://github.com/lexiscan/lexiscan-sdk](https://github.com/lexiscan/lexiscan-sdk)
- **Status Page**: [https://status.lexiscan.ai](https://status.lexiscan.ai)

## Support

For API integration support:

- **Email**: api-support@lexiscan.ai
- **Documentation**: https://docs.lexiscan.ai/api
- **Status Page**: https://status.lexiscan.ai
- **Emergency**: api@lexiscan.ai

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial API integration guide |
| 1.1.0 | 2024-01-20 | Added SDK examples |
| 1.2.0 | 2024-01-25 | Enhanced webhook documentation |
| 1.3.0 | 2024-02-01 | Added best practices section |
