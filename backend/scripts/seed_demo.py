"""
Seed script to create demo organizations and transactions
"""
import os
import sys
import django
from datetime import datetime, timedelta
import random
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.core.settings')
django.setup()

from app.users.models import User, Organization
from app.api.models import Transaction
from app.connections.models import AccountConnection


def generate_transactions(org, start_date, end_date):
	"""Generate synthetic transactions for an organization"""
	categories = [
		'Revenue', 'Payroll', 'Rent', 'Utilities', 'Advertising',
		'Software', 'Professional Services', 'Supplies', 'Travel', 'Other'
	]
	
	# Business-specific patterns
	if 'Baker' in org.name:
		# Weekly revenue pattern for bakery
		revenue_amounts = [800, 950, 1200, 1400, 1600, 1800, 2000]
		expense_categories = ['Supplies', 'Payroll', 'Rent', 'Utilities']
		expense_amounts = {'Supplies': (200, 500), 'Payroll': (1500, 2000), 'Rent': (2000, 2000), 'Utilities': (150, 300)}
	elif 'Design' in org.name:
		# Irregular contract-based revenue
		revenue_amounts = [5000, 8000, 12000, 15000]
		expense_categories = ['Software', 'Professional Services', 'Rent', 'Payroll']
		expense_amounts = {'Software': (100, 500), 'Professional Services': (500, 1500), 'Rent': (2500, 2500), 'Payroll': (3000, 5000)}
	else:  # E-commerce
		revenue_amounts = [200, 350, 500, 750, 1000, 1200]
		expense_categories = ['Advertising', 'Software', 'Supplies', 'Payroll']
		expense_amounts = {'Advertising': (300, 800), 'Software': (200, 600), 'Supplies': (400, 1000), 'Payroll': (2000, 3000)}
	
	transactions = []
	current_date = start_date
	
	# Create account connection
	connection = AccountConnection.objects.create(
		org=org,
		provider='plaid',
		name='Demo Bank Account',
		provider_account_id=f'demo_account_{org.id}',
		status='active'
	)
	
	while current_date <= end_date:
		# Add revenue (less frequent for design studio)
		if 'Design' not in org.name or random.random() < 0.3:
			if random.random() < 0.6:  # 60% chance of revenue on business days
				amount = Decimal(str(random.choice(revenue_amounts)))
				tx = Transaction(
					org=org,
					account_connection=connection,
					provider_tx_id=f'rev_{org.id}_{current_date.isoformat()}_{random.randint(1000, 9999)}',
					date=current_date,
					amount=amount,
					currency='USD',
					description=f'Stripe payout - {current_date.strftime("%m/%d")}',
					category='Revenue'
				)
				transactions.append(tx)
		
		# Add expenses
		if random.random() < 0.4:  # 40% chance of expense
			if expense_categories:
				category = random.choice(expense_categories)
				if category in expense_amounts:
					min_amount, max_amount = expense_amounts[category]
					amount = Decimal(str(random.uniform(min_amount, max_amount)))
					
					descriptions = {
						'Payroll': f'Payroll - {current_date.strftime("%b %d")}',
						'Rent': 'Office Rent - Monthly',
						'Utilities': 'Electric & Water',
						'Advertising': 'Google Ads Campaign',
						'Software': 'SaaS Subscription',
						'Professional Services': 'Legal Services',
						'Supplies': 'Business Supplies',
					}
					
					tx = Transaction(
						org=org,
						account_connection=connection,
						provider_tx_id=f'exp_{org.id}_{current_date.isoformat()}_{random.randint(1000, 9999)}',
						date=current_date,
						amount=-amount,  # Negative for expenses
						currency='USD',
						description=descriptions.get(category, f'{category} Expense'),
						category=category
					)
					transactions.append(tx)
		
		# Add one large anomaly transaction
		if current_date == start_date + timedelta(days=60):
			anomaly_amount = Decimal(str(random.uniform(5000, 15000)))
			tx = Transaction(
				org=org,
				account_connection=connection,
				provider_tx_id=f'anom_{org.id}_{current_date.isoformat()}',
				date=current_date,
				amount=-anomaly_amount,
				currency='USD',
				description='Unusual Large Purchase - Review Required',
				category='Other'
			)
			transactions.append(tx)
		
		current_date += timedelta(days=1)
	
	# Bulk create transactions
	Transaction.objects.bulk_create(transactions, batch_size=100)
	print(f'Created {len(transactions)} transactions for {org.name}')


def main():
	"""Main seeding function"""
	print('Starting seed process...')
	
	# Create demo users and organizations
	orgs_data = [
		{
			'user_email': 'baker@example.com',
			'user_name': 'Sarah Baker',
			'org_name': 'Baker & Co'
		},
		{
			'user_email': 'designer@example.com',
			'user_name': 'Alex Designer',
			'org_name': 'Design Studio'
		},
		{
			'user_email': 'shop@example.com',
			'user_name': 'Mike Shop',
			'org_name': 'E-commerce Shop'
		},
	]
	
	for data in orgs_data:
		# Create or get user
		user, created = User.objects.get_or_create(
			email=data['user_email'],
			defaults={
				'name': data['user_name'],
				'plan': 'standard'
			}
		)
		
		if created:
			user.set_password('demo123')
			user.save()
			print(f'Created user: {user.email}')
		
		# Create or get organization
		org, created = Organization.objects.get_or_create(
			owner=user,
			name=data['org_name'],
			defaults={
				'currency': 'USD',
				'timezone': 'America/New_York'
			}
		)
		
		if created:
			print(f'Created organization: {org.name}')
		
		# Generate transactions (last 6 months)
		end_date = datetime.now().date()
		start_date = end_date - timedelta(days=180)
		
		# Check if transactions already exist
		if not Transaction.objects.filter(org=org).exists():
			generate_transactions(org, start_date, end_date)
		else:
			print(f'Transactions already exist for {org.name}, skipping...')
	
	print('Seed process complete!')


if __name__ == '__main__':
	main()

