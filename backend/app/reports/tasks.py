"""
Celery tasks for report generation
"""
from celery import shared_task
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
import requests
from app.api.models import Report, Transaction, Anomaly, Forecast
from app.users.models import Organization


@shared_task
def generate_report_task(org_id, period_start_str, period_end_str):
	"""Generate AI-powered weekly report"""
	org = Organization.objects.filter(id=org_id).first()
	if not org:
		return
	
	period_start = datetime.fromisoformat(period_start_str).date()
	period_end = datetime.fromisoformat(period_end_str).date()
	
	# Get transactions for period
	transactions = Transaction.objects.filter(
		org=org,
		date__gte=period_start,
		date__lte=period_end
	)
	
	# Calculate metrics
	revenue = sum(
		float(tx.amount) for tx in transactions
		if tx.category == 'Revenue'
	)
	expenses = sum(
		float(tx.amount) for tx in transactions
		if tx.category != 'Revenue'
	)
	net = revenue - expenses
	
	# Get anomalies
	anomalies = Anomaly.objects.filter(
		org=org,
		transaction__date__gte=period_start,
		transaction__date__lte=period_end,
		resolved=False
	)
	
	# Get latest forecast
	forecast = Forecast.objects.filter(org=org).first()
	runway_days = forecast.runway_days if forecast else 0
	
	# Get top transactions
	top_transactions = transactions.order_by('-amount')[:10]
	top_tx_list = [
		{
			'description': tx.description[:50],
			'amount': float(tx.amount),
			'category': tx.category,
			'date': tx.date.isoformat()
		}
		for tx in top_transactions
	]
	
	# Build metrics JSON
	metrics = {
		'revenue': revenue,
		'expenses': expenses,
		'net': net,
		'runway_days': runway_days,
		'transaction_count': transactions.count(),
		'anomaly_count': anomalies.count(),
	}
	
	# Generate summary using ML service
	try:
		response = requests.post(
			f'{settings.ML_SERVICE_URL}/generate_report',
			headers={'Authorization': f'Bearer {settings.ML_INTERNAL_TOKEN}'},
			json={
				'org_id': str(org.id),
				'metrics': metrics,
			},
			timeout=30
		)
		
		if response.status_code == 200:
			data = response.json()
			summary = data.get('summary_text', generate_fallback_summary(metrics))
		else:
			summary = generate_fallback_summary(metrics)
	except Exception:
		summary = generate_fallback_summary(metrics)
	
	# Create report
	Report.objects.create(
		org=org,
		period_start=period_start,
		period_end=period_end,
		gpt_summary=summary,
		metrics=metrics
	)


def generate_fallback_summary(metrics):
	"""Fallback summary if ML service unavailable"""
	return f"""
	Weekly Financial Summary:
	
	Revenue: ${metrics['revenue']:,.2f}
	Expenses: ${metrics['expenses']:,.2f}
	Net: ${metrics['net']:,.2f}
	
	Cash runway: {metrics['runway_days']} days
	
	{metrics['anomaly_count']} anomalies detected requiring attention.
	"""

