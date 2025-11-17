# FinPilot - Quick Start (Single Line Command)
# Usage: .\start.ps1
# Or run directly: docker-compose up -d; Start-Sleep -Seconds 8; Start-Process "http://localhost:3000"; docker-compose logs -f

Write-Host "🚀 Starting FinPilot..." -ForegroundColor Cyan
docker-compose up -d
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8
Write-Host "🌐 Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"
Write-Host ""
Write-Host "✅ Services started! Browser opened." -ForegroundColor Green
Write-Host "📊 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "🔧 Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "📝 Admin:    http://localhost:8000/admin/" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop services" -ForegroundColor Yellow
Write-Host ""
docker-compose logs -f

