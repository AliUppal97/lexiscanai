# LexiScan AI Onboarding Guide

Welcome to LexiScan AI! This guide will help you get up and running with the development environment and understand the codebase structure.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.11+** - [Download](https://python.org/)
- **Docker & Docker Compose** - [Download](https://docker.com/)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/lexiscan.git
cd lexiscan
```

### 2. Run the Setup Script

```bash
# On Unix/macOS
./scripts/local-dev.sh

# On Windows (PowerShell)
.\scripts\local-dev.sh
```

This script will:
- Check requirements
- Install all dependencies
- Set up the database
- Start all services

### 3. Access the Applications

- **Web App**: http://localhost:3000
- **Dashboard**: http://localhost:3002
- **API Docs**: http://localhost:3001/api/docs
- **AI Worker**: http://localhost:8000/docs
- **PDF Generator**: http://localhost:8001/docs

## Manual Setup

If you prefer to set up manually or the script fails:

### 1. Environment Setup

```bash
cp env.example .env
# Edit .env with your configuration
```

### 2. Install Dependencies

```bash
# Root dependencies
npm install

# App dependencies
cd apps/web && npm install && cd ../..
cd apps/api && npm install && cd ../..
cd apps/dashboard && npm install && cd ../..

# Package dependencies
cd packages/shared-types && npm install && cd ../..
cd packages/ui && npm install && cd ../..
cd packages/clients && npm install && cd ../..

# Python dependencies
cd services/ai-worker && pip install -r requirements.txt && cd ../..
cd services/pdf-generator && pip install -r requirements.txt && cd ../..
```

### 3. Start Services

```bash
# Start infrastructure services
docker-compose up -d postgres redis

# Set up database
cd apps/api
npx prisma migrate dev
npx prisma db seed
cd ../..
```

### 4. Start Development Servers

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

## Project Structure

```
lexiscan/
├─ .github/workflows/     # CI/CD pipelines
├─ infra/terraform/       # Infrastructure as Code
├─ apps/
│  ├─ web/               # Next.js marketing site
│  ├─ dashboard/         # React admin dashboard
│  └─ api/               # NestJS REST API
├─ services/
│  ├─ ai-worker/         # FastAPI AI processing
│  └─ pdf-generator/     # PDF generation service
├─ packages/
│  ├─ shared-types/      # TypeScript types
│  ├─ ui/                # UI components
│  └─ clients/           # API clients
├─ tests/                # E2E and integration tests
├─ docs/                 # Documentation
└─ scripts/              # Utility scripts
```

## Development Workflow

### 1. Feature Development

1. Create a feature branch from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Make your changes
3. Write tests for new functionality
4. Run tests to ensure everything works
   ```bash
   npm run test
   ```

5. Commit your changes
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

6. Push and create a Pull Request

### 2. Code Standards

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the configured linting rules
- **Prettier**: Use Prettier for code formatting
- **Conventional Commits**: Use conventional commit messages
- **Testing**: Write tests for new features

### 3. Database Changes

When making database changes:

1. Update the Prisma schema (`apps/api/prisma/schema.prisma`)
2. Create a migration
   ```bash
   cd apps/api
   npx prisma migrate dev --name your-migration-name
   ```
3. Update the shared types if needed
4. Test the changes thoroughly

## Testing

### Running Tests

```bash
# All tests
npm run test

# Specific app tests
cd apps/api && npm run test
cd apps/web && npm run test

# E2E tests
cd tests/e2e && npm run test

# Python service tests
cd services/ai-worker && python -m pytest
cd services/pdf-generator && python -m pytest
```

### Writing Tests

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and service interactions
- **E2E Tests**: Test complete user workflows
- **Test Coverage**: Aim for >80% code coverage

## Debugging

### API Debugging

- Use the Swagger UI at http://localhost:3001/api/docs
- Check logs in the terminal running the API
- Use Postman or similar tools for API testing

### Frontend Debugging

- Use browser developer tools
- React Developer Tools extension
- Next.js debugging features

### Database Debugging

- Use Prisma Studio: `cd apps/api && npx prisma studio`
- Check database logs in Docker: `docker-compose logs postgres`

## Common Issues

### Port Conflicts

If you get port conflicts:

```bash
# Check what's using the port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change ports in .env
```

### Database Connection Issues

```bash
# Reset the database
./scripts/db-reset.sh

# Or manually
docker-compose down
docker-compose up -d postgres
cd apps/api && npx prisma migrate dev
```

### Dependency Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For Python services
pip install --upgrade pip
pip install -r requirements.txt
```

## Useful Commands

### Development

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Reset database
./scripts/db-reset.sh

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

### Database

```bash
# Generate Prisma client
cd apps/api && npx prisma generate

# Create migration
cd apps/api && npx prisma migrate dev --name migration-name

# Reset database
cd apps/api && npx prisma migrate reset

# Open Prisma Studio
cd apps/api && npx prisma studio
```

## Getting Help

### Documentation

- [Architecture Overview](ARCHITECTURE.md)
- [Security Guidelines](SECURITY.md)
- [API Documentation](http://localhost:3001/api/docs)

### Support Channels

- **Slack**: #lexiscan-dev
- **Email**: dev@lexiscan.ai
- **GitHub Issues**: Create an issue for bugs or feature requests

### Code Review

- All code changes require review
- Be responsive to feedback
- Ask questions if anything is unclear

## Next Steps

1. **Explore the Codebase**: Start with the API and web app
2. **Read the Documentation**: Understand the architecture
3. **Run Tests**: Ensure everything works
4. **Make a Small Change**: Try adding a feature or fixing a bug
5. **Ask Questions**: Don't hesitate to ask for help

Welcome to the team! 🚀
