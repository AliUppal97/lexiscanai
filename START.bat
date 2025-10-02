@echo off
REM LexiScanAI - Quick Start Script for Windows
REM Double-click this file to start the development environment

echo.
echo ========================================
echo   LexiScanAI Development Environment
echo ========================================
echo.

REM Change to project directory
cd /d "%~dp0"

echo [1/4] Checking Docker status...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Docker Desktop is not running!
    echo.
    echo Please start Docker Desktop manually and try again.
    echo Look for the Docker icon in your system tray.
    echo.
    pause
    exit /b 1
)

echo [SUCCESS] Docker is running
echo.

echo [2/4] Starting PostgreSQL and Redis...
docker-compose up -d postgres redis

echo.
echo [3/4] Waiting for services to initialize (15 seconds)...
timeout /t 15 /nobreak >nul

echo.
echo [4/4] Services are ready!
echo.

docker-compose ps

echo.
echo ========================================
echo   Infrastructure is Ready!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Open a new terminal and run:
echo    cd apps\api
echo    npx prisma generate
echo    npx prisma migrate deploy
echo.
echo 2. Then start development servers:
echo    npm run dev
echo.
echo Or run the PowerShell script:
echo    .\scripts\start-dev.ps1
echo.
echo Access your applications at:
echo   - Web App:  http://localhost:3000
echo   - Dashboard: http://localhost:3002
echo   - API Docs:  http://localhost:3001/api/docs
echo.

pause

