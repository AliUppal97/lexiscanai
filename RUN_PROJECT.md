# 🚀 LexiScanAI - Project Ready to Run!

## ✅ Completed Setup

Your LexiScanAI project has been successfully set up with the following:

### Infrastructure
- ✅ Docker containers running (PostgreSQL & Redis)
- ✅ Database schema created with Prisma
- ✅ Prisma Client generated
- ✅ Environment variables configured (`.env`)
- ✅ All dependencies installed

### Status Check
```powershell
# Check Docker containers
docker-compose ps

# Both services should show "healthy" status:
# - lexiscanai-postgres-1 (PostgreSQL 15)
# - lexiscanai-redis-1 (Redis 7)
```

---

## 🏃 How to Run the Project

### Option 1: Start All Services (Recommended)

```bash
npm run dev
```

This will start all services simultaneously using Turborepo:
- **API** on `http://localhost:3001`
- **Web App** on `http://localhost:3000`
- **Dashboard** on `http://localhost:3002`

### Option 2: Start Services Individually

#### Terminal 1 - API (NestJS):
```bash
cd apps/api
npm run start:dev
```

#### Terminal 2 - Web App (Next.js):
```bash
cd apps/web
npm run dev
```

#### Terminal 3 - Dashboard (React + Vite):
```bash
cd apps/dashboard
npm run dev
```

#### Terminal 4 - AI Worker (FastAPI):
```bash
cd services/ai-worker
pip install -r requirements.txt
python main.py
```

#### Terminal 5 - PDF Generator (FastAPI):
```bash
cd services/pdf-generator
pip install -r requirements.txt
python main.py
```

---

## 📍 Access Points

Once running, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| **Web App** | http://localhost:3000 | Main user-facing application |
| **Dashboard** | http://localhost:3002 | Admin and analytics dashboard |
| **API** | http://localhost:3001/api | REST API endpoint |
| **API Docs** | http://localhost:3001/api/docs | Swagger documentation |
| **AI Worker** | http://localhost:8000 | Document processing service |
| **PDF Generator** | http://localhost:8001 | Report generation service |
| **Prisma Studio** | http://localhost:5555 | Database GUI (run `npx prisma studio` in apps/api) |

---

## 🔧 Common Commands

### Development
```bash
# Start all services
npm run dev

# Type checking
npm run typecheck

# Lint code
npm run lint

# Run tests
npm run test

# Format code
npm run format
```

### Database
```bash
# Open Prisma Studio
cd apps/api
npx prisma studio

# Create a new migration
cd apps/api
npx prisma migrate dev --name your_migration_name

# Generate Prisma Client
cd apps/api
npx prisma generate
```

### Docker
```bash
# View logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Restart services
docker-compose restart

# Stop all containers
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

---

## 🎯 Next Steps

### 1. Start Development
```bash
npm run dev
```

### 2. Create Your First Tenant (Optional)
```bash
# Use the API to create a tenant
curl -X POST http://localhost:3001/api/auth/users/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "slug": "my-company",
    "adminEmail": "admin@mycompany.com",
    "adminPassword": "SecurePassword123!",
    "adminFirstName": "Admin",
    "adminLastName": "User"
  }'
```

### 3. Initialize Git Repository
```bash
# Initialize Git
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial commit - LexiScanAI platform setup"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/LexiScanAI.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 📚 Documentation

- **Setup Guide**: `SETUP.md`
- **Commands Reference**: `COMMANDS.md`
- **Quick Start**: `QUICK_START.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Authentication**: `docs/AUTHENTICATION.md`
- **Security**: `docs/SECURITY.md`

---

## ⚠️ Important Notes

### Environment Variables
The `.env` file has been created with default development values. For production:
- Update `JWT_SECRET` with a secure 32+ character string
- Add your API keys (OpenAI, Pinecone, AWS, etc.)
- Set `NODE_ENV=production`

### Database
- Database name: `lexiscan`
- Username: `lexiscan`
- Password: `lexiscan_password`
- Port: `5432`

### Known Issues
1. **pgvector Extension**: Not installed in the local PostgreSQL container. Vector search features will not work until installed.
2. **Row-Level Security**: Column name mismatches between Prisma (camelCase) and RLS migrations (snake_case). RLS policies may need adjustment.

---

## 🆘 Troubleshooting

### Docker Not Running
```bash
# Start Docker Desktop manually, then run:
docker-compose up -d postgres redis
```

### Port Already in Use
```powershell
# Find and kill process using a port
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
Stop-Process -Id [PID] -Force
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Clean Restart
```bash
# Stop everything
docker-compose down

# Remove all node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps

# Start fresh
docker-compose up -d postgres redis
npm run dev
```

---

## 🎉 Success!

Your LexiScanAI development environment is ready! Run `npm run dev` to start coding.

For more details, see:
- `COMMANDS.md` for all available commands
- `SETUP.md` for detailed setup instructions
- `docs/` folder for technical documentation

Happy coding! 🚀

