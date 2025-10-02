# LexiScanAI - Development Startup Script for Windows
# This script automates the startup of all development services

Write-Host "🚀 Starting LexiScanAI Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "📦 Checking Docker status..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Desktop is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Start infrastructure services
Write-Host "🐘 Starting PostgreSQL and Redis..." -ForegroundColor Yellow
docker-compose up -d postgres redis

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if services are running
Write-Host "✅ Infrastructure services started" -ForegroundColor Green
docker-compose ps

Write-Host ""
Write-Host "🔧 Setting up database..." -ForegroundColor Yellow

# Navigate to API directory and run migrations
Set-Location apps/api

# Generate Prisma Client
Write-Host "📝 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# Run migrations
Write-Host "🗄️ Running database migrations..." -ForegroundColor Yellow
npx prisma migrate deploy

Set-Location ../..

Write-Host ""
Write-Host "✅ Database setup complete!" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 All services are ready!" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start development servers, run:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Or start services individually:" -ForegroundColor Yellow
Write-Host "  - API:       cd apps/api && npm run start:dev" -ForegroundColor White
Write-Host "  - Web:       cd apps/web && npm run dev" -ForegroundColor White
Write-Host "  - Dashboard: cd apps/dashboard && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Access points:" -ForegroundColor Yellow
Write-Host "  - Web App:       http://localhost:3000" -ForegroundColor White
Write-Host "  - Dashboard:     http://localhost:3002" -ForegroundColor White
Write-Host "  - API Docs:      http://localhost:3001/api/docs" -ForegroundColor White
Write-Host ""

