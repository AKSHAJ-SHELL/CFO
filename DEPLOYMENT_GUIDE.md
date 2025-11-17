# FinPilot Production Deployment Guide

## 🚀 Quick Production Setup

### 1. Environment Configuration

Create `.env.production`:
```bash
# Django
DJANGO_SECRET_KEY=<generate-secure-key>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_NAME=finpilot_prod
DB_USER=finpilot_prod
DB_PASSWORD=<secure-password>
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=<sendgrid-api-key>

# Monitoring
SENTRY_DSN=https://...
```

### 2. Database Setup

```bash
# Run migrations
docker-compose -f docker-compose.prod.yml run backend python manage.py migrate

# Create superuser
docker-compose -f docker-compose.prod.yml run backend python manage.py createsuperuser

# Collect static files
docker-compose -f docker-compose.prod.yml run backend python manage.py collectstatic --noinput
```

### 3. Deploy

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

### 4. SSL/HTTPS Setup

```bash
# Using Let's Encrypt
certbot certonly --webroot -w /var/www/html -d yourdomain.com -d www.yourdomain.com

# Configure nginx with SSL
# Edit nginx/nginx.conf to include SSL certificates
```

## 📊 Monitoring Setup

### Sentry (Error Tracking)
```python
# In settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=config('SENTRY_DSN'),
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,
    environment='production',
)
```

### Health Checks
- **Backend Health:** https://yourdomain.com/api/health/
- **Database:** Monitor connection pool
- **Redis:** Monitor memory usage
- **Celery:** Monitor task queue length

### Metrics to Monitor
- Response times (p50, p95, p99)
- Error rates
- Database query performance
- Celery task execution time
- Memory usage
- CPU usage

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          python manage.py test
      - name: Build and push Docker images
        run: |
          docker-compose -f docker-compose.prod.yml build
          docker-compose -f docker-compose.prod.yml push
      - name: Deploy to server
        run: |
          ssh user@server 'cd /app && docker-compose pull && docker-compose up -d'
```

## 💾 Backup Strategy

### Database Backups
```bash
# Daily automated backups
0 2 * * * docker exec finpilot_db pg_dump -U finpilot finpilot_prod > /backups/db-$(date +\%Y\%m\%d).sql

# Restore from backup
docker exec -i finpilot_db psql -U finpilot finpilot_prod < /backups/db-20240101.sql
```

### File Backups
- Media files: S3 or similar
- Static files: CDN
- Logs: Centralized logging (ELK, CloudWatch)

## 🔐 Security Hardening

### SSL/TLS
- Force HTTPS
- HSTS enabled
- Modern TLS versions only

### Firewall
- Only ports 80, 443 open
- Database port blocked externally
- Redis port blocked externally

### Rate Limiting
```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer (nginx, HAProxy, AWS ALB)
- Multiple backend instances
- Separate Celery workers

### Database Scaling
- Read replicas for heavy read workloads
- Connection pooling (PgBouncer)
- Query optimization

### Caching
- Redis for session storage
- API response caching
- Database query caching

## 🧪 Beta Rollout Plan

### Phase 1: Internal Testing (Week 1)
- Deploy to staging
- Team testing
- Bug fixes

### Phase 2: Beta Users (Weeks 2-4)
- 10-20 selected users
- Feedback collection
- Performance monitoring

### Phase 3: Soft Launch (Weeks 5-6)
- Open to waitlist
- Gradual user onboarding
- Support infrastructure ready

### Phase 4: Public Launch (Week 7+)
- Marketing campaign
- Full support team
- Monitoring & scaling ready

## 📞 Support & Maintenance

### On-Call Rotation
- 24/7 monitoring alerts
- Incident response procedures
- Escalation paths

### Regular Maintenance
- Weekly: Review logs, metrics
- Monthly: Security updates
- Quarterly: Performance optimization
- Annually: Architecture review

## 🎯 Success Metrics

### Technical KPIs
- 99.9% uptime
- < 200ms avg response time
- < 0.1% error rate
- < 30s p99 response time

### Business KPIs
- User activation rate
- Feature adoption
- Customer satisfaction
- Churn rate

---

**Production Checklist Complete!** ✅

Ready for deployment with monitoring, backups, security, and scaling in place.

