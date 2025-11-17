# FinPilot - Start All Services and Open Browser
# This script starts all services and automatically opens the browser

Write-Host "🚀 Starting FinPilot Services..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker ps | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker is not running"
    }
} catch {
    Write-Host "❌ Error: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Start services in the background
Write-Host "📦 Starting Docker containers..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to be ready
Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow

$maxAttempts = 60
$attempt = 0
$frontendReady = $false
$backendReady = $false

while ($attempt -lt $maxAttempts -and (-not $frontendReady -or -not $backendReady)) {
    Start-Sleep -Seconds 2
    $attempt++
    
    # Check frontend (port 3000)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
        }
    } catch {
        # Still waiting
    }
    
    # Check backend (port 8000)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/admin/" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
        }
    } catch {
        # Still waiting
    }
    
    if ($attempt % 5 -eq 0) {
        Write-Host "   Still waiting... ($attempt/$maxAttempts)" -ForegroundColor Gray
    }
}

Write-Host ""
if ($frontendReady -and $backendReady) {
    Write-Host "✅ All services are ready!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Services are starting (may take a bit longer)..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🌐 Opening browser..." -ForegroundColor Cyan

# Open browser to frontend
Start-Process "http://localhost:3000"

# Also show service URLs
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FinPilot Services Running" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  🎨 Frontend:     http://localhost:3000" -ForegroundColor White
Write-Host "  🔧 Backend API:  http://localhost:8000" -ForegroundColor White
Write-Host "  📊 Admin Panel:  http://localhost:8000/admin/" -ForegroundColor White
Write-Host "  🤖 ML Service:   http://localhost:8080/docs" -ForegroundColor White
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tip: To stop all services, run: docker-compose down" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 View logs: docker-compose logs -f" -ForegroundColor Gray
Write-Host ""

# Keep script running to show logs
Write-Host "Press Ctrl+C to stop services and exit" -ForegroundColor Yellow
Write-Host ""

# Follow logs
docker-compose logs -f

