"""
Create demo invoice data for testing
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date
from decimal import Decimal
import random

from app.users.models import User, Organization
from app.invoices.models import (
    Customer, Invoice, InvoiceLineItem, Payment, 
    InvoiceCommunication, PaymentPrediction, ReminderSchedule
)


class Command(BaseCommand):
    help = 'Create demo invoice data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating demo data...')
        
        # Create or get demo user
        user, created = User.objects.get_or_create(
            email='demo@finpilot.com',
            defaults={
                'name': 'Demo User',
                'is_active': True,
            }
        )
        if created:
            user.set_password('demo123')
            user.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created demo user: demo@finpilot.com / demo123'))
        else:
            self.stdout.write('✓ Demo user already exists')
        
        # Create or get demo organization
        org, created = Organization.objects.get_or_create(
            owner=user,
            defaults={
                'name': 'Demo Company Inc.',
                'currency': 'USD',
                'timezone': 'America/Los_Angeles'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created organization: {org.name}'))
        else:
            self.stdout.write(f'✓ Organization already exists: {org.name}')
        
        # Create reminder schedule
        schedule, created = ReminderSchedule.objects.get_or_create(
            organization=org,
            defaults={
                'send_before_due_days': 3,
                'send_on_due_date': True,
                'send_after_due_days': [3, 7, 14],
                'use_email': True,
                'tone': 'professional',
                'is_active': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created reminder schedule'))
        
        # Create demo customers
        customers_data = [
            {
                'name': 'Acme Corporation',
                'email': 'billing@acme.com',
                'company': 'Acme Corp',
                'payment_reliability_score': Decimal('95.00'),
                'average_days_to_pay': 25,
            },
            {
                'name': 'TechStart Inc',
                'email': 'finance@techstart.io',
                'company': 'TechStart Inc',
                'payment_reliability_score': Decimal('78.50'),
                'average_days_to_pay': 35,
            },
            {
                'name': 'Creative Studios',
                'email': 'accounts@creativestudios.com',
                'company': 'Creative Studios LLC',
                'payment_reliability_score': Decimal('65.00'),
                'average_days_to_pay': 45,
            },
            {
                'name': 'Global Ventures',
                'email': 'ap@globalventures.com',
                'company': 'Global Ventures Ltd',
                'payment_reliability_score': Decimal('88.00'),
                'average_days_to_pay': 28,
            },
            {
                'name': 'Startup Labs',
                'email': 'billing@startuplabs.co',
                'company': 'Startup Labs',
                'payment_reliability_score': Decimal('50.00'),
                'average_days_to_pay': 60,
            },
        ]
        
        customers = []
        for data in customers_data:
            customer, created = Customer.objects.get_or_create(
                organization=org,
                email=data['email'],
                defaults=data
            )
            customers.append(customer)
            if created:
                self.stdout.write(f'✓ Created customer: {customer.name}')
        
        self.stdout.write(self.style.SUCCESS(f'✓ Total customers: {len(customers)}'))
        
        # Create demo invoices
        invoice_statuses = ['paid', 'sent', 'viewed', 'overdue', 'partial']
        service_descriptions = [
            'Consulting Services',
            'Web Development',
            'Marketing Campaign',
            'Design Services',
            'Technical Support',
            'Software License',
            'Training Session',
            'Data Analysis',
        ]
        
        invoices_created = 0
        for i in range(20):
            customer = random.choice(customers)
            status = random.choice(invoice_statuses)
            
            # Create invoice dates
            issue_date = date.today() - timedelta(days=random.randint(1, 90))
            due_date = issue_date + timedelta(days=30)
            
            # Calculate amounts
            subtotal = Decimal(str(random.randint(500, 5000)))
            tax_rate = Decimal('8.5')
            tax_amount = subtotal * (tax_rate / Decimal('100'))
            total_amount = subtotal + tax_amount
            
            # Create invoice
            invoice = Invoice.objects.create(
                organization=org,
                customer=customer,
                invoice_number=f'INV-{1000 + i}',
                issue_date=issue_date,
                due_date=due_date,
                subtotal=subtotal,
                tax_rate=tax_rate,
                tax_amount=tax_amount,
                total_amount=total_amount,
                status=status,
                payment_terms='Net 30',
                created_by=user,
            )
            
            # Create line items
            num_items = random.randint(1, 3)
            remaining_amount = subtotal
            for j in range(num_items):
                if j == num_items - 1:
                    # Last item gets remaining amount
                    item_amount = remaining_amount
                else:
                    item_amount = Decimal(str(random.randint(100, int(remaining_amount) - 100)))
                    remaining_amount -= item_amount
                
                quantity = Decimal(str(random.randint(1, 10)))
                unit_price = item_amount / quantity
                
                InvoiceLineItem.objects.create(
                    invoice=invoice,
                    description=random.choice(service_descriptions),
                    quantity=quantity,
                    unit_price=unit_price,
                    amount=item_amount,
                    sort_order=j
                )
            
            # Add payments for paid/partial invoices
            if status in ['paid', 'partial']:
                payment_amount = total_amount if status == 'paid' else total_amount * Decimal('0.5')
                invoice.amount_paid = payment_amount
                invoice.paid_at = timezone.now() if status == 'paid' else None
                invoice.save()
                
                Payment.objects.create(
                    invoice=invoice,
                    amount=payment_amount,
                    payment_method='card',
                    payment_date=timezone.now(),
                    status='succeeded',
                )
            
            # Add communications
            if status in ['sent', 'viewed', 'overdue']:
                InvoiceCommunication.objects.create(
                    invoice=invoice,
                    communication_type='sent',
                    channel='email',
                    subject=f'Invoice {invoice.invoice_number}',
                    message_body=f'Your invoice for ${total_amount}',
                    sent_at=timezone.now() - timedelta(days=random.randint(1, 30)),
                )
            
            # Add payment predictions
            predicted_days = customer.average_days_to_pay if customer.average_days_to_pay else 30
            risk_level = 'high' if customer.payment_reliability_score < 60 else ('medium' if customer.payment_reliability_score < 80 else 'low')
            
            PaymentPrediction.objects.create(
                invoice=invoice,
                predicted_payment_date=issue_date + timedelta(days=predicted_days),
                confidence_score=Decimal('0.85'),
                risk_level=risk_level,
                model_version='1.0-demo',
                factors={
                    'customer_reliability': float(customer.payment_reliability_score),
                    'amount': float(total_amount)
                }
            )
            
            invoices_created += 1
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {invoices_created} demo invoices'))
        
        # Print summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('DEMO DATA CREATED SUCCESSFULLY!'))
        self.stdout.write('='*60)
        self.stdout.write(f'\n📊 Summary:')
        self.stdout.write(f'  - Demo User: demo@finpilot.com / demo123')
        self.stdout.write(f'  - Organization: {org.name} (ID: {org.id})')
        self.stdout.write(f'  - Customers: {len(customers)}')
        self.stdout.write(f'  - Invoices: {invoices_created}')
        self.stdout.write(f'\n🌐 Access URLs:')
        self.stdout.write(f'  - Admin: http://localhost:8000/admin/')
        self.stdout.write(f'  - Customers: http://localhost:8000/api/orgs/{org.id}/invoices/customers/')
        self.stdout.write(f'  - Invoices: http://localhost:8000/api/orgs/{org.id}/invoices/invoices/')
        self.stdout.write(f'  - AR Aging: http://localhost:8000/api/orgs/{org.id}/invoices/ar-aging/')
        self.stdout.write('\n✅ You can now login to Django admin with: demo@finpilot.com / demo123')
        self.stdout.write('='*60 + '\n')

