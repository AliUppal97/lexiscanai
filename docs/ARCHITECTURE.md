# LexiScan AI Architecture

## Overview

LexiScan AI is built using a modern microservices architecture that separates concerns and enables scalability. The system is designed to handle document processing, AI analysis, and user management through specialized services.

## Architecture Principles

- **Microservices**: Each service has a single responsibility
- **API-First**: All services expose RESTful APIs
- **Event-Driven**: Services communicate through events and queues
- **Cloud-Native**: Designed for containerized deployment
- **Scalable**: Horizontal scaling capabilities
- **Secure**: Security-first design with proper authentication and authorization

## System Components

### Frontend Applications

#### Web App (`apps/web`)
- **Technology**: Next.js 14 with App Router
- **Purpose**: Marketing site and user-facing application
- **Features**: Landing page, user registration, document upload, search interface
- **Port**: 3000

#### Dashboard (`apps/dashboard`)
- **Technology**: React with Vite
- **Purpose**: Admin and user management interface
- **Features**: User management, analytics, system monitoring
- **Port**: 3002

### Backend Services

#### API Gateway (`apps/api`)
- **Technology**: NestJS with TypeScript
- **Purpose**: Main API gateway and business logic
- **Features**: Authentication, user management, document metadata, billing
- **Port**: 3001
- **Database**: PostgreSQL with Prisma ORM

#### AI Worker (`services/ai-worker`)
- **Technology**: FastAPI with Python
- **Purpose**: Document processing and AI analysis
- **Features**: OCR, text extraction, embeddings generation, semantic search
- **Port**: 8000

#### PDF Generator (`services/pdf-generator`)
- **Technology**: FastAPI with Python
- **Purpose**: Report and document generation
- **Features**: PDF generation, Excel exports, custom reports
- **Port**: 8001

### Data Layer

#### PostgreSQL
- **Purpose**: Primary database for user data, documents metadata, reviews
- **Features**: ACID compliance, complex queries, relationships
- **Port**: 5432

#### Redis
- **Purpose**: Caching, session storage, job queues
- **Features**: High-performance caching, pub/sub messaging
- **Port**: 6379

#### Vector Database (Pinecone/Weaviate)
- **Purpose**: Store document embeddings for semantic search
- **Features**: Similarity search, vector operations

### Infrastructure

#### Container Orchestration
- **Development**: Docker Compose
- **Production**: AWS ECS with Fargate
- **Benefits**: Consistent environments, easy scaling

#### Load Balancing
- **Technology**: AWS Application Load Balancer
- **Purpose**: Distribute traffic across service instances
- **Features**: Health checks, SSL termination

#### File Storage
- **Technology**: AWS S3
- **Purpose**: Store uploaded documents and generated reports
- **Features**: Scalable, durable, versioned

## Data Flow

### Document Processing Flow

1. **Upload**: User uploads document through web app
2. **Storage**: Document stored in S3, metadata in PostgreSQL
3. **Processing**: AI Worker processes document (OCR, chunking, embeddings)
4. **Indexing**: Embeddings stored in vector database
5. **Search**: Users can search documents semantically
6. **Review**: AI generates reviews and scores
7. **Reporting**: PDF Generator creates reports

### Authentication Flow

1. **Login**: User authenticates via API
2. **JWT**: API issues JWT token
3. **Authorization**: Token validated on each request
4. **Session**: Session data stored in Redis

## Security Architecture

### Authentication
- JWT tokens for stateless authentication
- Refresh token rotation
- Password hashing with bcrypt

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- API rate limiting

### Data Protection
- Encryption at rest (S3, RDS)
- Encryption in transit (TLS)
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)

## Scalability Considerations

### Horizontal Scaling
- Stateless services enable easy scaling
- Load balancer distributes traffic
- Database read replicas for read-heavy workloads

### Performance Optimization
- Redis caching for frequently accessed data
- CDN for static assets
- Database indexing for query optimization
- Connection pooling

### Monitoring and Observability
- Application metrics (Prometheus)
- Log aggregation (CloudWatch)
- Distributed tracing
- Health checks and alerts

## Deployment Architecture

### Development Environment
- Docker Compose for local development
- Hot reloading for frontend and backend
- Local databases and services

### Staging Environment
- AWS ECS with staging infrastructure
- Automated deployment from develop branch
- Production-like configuration

### Production Environment
- AWS ECS with production infrastructure
- Blue-green deployments
- Automated rollback capabilities
- High availability across multiple AZs

## Technology Decisions

### Why NestJS?
- TypeScript support
- Decorator-based architecture
- Built-in validation and transformation
- Excellent ecosystem

### Why FastAPI for AI Services?
- High performance
- Automatic API documentation
- Python ecosystem for AI/ML
- Async support

### Why PostgreSQL?
- ACID compliance
- Rich data types
- Excellent performance
- Strong ecosystem

### Why Redis?
- High performance caching
- Pub/sub messaging
- Session storage
- Job queues

## Future Considerations

### Potential Improvements
- Event-driven architecture with message queues
- GraphQL API for complex queries
- Real-time features with WebSockets
- Machine learning model serving
- Multi-tenancy support

### Scalability Enhancements
- Microservice decomposition
- CQRS pattern implementation
- Event sourcing for audit trails
- Advanced caching strategies
