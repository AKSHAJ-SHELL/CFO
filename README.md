# FinPilot — AI CFO for Small Business Owners

**Tagline:** "Your business finances, on autopilot."

## Overview

FinPilot is a full-stack financial management platform that helps small business owners track transactions, forecast cashflow, detect anomalies, and receive AI-powered financial insights—all running locally with no external API dependencies for core AI features.

## Architecture

- **Frontend**: Next.js 14 + TypeScript + TailwindCSS + ShadCN UI
- **Backend**: Django 5 + Django REST Framework + PostgreSQL
- **ML Service**: FastAPI + PyTorch (local models, no OpenAI required)
- **Background Jobs**: Celery + Redis
- **Billing**: Stripe (test mode)
- **Banking**: Plaid sandbox/mock integration

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### One-Click Local Development

```bash
# Clone the repository
git clone <repo-url>
cd finpilot

# Create .env file from template (or create manually)
# Note: On Windows, use PowerShell or create .env manually

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Backend Admin: http://localhost:8000/admin
# ML Service: http://localhost:8080
# ML Service Docs: http://localhost:8080/docs
# ML Dashboard: http://localhost:3001

# Note: First run will take longer as ML models are trained
# Subsequent runs will be faster as models are cached
```

### Manual Setup (Development)

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables (see .env.example)
# Set DATABASE_URL, REDIS_URL, etc.

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Seed demo data (optional - creates 3 demo businesses)
python scripts/seed_demo.py

# Start development server
python manage.py runserver

# In another terminal, start Celery worker
celery -A app.core.celery worker --loglevel=info
```

#### Frontend Setup

```bash
cd frontend
npm install
cp ../.env.example ../.env.local  # Configure your .env.local

# Start development server
npm run dev
```

#### ML Service Setup

```bash
cd ml_service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# This will auto-generate data and train models on first run
bash start.sh
```

## Project Structure

```
finpilot/
├── backend/              # Django REST API
│   ├── app/
│   │   ├── api/         # DRF viewsets & serializers
│   │   ├── core/        # Settings, utils, middleware
│   │   ├── finance/     # Forecasting, anomaly detection
│   │   ├── users/       # Auth, organizations
│   │   ├── billing/     # Stripe integration
│   │   ├── connections/ # Plaid/QuickBooks connectors
│   │   └── reports/     # Report generation
│   ├── scripts/         # Seed scripts
│   └── tests/           # Backend tests
├── frontend/            # Next.js application
│   ├── src/
│   │   ├── app/         # Next.js app router pages
│   │   ├── components/  # React components
│   │   └── lib/         # Utilities, API client
│   └── public/          # Static assets
├── ml_service/          # FastAPI ML microservice
│   ├── app/
│   │   ├── models/      # PyTorch models
│   │   ├── data/        # Data generation & preprocessing
│   │   ├── training/    # Training scripts
│   │   └── inference/   # Inference logic
├── ml_dashboard/        # React dashboard for ML metrics
│   ├── src/
│   │   ├── components/  # Charts, metrics, logs
│   │   └── pages/       # Dashboard pages
├── docker-compose.yml   # Multi-container orchestration
├── .env.example         # Environment variables template
└── README.md            # This file
```

## Environment Variables

See `.env.example` for all required environment variables. Key variables:

- `DATABASE_URL`: PostgreSQL connection string
- `DJANGO_SECRET_KEY`: Django secret key (auto-generated if missing)
- `REDIS_URL`: Redis connection string
- `STRIPE_API_KEY`: Stripe test API key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `PLAID_CLIENT_ID`: Plaid sandbox client ID
- `PLAID_SECRET`: Plaid sandbox secret
- `OPENAI_API_KEY`: Optional (for future enhancements)
- `ML_INTERNAL_TOKEN`: Token for ML service auth
- `ML_SERVICE_URL`: ML service URL (default: http://ml_service:8080)

## Features

### ✅ Core Features (MVP)

- [x] User registration and authentication (JWT)
- [x] Organization management
- [x] Bank account connections (Plaid sandbox/mock)
- [x] Transaction ingestion and classification
- [x] 90-day cashflow forecasting
- [x] Anomaly detection
- [x] AI-generated weekly reports (local LLM)
- [x] Stripe billing integration (test mode)
- [x] Background job processing (Celery)
- [x] Dashboard with KPIs and charts
- [x] Transaction search and filtering
- [x] Manual category overrides

### 🔐 Security Features

- Encrypted database fields for sensitive data
- JWT token-based authentication with refresh tokens
- Rate limiting on auth endpoints
- Secure password hashing (Argon2)
- Docker network isolation
- Environment-based secrets management

### 🤖 AI/ML Features

- **Expense Classifier**: PyTorch-based transaction categorization
- **Report Generator**: Local LLM for financial summaries
- **Cashflow Forecasting**: LSTM-based 90-day projections
- **Anomaly Detection**: Isolation Forest-based outlier detection
- **Synthetic Data Generation**: Realistic test data for training

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/me/` - Get current user profile

### Organization Endpoints

- `GET /api/orgs/` - List user's organizations
- `POST /api/orgs/` - Create new organization
- `GET /api/orgs/{id}/` - Get organization details

### Transaction Endpoints

- `GET /api/orgs/{org_id}/transactions/` - List transactions (paginated)
- `POST /api/orgs/{org_id}/transactions/{id}/classify/` - Reclassify transaction
- `POST /api/orgs/{org_id}/transactions/seed/` - Seed demo transactions

### Forecasting & Reports

- `POST /api/orgs/{org_id}/forecast/` - Generate/refresh forecast
- `GET /api/orgs/{org_id}/forecast/` - Get latest forecast
- `GET /api/orgs/{org_id}/reports/` - List generated reports
- `POST /api/orgs/{org_id}/reports/generate/` - Generate new report

### Anomalies

- `GET /api/orgs/{org_id}/anomalies/` - List anomalies
- `POST /api/orgs/{org_id}/anomalies/{id}/resolve/` - Mark anomaly as resolved

### Billing

- `POST /api/billing/create_checkout_session/` - Create Stripe checkout session
- `POST /api/billing/webhook/` - Stripe webhook handler
- `GET /api/billing/subscription/` - Get current subscription

Full API documentation available at `http://localhost:8000/api/docs/` when running locally.

## Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
# Run full integration test suite
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## Deployment

### Production Deployment

1. **Backend**: Deploy to Render/Heroku or any Django-compatible host
2. **Frontend**: Deploy to Vercel or similar
3. **ML Service**: Deploy as separate container or service
4. **Database**: Use managed PostgreSQL (AWS RDS, Render, etc.)
5. **Redis**: Use managed Redis (Upstash, Redis Cloud, etc.)

See `DEPLOYMENT.md` for detailed deployment instructions.

## Acceptance Criteria

- [x] User can register, create org, and sign in
- [x] User can connect Plaid sandbox account and see transactions
- [x] Transactions are auto-classified with editable manual override
- [x] Working 90-day forecast displays runway days
- [x] Anomalies are detected and listed in Alerts
- [x] GPT Weekly Report can be generated and displays summary
- [x] Billing flow integrates with Stripe (test mode)
- [x] All major flows have basic tests
- [x] Runs in docker-compose locally

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

