# FinPilot Quick Start Guide

## 🚀 All Services Running!

Your FinPilot application is now running in Docker containers. Here's what's available:

### Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Backend Admin**: http://localhost:8000/admin
- **ML Service**: http://localhost:8080
- **ML Service Docs**: http://localhost:8080/docs
- **ML Dashboard**: http://localhost:3001

### Service Status

All services should be running. Check status with:
```bash
docker-compose ps
```

### First Steps

1. **Create a Superuser** (for admin access):
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

2. **Seed Demo Data** (creates 3 demo businesses):
   ```bash
   docker-compose exec backend python manage.py shell
   # Then run:
   exec(open('scripts/seed_demo.py').read())
   ```

   Or directly:
   ```bash
   docker-compose exec backend python scripts/seed_demo.py
   ```

3. **Access the Application**:
   - Open http://localhost:3000 in your browser
   - Sign up for a new account or use demo credentials
   - Explore the dashboard, transactions, and forecasts

### Demo Accounts

After seeding, you can use:
- `baker@example.com` / password: `demo123`
- `designer@example.com` / password: `demo123`
- `shop@example.com` / password: `demo123`

### Common Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f ml_service
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### Troubleshooting

If services aren't starting:
1. Check logs: `docker-compose logs [service_name]`
2. Rebuild containers: `docker-compose build`
3. Restart services: `docker-compose restart`

### ML Service Training

The ML service will train models automatically on first startup. This may take 5-10 minutes. You can monitor progress:
```bash
docker-compose logs -f ml_service
```

Once training completes, the service will be available at http://localhost:8080

