# LexiScan AI - Document Processing Platform

[![CI/CD](https://github.com/your-org/lexiscan/workflows/CI%20Pipeline/badge.svg)](https://github.com/your-org/lexiscan/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)

LexiScan AI is a comprehensive document processing platform that leverages artificial intelligence to analyze, review, and generate insights from various document types. Built with modern technologies and following industry best practices.

## 🚀 Features

- **Document Upload & Processing**: Support for PDF, Word, Excel, and text files
- **AI-Powered Analysis**: Advanced OCR, text extraction, and semantic analysis
- **Intelligent Review System**: Automated document scoring and feedback generation
- **Real-time Search**: Semantic search across processed documents
- **Report Generation**: Automated PDF and Excel report creation
- **User Management**: Role-based access control and user authentication
- **Billing Integration**: Stripe-powered subscription management
- **Scalable Architecture**: Microservices-based design with containerization

## 🏗️ Architecture

```
lexiscan/
├─ .github/workflows/          # CI/CD pipelines
├─ infra/terraform/           # Infrastructure as Code
├─ apps/
│  ├─ web/                   # Next.js marketing site
│  ├─ dashboard/             # React admin dashboard
│  └─ api/                   # NestJS REST API
├─ services/
│  ├─ ai-worker/             # FastAPI AI processing service
│  └─ pdf-generator/         # PDF generation service
├─ packages/
│  ├─ shared-types/          # TypeScript type definitions
│  ├─ ui/                    # Reusable UI components
│  └─ clients/               # Generated API clients
└─ tests/                    # E2E and integration tests
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router and Turbopack
- **React 19** - UI library with latest features
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library

### Backend
- **NestJS** - Node.js framework
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **JWT** - Authentication
- **Swagger** - API documentation

### AI Services
- **FastAPI** - Python web framework
- **OpenAI API** - Language models and embeddings
- **Pinecone/Weaviate** - Vector database
- **PyPDF2/pdfplumber** - PDF processing
- **python-docx** - Word document processing

### Infrastructure
- **Docker** - Containerization
- **Terraform** - Infrastructure as Code
- **AWS** - Cloud provider
- **ECS** - Container orchestration
- **S3** - File storage
- **RDS** - Managed database

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/lexiscan.git
   cd lexiscan
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install app dependencies
   cd apps/web && npm install
   cd ../api && npm install
   cd ../dashboard && npm install
   
   # Install package dependencies
   cd ../../packages/shared-types && npm install
   cd ../ui && npm install
   cd ../clients && npm install
   ```

5. **Set up the database**
   ```bash
   cd apps/api
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Start development servers**
   ```bash
   # Terminal 1: API
   cd apps/api && npm run start:dev
   
   # Terminal 2: Web App
   cd apps/web && npm run dev
   
   # Terminal 3: Dashboard
   cd apps/dashboard && npm run dev
   
   # Terminal 4: AI Worker
   cd services/ai-worker && python main.py
   
   # Terminal 5: PDF Generator
   cd services/pdf-generator && python main.py
   ```

7. **Access the applications**
   - Web App: http://localhost:3000
   - Dashboard: http://localhost:3002
   - API Docs: http://localhost:3001/api/docs
   - AI Worker: http://localhost:8000/docs
   - PDF Generator: http://localhost:8001/docs

## 📚 Documentation

- Unified Docs Hub: docs/README.md (now browsable via MkDocs)
- Architecture Overview: docs/ARCHITECTURE.md
- Security Guidelines: docs/SECURITY.md
- Onboarding Guide: docs/ONBOARDING.md
- API Documentation: docs/api/openapi.yaml (local UI at http://localhost:3001/api/docs)
- Deployment Guide: docs/deployment/aws-deployment.md

### View docs locally (MkDocs)
```bash
pip install mkdocs-material
mkdocs serve
# open http://127.0.0.1:8000
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run API tests
cd apps/api && npm run test

# Run web app tests
cd apps/web && npm run test

# Run E2E tests
cd tests/e2e && npm run test

# Run AI service tests
cd services/ai-worker && python -m pytest
cd services/pdf-generator && python -m pytest
```

## 🚀 Deployment

### Staging Deployment

```bash
# Deploy to staging
git push origin develop
# GitHub Actions will automatically deploy to staging
```

### Production Deployment

```bash
# Create a release
git tag v1.0.0
git push origin v1.0.0
# GitHub Actions will automatically deploy to production
```

### Manual Deployment

```bash
# Build and deploy with Terraform
cd infra/terraform/envs/staging
terraform init
terraform plan
terraform apply
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the [TypeScript style guide](https://typescript-eslint.io/rules/)
- Write tests for new features
- Update documentation as needed
- Follow conventional commit messages
- Ensure all CI checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@lexiscan.ai
- 💬 Discord: [Join our community](https://discord.gg/lexiscan)
- 📖 Documentation: [docs.lexiscan.ai](https://docs.lexiscan.ai)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/lexiscan/issues)

## 🙏 Acknowledgments

- OpenAI for providing powerful AI models
- The open-source community for amazing tools and libraries
- Our contributors and early adopters

---

**Built with ❤️ by the LexiScan Team**
