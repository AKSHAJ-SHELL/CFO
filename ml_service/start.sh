#!/bin/bash
set -e

echo "🚀 Starting FinPilot ML Service..."

# Check for synthetic data
if [ ! -f "app/data/synthetic/transactions.csv" ]; then
  echo "📊 Generating synthetic data..."
  python -m app.data.generate_synthetic
fi

# Check for trained models
if [ ! -f "models/expense_classifier.pt" ]; then
  echo "📚 Training ExpenseClassifier..."
  python -m app.training.train_classifier
fi

if [ ! -f "models/report_generator.pt" ]; then
  echo "🧾 Training ReportGenerator..."
  python -m app.training.train_reportgen
fi

echo "✅ Starting FastAPI inference server..."
uvicorn app.main:app --host 0.0.0.0 --port 8080

