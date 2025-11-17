"""
Integration tests for Invoice Management (Feature 1)
"""
import pytest
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from app.users.models import Organization
from app.invoices.models import Customer, Invoice
from decimal import Decimal

User = get_user_model()

class InvoiceIntegrationTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            name='Test User'
        )
        self.org = Organization.objects.create(
            owner=self.user,
            name='Test Org'
        )
        self.customer = Customer.objects.create(
            organization=self.org,
            name='Test Customer',
            email='customer@test.com'
        )
    
    def test_create_invoice(self):
        """Test invoice creation via API"""
        self.client.force_login(self.user)
        response = self.client.post(f'/api/orgs/{self.org.id}/invoices/invoices/', {
            'customer': str(self.customer.id),
            'invoice_number': 'INV-001',
            'issue_date': '2024-01-01',
            'due_date': '2024-01-31',
            'subtotal': 1000,
            'total_amount': 1000,
        })
        self.assertEqual(response.status_code, 201)
    
    def test_ar_aging_report(self):
        """Test AR aging report generation"""
        self.client.force_login(self.user)
        response = self.client.get(f'/api/orgs/{self.org.id}/invoices/ar-aging/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('aging_buckets', response.json())

# Add more tests...

