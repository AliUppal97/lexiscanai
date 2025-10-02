# LexiScanAI - Complete Setup Guide

## 🚀 Quick Start Summary

### Prerequisites
- **Node.js 18+** and **npm 9+**
- **Docker Desktop** (for PostgreSQL & Redis)
- **Python 3.11+** (for AI services)
- **Git** (for version control)

---

## 📋 Step-by-Step Setup

### 1. Environment Configuration
```bash
# Already completed - .env file created from env.example
# Update API keys as needed for production
```

### 2. Install Dependencies
```bash
# Install all workspace dependencies
npm install --legacy-peer-deps
```

### 3. Start Infrastructure Services

**Start Docker Desktop first**, then run:

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Verify services are running
docker-compose ps
```

### 4. Database Setup

```bash
# Navigate to API directory
cd apps/api

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed initial data
npx prisma db seed

cd ../..
```

### 5. Start Development Services

**Option A: Start all services with Turborepo (Recommended)**
```bash
npm run dev
```

**Option B: Start services individually**

```bash
# Terminal 1 - API Backend
cd apps/api
npm run start:dev

# Terminal 2 - Web Frontend
cd apps/web
npm run dev

# Terminal 3 - Dashboard
cd apps/dashboard
npm run dev

# Terminal 4 - AI Worker (Python)
cd services/ai-worker
pip install -r requirements.txt
python main.py

# Terminal 5 - PDF Generator (Python)
cd services/pdf-generator
pip install -r requirements.txt
python main.py
```

---

## 🌐 Access Applications

After starting all services:

- **Web App**: http://localhost:3000
- **Dashboard**: http://localhost:3002  
- **API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **AI Worker**: http://localhost:8000/docs
- **PDF Generator**: http://localhost:8001/docs

---

## 🛠️ Essential Commands

### Development
```bash
# Start all services in development mode
npm run dev

# Run linting across all workspaces
npm run lint

# Type checking
npm run typecheck

# Run tests
npm run test

# Format code
npm run format
```

### Database Management
```bash
# Generate Prisma client
npm run db:generate

# Create new migration
cd apps/api
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio (Database GUI)
npx prisma studio

# Reset database (⚠️ destructive)
npm run db:reset
```

### Build for Production
```bash
# Build all applications
npm run build

# Build specific app
cd apps/api
npm run build

cd ../web
npm run build
```

### Docker Commands
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart [service-name]

# Remove all containers and volumes
docker-compose down -v
```

---

## 🔧 Troubleshooting

### Port Conflicts
If ports are already in use:
```bash
# Check what's using a port (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Or use netstat
netstat -ano | findstr :3000
```

### Database Connection Issues
```bash
# Reset database
cd apps/api
npx prisma migrate reset

# Or recreate containers
docker-compose down -v
docker-compose up -d postgres redis
```

### Dependency Issues
```bash
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install --legacy-peer-deps
```

### Docker Desktop Not Running
1. Start Docker Desktop manually
2. Wait for it to fully initialize (whale icon in system tray)
3. Then run: `docker-compose up -d postgres redis`

---

## 📦 Project Structure

```
LexiScanAI/
├── apps/
│   ├── api/              # NestJS Backend API
│   ├── web/              # Next.js Marketing & App
│   └── dashboard/        # React Admin Dashboard
├── services/
│   ├── ai-worker/        # Python AI Processing Service
│   └── pdf-generator/    # Python PDF Generation Service
├── packages/
│   ├── shared-types/     # TypeScript Type Definitions
│   ├── ui/               # Shared UI Components
│   └── clients/          # API Client Libraries
├── infra/
│   ├── terraform/        # Infrastructure as Code
│   └── k8s/              # Kubernetes Configs
├── docs/                 # Documentation
├── tests/                # E2E & Integration Tests
└── scripts/              # Utility Scripts
```

---

## 🔐 Security Notes

⚠️ **Important:**
- Never commit `.env` files to Git
- Update JWT_SECRET with a strong random value for production
- Use environment-specific secrets for different environments
- Keep API keys secure and rotate regularly

---

## 📝 Git Repository Setup

### Initialize Repository
```bash
# Initialize Git
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial commit - LexiScanAI platform setup"
```

### Push to GitHub
```bash
# Create repository on GitHub first, then:

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/LexiScanAI.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🎯 First-Time Setup Checklist

- [x] Environment variables configured (.env)
- [x] Dependencies installed (npm install)
- [ ] Docker Desktop running
- [ ] PostgreSQL & Redis started
- [ ] Database migrations applied
- [ ] Prisma Client generated
- [ ] All services running
- [ ] Access applications in browser
- [ ] Git repository initialized
- [ ] Code pushed to GitHub

---

## 📚 Additional Resources

- [Architecture Documentation](docs/ARCHITECTURE.md)
- [Authentication Guide](docs/AUTHENTICATION.md)
- [Security Guidelines](docs/SECURITY.md)
- [Onboarding Guide](docs/ONBOARDING.md)

---

## 🆘 Getting Help

- **Documentation**: Check `/docs` folder
- **API Docs**: http://localhost:3001/api/docs (when running)
- **Issues**: Create GitHub issue for bugs/features

---

## 🎉 You're All Set!

Your enterprise-grade LexiScanAI platform is ready for development. Happy coding! 🚀

