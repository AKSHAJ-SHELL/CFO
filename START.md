# 🚀 Quick Start - Single Command

## Windows (PowerShell)

### Option 1: Run the script
```powershell
.\start.ps1
```

### Option 2: Single line command
```powershell
docker-compose up -d; Start-Sleep -Seconds 8; Start-Process "http://localhost:3000"; docker-compose logs -f
```

### Option 3: Using the batch file
```cmd
start-all.bat
```

## What it does:

1. ✅ Starts all Docker services (backend, frontend, database, Redis, ML service)
2. ⏳ Waits 8 seconds for services to initialize
3. 🌐 Automatically opens your browser to http://localhost:3000
4. 📝 Shows live logs from all services

## Service URLs:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin/
- **ML Service Docs**: http://localhost:8080/docs

## Stop Services:

Press `Ctrl+C` to stop viewing logs, then:
```powershell
docker-compose down
```

## Requirements:

- Docker Desktop must be running
- Ports 3000, 8000, 8080, 5432, 6379 should be available

