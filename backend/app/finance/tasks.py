"""
Celery tasks for finance operations
"""
from celery import shared_task
from django.utils import timezone
from django.conf import settings
import requests
from datetime import timedelta
import pandas as pd
import numpy as np
from app.api.models import Transaction, Forecast, Anomaly
from app.users.models import Organization


@shared_task
def classify_transaction_task(transaction_id):
	"""Classify transaction using ML service"""
	transaction = Transaction.objects.filter(id=transaction_id).first()
	if not transaction:
		return
	
	try:
		# Call ML service
		response = requests.post(
			f'{settings.ML_SERVICE_URL}/classify',
			headers={'Authorization': f'Bearer {settings.ML_INTERNAL_TOKEN}'},
			json={
				'transaction_id': str(transaction.id),
				'description': transaction.description,
				'amount': float(transaction.amount),
				'currency': transaction.currency,
			},
			timeout=10
		)
		
		if response.status_code == 200:
			data = response.json()
			transaction.category = data.get('predicted_category', 'Unknown')
			transaction.classified_at = timezone.now()
			transaction.save()
	except Exception as e:
		# Fallback to simple rule-based classification
		transaction.category = classify_transaction_simple(transaction.description)
		transaction.classified_at = timezone.now()
		transaction.save()


def classify_transaction_simple(description):
	"""Simple rule-based classification fallback"""
	description_lower = description.lower()
	
	if any(word in description_lower for word in ['rent', 'lease']):
		return 'Rent'
	elif any(word in description_lower for word in ['payroll', 'salary', 'wage']):
		return 'Payroll'
	elif any(word in description_lower for word in ['ad', 'marketing', 'google ads']):
		return 'Advertising'
	elif any(word in description_lower for word in ['software', 'saas', 'subscription']):
		return 'Software'
	elif any(word in description_lower for word in ['utility', 'electric', 'water', 'gas']):
		return 'Utilities'
	elif any(word in description_lower for word in ['stripe', 'payout', 'revenue']):
		return 'Revenue'
	else:
		return 'Unknown'


@shared_task
def generate_forecast_task(org_id, horizon_days=90):
	"""Generate cashflow forecast"""
	org = Organization.objects.filter(id=org_id).first()
	if not org:
		return
	
	# Get historical transactions
	transactions = Transaction.objects.filter(
		org=org,
		date__gte=timezone.now().date() - timedelta(days=180)
	).order_by('date')
	
	if not transactions.exists():
		return
	
	# Build daily cashflow series
	df = pd.DataFrame([
		{
			'date': tx.date,
			'amount': float(tx.amount) if tx.category != 'Revenue' else -float(tx.amount)
		}
		for tx in transactions
	])
	
	df['date'] = pd.to_datetime(df['date'])
	daily_cashflow = df.groupby('date')['amount'].sum().sort_index()
	
	# Simple forecast: average daily change
	if len(daily_cashflow) > 1:
		daily_change = daily_cashflow.diff().mean()
		current_balance = daily_cashflow.sum()
		
		# Generate forecast points
		forecast_points = []
		predicted_balance = current_balance
		start_date = timezone.now().date()
		
		for i in range(horizon_days):
			predicted_balance += float(daily_change)
			forecast_points.append({
				'date': (start_date + timedelta(days=i)).isoformat(),
				'balance': round(predicted_balance, 2)
			})
		
		# Calculate runway (days until balance < 0)
		runway_days = 0
		for point in forecast_points:
			if point['balance'] > 0:
				runway_days += 1
			else:
				break
		
		# Save forecast
		Forecast.objects.create(
			org=org,
			horizon_days=horizon_days,
			runway_days=runway_days,
			forecast_points=forecast_points
		)


@shared_task
def detect_anomalies_task(org_id):
	"""Detect anomalous transactions"""
	org = Organization.objects.filter(id=org_id).first()
	if not org:
		return
	
	# Get recent transactions
	transactions = Transaction.objects.filter(
		org=org,
		date__gte=timezone.now().date() - timedelta(days=90)
	)
	
	if not transactions.exists():
		return
	
	# Group by category and calculate stats
	category_stats = {}
	for tx in transactions:
		if tx.category not in category_stats:
			category_stats[tx.category] = []
		category_stats[tx.category].append(float(tx.amount))
	
	# Calculate mean and std for each category
	category_means = {cat: np.mean(amounts) for cat, amounts in category_stats.items()}
	category_stds = {cat: np.std(amounts) for cat, amounts in category_stats.items()}
	
	# Detect anomalies (z-score > 3)
	for tx in transactions:
		if tx.category in category_means and category_means[tx.category] > 0:
			z_score = abs((float(tx.amount) - category_means[tx.category]) / category_stds[tx.category])
			
			if z_score > 3:
				# Check if anomaly already exists
				if not Anomaly.objects.filter(transaction=tx, resolved=False).exists():
					Anomaly.objects.create(
						org=org,
						transaction=tx,
						score=z_score,
						reason=f'Amount ({tx.amount}) is {z_score:.2f} standard deviations above mean for {tx.category}'
					)

