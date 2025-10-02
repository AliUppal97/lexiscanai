# LexiScanAI - Command Reference Guide

## 🎯 Quick Command Reference

### 🏁 Initial Setup (First Time Only)

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/LexiScanAI.git
cd LexiScanAI

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Setup environment
# .env file already created - update API keys as needed

# 4. Start Docker Desktop manually
# Then run infrastructure services
docker-compose up -d postgres redis

# 5. Setup database
cd apps/api
npx prisma generate
npx prisma migrate deploy
cd ../..
```

## 🔄 Upgrade to Next.js 15 (Optional)

```powershell
# Run the automated upgrade script
.\scripts\upgrade-nextjs15.ps1

# Or manually upgrade
cd apps/web
npm install --legacy-peer-deps
cd ../..
npm run typecheck
npm run lint
```

---

## 🚀 Daily Development Commands

### Start Development Environment

**PowerShell Script (Recommended for Windows):**
```powershell
.\scripts\start-dev.ps1
```

**Manual Start:**
```bash
# 1. Start infrastructure (if not running)
docker-compose up -d postgres redis

# 2. Start all development servers
npm run dev
```

**Individual Services:**
```bash
# API (Terminal 1)
cd apps/api
npm run start:dev

# Web App (Terminal 2)
cd apps/web
npm run dev

# Dashboard (Terminal 3)
cd apps/dashboard
npm run dev
```

### Stop Services
```bash
# Stop Docker services
docker-compose down

# Stop dev servers: Press Ctrl+C in each terminal
```

---

## 📦 Package Management

### Install/Update Dependencies
```bash
# Install all workspace dependencies
npm install --legacy-peer-deps

# Install in specific workspace
cd apps/api
npm install [package-name]

# Update all dependencies
npm update
```

### Clean Install
```bash
# Remove node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install --legacy-peer-deps
```

---

## 🗄️ Database Commands

### Prisma Client
```bash
# Generate Prisma Client (after schema changes)
cd apps/api
npx prisma generate
```

### Migrations
```bash
cd apps/api

# Create new migration
npx prisma migrate dev --name add_new_feature

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Database Tools
```bash
cd apps/api

# Open Prisma Studio (GUI for database)
npx prisma studio

# Seed database
npx prisma db seed

# Push schema changes without migration
npx prisma db push
```

---

## 🐳 Docker Commands

### Container Management
```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d postgres redis

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Restart service
docker-compose restart postgres
```

### Monitoring
```bash
# View running containers
docker-compose ps

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f postgres
docker-compose logs -f api

# Execute commands in container
docker-compose exec postgres psql -U lexiscan -d lexiscan_dev
```

### Cleanup
```bash
# Remove stopped containers
docker-compose rm

# Remove all containers and networks
docker-compose down

# Remove everything including volumes
docker-compose down -v --remove-orphans
```

---

## 🏗️ Build Commands

### Development Build
```bash
# Build all workspaces
npm run build

# Build specific app
cd apps/api && npm run build
cd apps/web && npm run build
cd apps/dashboard && npm run build
```

### Production Build
```bash
# Set NODE_ENV
$env:NODE_ENV="production"  # PowerShell

# Build for production
npm run build
```

---

## 🧪 Testing Commands

### Run Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Test specific workspace
cd apps/api
npm run test
npm run test:e2e
```

### Linting & Type Checking
```bash
# Lint all workspaces
npm run lint

# Lint and fix
npm run lint -- --fix

# Type check
npm run typecheck

# Format code
npm run format
```

---

## 🐍 Python Services Commands

### AI Worker
```bash
cd services/ai-worker

# Install dependencies
pip install -r requirements.txt

# Run service
python main.py

# Run with auto-reload
uvicorn main:app --reload --port 8000

# Run tests
pytest
```

### PDF Generator
```bash
cd services/pdf-generator

# Install dependencies
pip install -r requirements.txt

# Run service
python main.py

# Run with auto-reload
uvicorn main:app --reload --port 8001
```

---

## 🔄 Git Commands

### Initial Setup
```bash
# Initialize repository
git init

