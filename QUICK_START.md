# 🎯 LexiScanAI - Quick Start Guide

## ✅ What's Already Done

Your project is **professionally set up** and ready to run! Here's what has been completed:

### 1. ✅ Environment Configuration
- `.env` file created from template
- JWT secrets configured
- Database connection strings set up
- All feature flags enabled for development

### 2. ✅ Dependencies Installed
- All root dependencies installed
- All workspace dependencies (apps & packages) installed
- 1,818 packages successfully installed
- Package.json files fixed for compatibility

### 3. ✅ Git Repository Initialized
- Git repository initialized
- Professional `.gitignore` created
- Ready for first commit

### 4. ✅ Documentation Created
- `SETUP.md` - Comprehensive setup guide
- `COMMANDS.md` - Complete command reference
- `QUICK_START.md` - This file!
- All original docs preserved

### 5. ✅ Scripts Added
- `scripts/start-dev.ps1` - Windows PowerShell startup script
- Helper scripts for automation

---

## 🚀 Next Steps to Run the Project

### Step 1: Wait for Docker Desktop to Start (2-3 minutes)

Docker Desktop is starting in the background. **Wait until you see**:
- Docker Desktop icon in system tray (bottom-right)
- Icon changes from "Docker is starting..." to "Docker Desktop is running"

### Step 2: Start Infrastructure Services

Open **PowerShell** or **Command Prompt** and run:

```powershell
cd "C:\Users\Muhammad Ali R\Desktop\LexiScanAi"

# Verify Docker is running
docker ps

# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait 10-15 seconds for services to initialize
timeout /t 15

# Verify services are running
docker-compose ps
```

### Step 3: Setup Database

```powershell
# Navigate to API directory
cd apps\api

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Go back to root
cd ..\..
```

### Step 4: Start Development Servers

**Option A - Start All Services (Recommended):**
```powershell
npm run dev
```

**Option B - Start Services Individually:**

Open **5 separate terminals** and run:

```powershell
# Terminal 1 - API Backend
cd "C:\Users\Muhammad Ali R\Desktop\LexiScanAi\apps\api"
npm run start:dev

# Terminal 2 - Web Frontend  
cd "C:\Users\Muhammad Ali R\Desktop\LexiScanAi\apps\web"
npm run dev

# Terminal 3 - Dashboard
cd "C:\Users\Muhammad Ali R\Desktop\LexiScanAi\apps\dashboard"
npm run dev

# Terminal 4 - AI Worker (if Python installed)
cd "C:\Users\Muhammad Ali R\Desktop\LexiScanAi\services\ai-worker"
pip install -r requirements.txt
python main.py

# Terminal 5 - PDF Generator (if Python installed)
cd "C:\Users\Muhammad Ali R\Desktop\LexiScanAi\services\pdf-generator"
pip install -r requirements.txt
python main.py
```

### Step 5: Access Your Applications

Once all services are running, open your browser:

- **Web App**: http://localhost:3000
- **Dashboard**: http://localhost:3002
- **API Documentation**: http://localhost:3001/api/docs
- **AI Worker Docs**: http://localhost:8000/docs (if Python services running)
- **PDF Generator Docs**: http://localhost:8001/docs (if Python services running)

---

## 📦 Push to GitHub

Once everything is running, you can push to GitHub:

### Step 1: Create Repository on GitHub
1. Go to https://github.com
2. Click "New repository"
3. Name it: `LexiScanAI` (or your preferred name)
4. **Do NOT** initialize with README
5. Click "Create repository"

### Step 2: Push Your Code

```powershell
cd "C:\Users\Muhammad Ali R\Desktop\LexiScanAi"

# Stage all files
git add .

# Create first commit
git commit -m "feat: initial commit - LexiScanAI enterprise platform setup"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/LexiScanAI.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## 🎯 One-Click Startup (After First Time)

After the first setup, use this simple script for daily startup:

```powershell
cd "C:\Users\Muhammad Ali R\Desktop\LexiScanAi"

# Start infrastructure
docker-compose up -d postgres redis

# Start all development servers
npm run dev
```

Or use the PowerShell script:

```powershell
.\scripts\start-dev.ps1
```

---

## 🔍 Verify Everything Works

### Check Services Status

```powershell
# Check Docker containers
docker-compose ps

# Should show postgres and redis as "Up"
```

### Check API Health

```powershell
# Test API endpoint (after API starts)
curl http://localhost:3001/health
```

### Check Database Connection

```powershell
# Open Prisma Studio (visual database tool)
cd apps\api
npx prisma studio

# Opens at http://localhost:5555
```

---

## ⚠️ Troubleshooting

### Docker Desktop Not Starting
- Manually open Docker Desktop from Start Menu
- Wait for "Docker Desktop is running" status
- Then run: `docker-compose up -d postgres redis`

### Port Already in Use
```powershell
# Find process using port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Kill the process
Stop-Process -Id [PID] -Force
```

### Database Connection Failed
```powershell
# Reset Docker services
docker-compose down -v
docker-compose up -d postgres redis

# Wait 15 seconds
timeout /t 15

# Retry database setup
cd apps\api
npx prisma migrate deploy
```

### "Cannot find module" Errors
```powershell
# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install --legacy-peer-deps
```

---

## 📚 Additional Resources

- **Full Setup Guide**: See `SETUP.md`
- **Command Reference**: See `COMMANDS.md`  
- **Architecture**: See `docs/ARCHITECTURE.md`
- **Authentication**: See `docs/AUTHENTICATION.md`
- **Security**: See `docs/SECURITY.md`

---

## 🎉 Success Checklist

- [ ] Docker Desktop is running
- [ ] PostgreSQL and Redis containers started
- [ ] Database migrations applied
- [ ] Prisma Client generated
- [ ] Development servers running
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:3001/api/docs
- [ ] Git repository initialized
- [ ] Code committed
- [ ] Pushed to GitHub

---

## 💡 Pro Tips

1. **Keep Docker Desktop running** - It's needed for database and cache
2. **Use `npm run dev`** - Starts all JS services with Turborepo
3. **Open Prisma Studio** - Visual interface for database: `npx prisma studio`
4. **Check API docs first** - http://localhost:3001/api/docs for endpoint testing
5. **Commit frequently** - Use conventional commits: `feat:`, `fix:`, `docs:`

---

## 🆘 Need Help?

**If you encounter issues:**

1. Check `SETUP.md` for detailed troubleshooting
2. Review `COMMANDS.md` for all available commands
3. Ensure Docker Desktop is fully running
4. Verify all dependencies installed: `npm list --depth=0`

---

## ⏱️ Estimated Time

- **First-time setup**: 10-15 minutes
- **Daily startup**: 2-3 minutes
- **Docker startup**: 2-3 minutes
- **Service startup**: 30-60 seconds

---

**You're almost there! Just wait for Docker Desktop to start, then run the infrastructure and development servers.** 🚀

**Current Status**: ✅ Project configured, dependencies installed, Git initialized, Docker starting...

**Next Step**: Wait for Docker Desktop → Start `docker-compose up -d postgres redis`

