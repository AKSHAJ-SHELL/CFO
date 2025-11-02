"""
Generate synthetic financial data for training
"""
import os
import pandas as pd
import random
from datetime import datetime, timedelta
from app.config import DATA_DIR

# Categories
CATEGORIES = [
	'Advertising', 'Payroll', 'Rent', 'Software', 'Utilities',
	'Professional Services', 'Supplies', 'Travel', 'Revenue', 'Other'
]

# Common transaction descriptions by category
DESCRIPTIONS = {
	'Advertising': [
		'Google Ads Campaign',
		'Facebook Ads',
		'Marketing Campaign',
		'Ad Spend',
		'Promotional Materials'
	],
	'Payroll': [
		'Payroll Payment',
		'Employee Salary',
		'Wages',
		'Payroll Processing'
	],
	'Rent': [
		'Office Rent',
		'Monthly Rent',
		'Lease Payment',
		'Rent Due'
	],
	'Software': [
		'SaaS Subscription',
		'Software License',
		'Cloud Services',
		'App Store Purchase'
	],
	'Utilities': [
		'Electric Bill',
		'Water Service',
		'Internet Service',
		'Phone Bill'
	],
	'Professional Services': [
		'Legal Services',
		'Accounting Services',
		'Consulting Fee',
		'Professional Fee'
	],
	'Supplies': [
		'Office Supplies',
		'Business Supplies',
		'Inventory Purchase',
		'Material Purchase'
	],
	'Travel': [
		'Business Travel',
		'Hotel Expense',
		'Airfare',
		'Travel Expense'
	],
	'Revenue': [
		'Stripe Payout',
		'Customer Payment',
		'Sales Revenue',
		'Service Revenue'
	],
	'Other': [
		'Miscellaneous Expense',
		'Other Transaction',
		'Unknown Transaction'
	]
}


def generate_transactions(num_samples=10000):
	"""Generate synthetic transactions"""
	transactions = []
	
	for i in range(num_samples):
		category = random.choice(CATEGORIES)
		description = random.choice(DESCRIPTIONS[category])
		
		# Generate realistic amounts by category
		if category == 'Revenue':
			amount = random.uniform(100, 5000)
		elif category == 'Payroll':
			amount = random.uniform(1500, 5000)
		elif category == 'Rent':
			amount = random.uniform(1500, 3500)
		elif category == 'Advertising':
			amount = random.uniform(50, 1000)
		elif category == 'Software':
			amount = random.uniform(10, 500)
		elif category == 'Professional Services':
			amount = random.uniform(200, 2000)
		else:
			amount = random.uniform(20, 500)
		
		date = datetime.now() - timedelta(days=random.randint(0, 365))
		
		transactions.append({
			'description': description,
			'amount': round(amount, 2),
			'category': category,
			'date': date.strftime('%Y-%m-%d')
		})
	
	df = pd.DataFrame(transactions)
	df.to_csv(os.path.join(DATA_DIR, 'transactions.csv'), index=False)
	print(f'Generated {num_samples} transactions')
	return df


def generate_reports(num_samples=2000):
	"""Generate synthetic financial reports with summaries"""
	reports = []
	
	for i in range(num_samples):
		revenue = random.uniform(5000, 50000)
		expenses = random.uniform(4000, 45000)
		net = revenue - expenses
		runway_days = random.randint(30, 180)
		
		# Generate simple summary
		if net > 0:
			sentiment = 'positive'
			summary = f'Strong financial performance with revenue of ${revenue:,.2f} exceeding expenses of ${expenses:,.2f}. Net profit of ${net:,.2f}. Cash runway: {runway_days} days.'
		else:
			sentiment = 'concern'
			summary = f'Revenue of ${revenue:,.2f} below expenses of ${expenses:,.2f}. Net loss of ${abs(net):,.2f}. Cash runway: {runway_days} days. Consider reducing expenses.'
		
		reports.append({
			'revenue': round(revenue, 2),
			'expenses': round(expenses, 2),
			'net': round(net, 2),
			'runway_days': runway_days,
			'summary_text': summary,
			'sentiment': sentiment
		})
	
	df = pd.DataFrame(reports)
	df.to_csv(os.path.join(DATA_DIR, 'reports.csv'), index=False)
	print(f'Generated {num_samples} reports')
	return df


if __name__ == '__main__':
	print('Generating synthetic data...')
	generate_transactions(10000)
	generate_reports(2000)
	print('Done!')