# Add files
git add .

# Create first commit
git commit -m "feat: initial commit - LexiScanAI platform"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/LexiScanAI.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Daily Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update documentation"

# Push to GitHub
git push origin feature/your-feature-name

# Merge to main
git checkout main
git merge feature/your-feature-name
git push origin main
```

### Useful Git Commands
```bash
# Check status
git status

# View changes
git diff

# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Stash changes
git stash
git stash pop
```

---

## 🚢 Deployment Commands

### Build Docker Images
```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build api
docker-compose build web
```

### Deploy to Staging
```bash
# Automated via GitHub Actions on push to 'develop' branch
git push origin develop
```

### Deploy to Production
```bash
# Create release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# GitHub Actions will automatically deploy
```

---

## 📊 Monitoring Commands

### View Application Logs
```bash
# Docker logs
docker-compose logs -f api
docker-compose logs -f web

# Application logs (when running locally)
# Check terminal output
```

### Database Monitoring
```bash
# Connect to database
docker-compose exec postgres psql -U lexiscan -d lexiscan_dev

# View active connections
docker-compose exec postgres psql -U lexiscan -d lexiscan_dev -c "SELECT * FROM pg_stat_activity;"
```

### Health Checks
```bash
# API health
curl http://localhost:3001/health

# AI Worker health
curl http://localhost:8000/health

# PDF Generator health
curl http://localhost:8001/health
```

---

## 🛠️ Maintenance Commands

### Update Dependencies
```bash
# Check outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm install package-name@latest
```

### Clean Build Artifacts
```bash
# Clean all build outputs
npm run clean

# Or manually
Remove-Item -Recurse -Force dist, .next, build
```

### Database Maintenance
```bash
cd apps/api

# Backup database
docker-compose exec postgres pg_dump -U lexiscan lexiscan_dev > backup.sql

# Restore database
docker-compose exec -T postgres psql -U lexiscan lexiscan_dev < backup.sql
```

---

## 🆘 Troubleshooting Commands

### Fix Port Conflicts
```powershell
# Find process using port
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Kill process
Stop-Process -Id [PID] -Force
```

### Reset Everything
```bash
# Stop all services
docker-compose down -v

# Remove all node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install --legacy-peer-deps

# Restart Docker services
docker-compose up -d postgres redis

# Recreate database
cd apps/api
npx prisma migrate reset
npx prisma generate
```

### Clear Caches
```bash
# NPM cache
npm cache clean --force

# Turborepo cache
Remove-Item -Recurse -Force .turbo

# Next.js cache
Remove-Item -Recurse -Force apps/web/.next

# Vite cache
Remove-Item -Recurse -Force apps/dashboard/node_modules/.vite
```

---

## 📝 Commit Message Conventions

```bash
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style changes (formatting)
refactor: Code refactoring
perf:     Performance improvements
test:     Adding or updating tests
chore:    Maintenance tasks
ci:       CI/CD changes
```

**Examples:**
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve database connection issue"
git commit -m "docs: update API documentation"
```

---

## 🎯 Most Used Commands Summary

```bash
# Daily startup
docker-compose up -d postgres redis
npm run dev

# Git workflow
git checkout -b feature/name
git add .
git commit -m "feat: description"
git push origin feature/name

# Database updates
cd apps/api
npx prisma generate
npx prisma migrate dev --name description

# Testing
npm run test
npm run lint
npm run typecheck

# Cleanup
docker-compose down
```

---

## 🔗 Quick Links

- **API Docs**: http://localhost:3001/api/docs
- **Prisma Studio**: http://localhost:5555 (run `npx prisma studio`)
- **Web App**: http://localhost:3000
- **Dashboard**: http://localhost:3002

---

## 💡 Pro Tips

1. Use `npm run dev` to start all services with Turborepo
2. Keep Docker Desktop running during development
3. Use Prisma Studio for database visualization
4. Commit frequently with descriptive messages
5. Run tests before pushing code
6. Check API docs for endpoint testing

---

**Need help?** Check `SETUP.md` or `docs/` folder for detailed guides.

