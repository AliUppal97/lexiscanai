# LexiScanAI - Next.js 15 Upgrade Script
# This script safely upgrades your project to Next.js 15

Write-Host "🚀 Starting Next.js 15 upgrade process..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "apps/web/package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing Next.js 15 and React 19..." -ForegroundColor Yellow

# Navigate to web app directory
Set-Location "apps/web"

try {
    # Install dependencies with legacy peer deps to handle React 19 compatibility issues
    Write-Host "Installing dependencies with --legacy-peer-deps flag..." -ForegroundColor Cyan
    npm install --legacy-peer-deps
    
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    
    # Go back to project root
    Set-Location "../.."
    
    Write-Host "🧪 Running type check..." -ForegroundColor Yellow
    npm run typecheck
    
    Write-Host "🔍 Running linting..." -ForegroundColor Yellow
    npm run lint
    
    Write-Host "🎉 Next.js 15 upgrade completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Test your application: npm run dev" -ForegroundColor White
    Write-Host "2. Check for any console errors or warnings" -ForegroundColor White
    Write-Host "3. Test all major functionality" -ForegroundColor White
    Write-Host "4. Update any custom code that might be affected by React 19 changes" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  Important Notes:" -ForegroundColor Yellow
    Write-Host "- React 19 introduces some breaking changes" -ForegroundColor White
    Write-Host "- Some third-party packages might not be compatible yet" -ForegroundColor White
    Write-Host "- Use --legacy-peer-deps flag if you encounter dependency conflicts" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error during upgrade: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Clear node_modules: Remove-Item -Recurse -Force node_modules" -ForegroundColor White
    Write-Host "2. Clear package-lock.json: Remove-Item package-lock.json" -ForegroundColor White
    Write-Host "3. Reinstall: npm install --legacy-peer-deps" -ForegroundColor White
    Write-Host "4. If issues persist, check package compatibility with React 19" -ForegroundColor White
    
    # Go back to project root
    Set-Location "../.."
    exit 1
}

Write-Host "✨ Upgrade script completed!" -ForegroundColor Green
