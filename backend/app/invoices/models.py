"""
Invoice Management Models
Feature 1: Smart Invoice Management & Collections Assistant
"""
import uuid
from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, EmailValidator
from django.utils import timezone
from app.users.models import Organization, User


class Customer(models.Model):
    """Customer model for invoice recipients"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='customers'
    )
    name = models.CharField(max_length=255)
    email = models.EmailField(validators=[EmailValidator()])
    phone = models.CharField(max_length=50, blank=True, null=True)
    company = models.CharField(max_length=255, blank=True, null=True)
    billing_address = models.JSONField(default=dict, blank=True)  # {street, city, state, zip, country}
    
    # Payment preferences and analytics
    payment_terms_default = models.CharField(max_length=50, default='Net 30')
    preferred_payment_method = models.CharField(
        max_length=20,
        choices=[
            ('card', 'Credit/Debit Card'),
            ('ach', 'ACH Transfer'),
            ('paypal', 'PayPal'),
            ('other', 'Other')
        ],
        default='card'
    )
    payment_reliability_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    average_days_to_pay = models.IntegerField(default=0)
    total_invoiced = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_paid = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    
    notes = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)  # ['vip', 'slow-payer', etc.]
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'customers'
        ordering = ['name']
        indexes = [
            models.Index(fields=['organization', 'email']),
            models.Index(fields=['organization', 'name']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['organization', 'email'],
                name='unique_customer_email_per_org'
            )
        ]
    
    def __str__(self):
        return f"{self.name} ({self.email})"


class Invoice(models.Model):
    """Invoice model"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('viewed', 'Viewed'),
        ('partial', 'Partially Paid'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='invoices'
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='invoices'
    )
    
    # Invoice numbering
    invoice_number = models.CharField(max_length=50)  # Auto-generated or custom
    
    # Dates
    issue_date = models.DateField()
    due_date = models.DateField()
    
    # Amounts
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    tax_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    amount_paid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    
    # Status and terms
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    payment_terms = models.CharField(max_length=100, default='Net 30')
    
    # Notes and attachments
    notes = models.TextField(blank=True)
    footer_text = models.TextField(blank=True)
    
    # Template and branding
    template_id = models.CharField(max_length=50, default='default')
    
    # Tracking
    sent_at = models.DateTimeField(null=True, blank=True)
    viewed_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    # Payment link
    payment_link_token = models.CharField(max_length=100, unique=True, null=True, blank=True)
    
    # User tracking
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='invoices_created'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'invoices'
        ordering = ['-issue_date', '-created_at']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'customer']),
            models.Index(fields=['organization', 'due_date']),
            models.Index(fields=['payment_link_token']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['organization', 'invoice_number'],
                name='unique_invoice_number_per_org'
            )
        ]
    
    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.customer.name} - ${self.total_amount}"
    
    def is_overdue(self):
        """Check if invoice is overdue"""
        if self.status in ['paid', 'cancelled']:
            return False
        return timezone.now().date() > self.due_date
    
    def amount_remaining(self):
        """Calculate remaining amount to be paid"""
        return self.total_amount - self.amount_paid


class InvoiceLineItem(models.Model):
    """Line items for invoices"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='line_items'
    )
    description = models.TextField()
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    sort_order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'invoice_line_items'
        ordering = ['sort_order', 'id']
    
    def __str__(self):
        return f"{self.description} - {self.quantity} x ${self.unit_price}"


class Payment(models.Model):
    """Payment records for invoices"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('card', 'Credit/Debit Card'),
        ('ach', 'ACH Transfer'),
        ('paypal', 'PayPal'),
        ('check', 'Check'),
        ('cash', 'Cash'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    payment_date = models.DateTimeField(default=timezone.now)
    
    # Stripe integration
    stripe_payment_intent_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    stripe_charge_id = models.CharField(max_length=255, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Additional details
    transaction_reference = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-payment_date']
        indexes = [
            models.Index(fields=['invoice', 'status']),
            models.Index(fields=['stripe_payment_intent_id']),
        ]
    
    def __str__(self):
        return f"Payment ${self.amount} for Invoice {self.invoice.invoice_number}"


class InvoiceCommunication(models.Model):
    """Communication log for invoices (reminders, follow-ups)"""
    COMMUNICATION_TYPE_CHOICES = [
        ('sent', 'Invoice Sent'),
        ('reminder', 'Payment Reminder'),
        ('follow_up', 'Follow-up'),
        ('thank_you', 'Thank You'),
        ('overdue', 'Overdue Notice'),
        ('custom', 'Custom Message'),
    ]
    
    CHANNEL_CHOICES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('in_app', 'In-App Notification'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='communications'
    )
    communication_type = models.CharField(max_length=20, choices=COMMUNICATION_TYPE_CHOICES)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='email')
    
    # Message details
    subject = models.CharField(max_length=255, blank=True)
    message_body = models.TextField()
    
    # Tracking
    sent_at = models.DateTimeField(default=timezone.now)
    opened_at = models.DateTimeField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    # AI-generated flag
    is_ai_generated = models.BooleanField(default=False)
    
    # Tracking IDs for email service
    external_message_id = models.CharField(max_length=255, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'invoice_communications'
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['invoice', 'communication_type']),
            models.Index(fields=['external_message_id']),
        ]
    
    def __str__(self):
        return f"{self.communication_type} for Invoice {self.invoice.invoice_number}"


class PaymentPrediction(models.Model):
    """ML-based payment predictions"""
    RISK_LEVEL_CHOICES = [
        ('low', 'Low Risk'),
        ('medium', 'Medium Risk'),
        ('high', 'High Risk'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='predictions'
    )
    
    # Prediction results
    predicted_payment_date = models.DateField()
    confidence_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    risk_level = models.CharField(max_length=10, choices=RISK_LEVEL_CHOICES)
    
    # Model details
    model_version = models.CharField(max_length=50, default='1.0')
    factors = models.JSONField(default=dict, blank=True)  # Feature importance
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'payment_predictions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['invoice']),
        ]
    
    def __str__(self):
        return f"Prediction for Invoice {self.invoice.invoice_number}: {self.predicted_payment_date}"


class ReminderSchedule(models.Model):
    """Reminder schedule settings"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.OneToOneField(
        Organization,
        on_delete=models.CASCADE,
        related_name='reminder_schedule'
    )
    
    # Schedule settings (days relative to due date)
    send_before_due_days = models.IntegerField(default=3)  # 3 days before due
    send_on_due_date = models.BooleanField(default=True)
    send_after_due_days = models.JSONField(default=list)  # [3, 7, 14] days after due
    
    # Channel preferences
    use_email = models.BooleanField(default=True)
    use_sms = models.BooleanField(default=False)
    
    # Tone settings
    tone = models.CharField(
        max_length=20,
        choices=[
            ('friendly', 'Friendly'),
            ('professional', 'Professional'),
            ('firm', 'Firm'),
        ],
        default='professional'
    )
    
    # Active status
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reminder_schedules'
    
    def __str__(self):
        return f"Reminder Schedule for {self.organization.name}"

