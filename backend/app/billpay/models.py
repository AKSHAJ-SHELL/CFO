"""
Database models for Bill Pay Automation
Feature 4
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from app.users.models import Organization, User


class Vendor(models.Model):
    """Vendor/supplier master data"""
    
    PAYMENT_METHOD_CHOICES = [
        ('ach', 'ACH/Bank Transfer'),
        ('card', 'Credit Card'),
        ('check', 'Check'),
        ('wire', 'Wire Transfer'),
        ('paypal', 'PayPal'),
        ('venmo', 'Venmo'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='vendors')
    
    # Basic info
    name = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200, blank=True)
    vendor_number = models.CharField(max_length=50, blank=True)
    
    # Contact
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    
    # Address
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=50, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default='USA')
    
    # Payment info
    preferred_payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='ach')
    payment_terms = models.CharField(max_length=50, blank=True)  # e.g., "Net 30"
    early_payment_discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    early_payment_discount_days = models.IntegerField(default=0)
    
    # Banking details (encrypted in production)
    bank_account_number = models.CharField(max_length=100, blank=True)
    bank_routing_number = models.CharField(max_length=50, blank=True)
    bank_name = models.CharField(max_length=200, blank=True)
    
    # Category & tracking
    category = models.CharField(max_length=100, blank=True)
    tax_id = models.CharField(max_length=50, blank=True)  # EIN/SSN
    w9_on_file = models.BooleanField(default=False)
    w9_upload = models.FileField(upload_to='vendor_documents/', null=True, blank=True)
    
    # Metrics
    total_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_bills = models.IntegerField(default=0)
    average_bill_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    on_time_payment_rate = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_1099_vendor = models.BooleanField(default=False)
    
    # Metadata
    notes = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_vendors')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'billpay_vendor'
        ordering = ['name']
        unique_together = ['organization', 'vendor_number']
        indexes = [
            models.Index(fields=['organization', 'is_active']),
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.organization.name})"


class Bill(models.Model):
    """Bill/invoice received from vendors"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending_approval', 'Pending Approval'),
        ('approved', 'Approved'),
        ('scheduled', 'Scheduled for Payment'),
        ('paid', 'Paid'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
        ('overdue', 'Overdue'),
    ]
    
    CAPTURE_METHOD_CHOICES = [
        ('manual', 'Manual Entry'),
        ('email', 'Email Forwarding'),
        ('ocr', 'OCR Scan'),
        ('api', 'API Integration'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='bills')
    vendor = models.ForeignKey(Vendor, on_delete=models.PROTECT, related_name='bills')
    
    # Bill details
    bill_number = models.CharField(max_length=100)
    bill_date = models.DateField()
    due_date = models.DateField()
    
    # Amounts
    subtotal = models.DecimalField(max_digits=15, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Payment tracking
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')
    amount_paid = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    # Scheduled payment
    scheduled_payment_date = models.DateField(null=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=Vendor.PAYMENT_METHOD_CHOICES, blank=True)
    
    # Capture details
    capture_method = models.CharField(max_length=20, choices=CAPTURE_METHOD_CHOICES, default='manual')
    ocr_confidence = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    ocr_data = models.JSONField(default=dict, blank=True)
    
    # Attachments
    attachment = models.FileField(upload_to='bill_attachments/', null=True, blank=True)
    attachment_url = models.URLField(blank=True)
    
    # Categories & tracking
    category = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    project = models.CharField(max_length=100, blank=True)
    
    # Recurring
    is_recurring = models.BooleanField(default=False)
    recurring_schedule = models.ForeignKey('RecurringSchedule', on_delete=models.SET_NULL, null=True, blank=True, related_name='bills')
    
    # Approval
    requires_approval = models.BooleanField(default=True)
    approval_workflow = models.ForeignKey('ApprovalWorkflow', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Metadata
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_bills')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'billpay_bill'
        ordering = ['-bill_date']
        unique_together = ['organization', 'vendor', 'bill_number']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['due_date']),
            models.Index(fields=['vendor']),
        ]
    
    def __str__(self):
        return f"{self.bill_number} - {self.vendor.name}"
    
    def amount_remaining(self):
        """Calculate remaining amount to be paid"""
        return self.total_amount - self.amount_paid
    
    def is_overdue(self):
        """Check if bill is overdue"""
        from datetime import date
        return self.due_date < date.today() and self.status not in ['paid', 'cancelled']


class BillLineItem(models.Model):
    """Line items for bills"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='line_items')
    
    description = models.CharField(max_length=500)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    category = models.CharField(max_length=100, blank=True)
    account_code = models.CharField(max_length=50, blank=True)
    
    sort_order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'billpay_bill_line_item'
        ordering = ['sort_order', 'id']
    
    def __str__(self):
        return f"{self.description} - ${self.amount}"


class ApprovalWorkflow(models.Model):
    """Approval workflow definitions"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='approval_workflows')
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Workflow type
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Escalation
    escalation_hours = models.IntegerField(default=48)  # Auto-escalate after X hours
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'billpay_approval_workflow'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({'Default' if self.is_default else 'Custom'})"


class ApprovalRule(models.Model):
    """Rules for routing bills to approvers"""
    
    CONDITION_TYPE_CHOICES = [
        ('amount_gt', 'Amount Greater Than'),
        ('amount_lt', 'Amount Less Than'),
        ('category', 'Category Equals'),
        ('vendor', 'Vendor Equals'),
        ('department', 'Department Equals'),
    ]
    
    APPROVAL_TYPE_CHOICES = [
        ('sequential', 'Sequential'),  # One after another
        ('parallel', 'Parallel'),  # All at once
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow = models.ForeignKey(ApprovalWorkflow, on_delete=models.CASCADE, related_name='rules')
    
    # Condition
    condition_type = models.CharField(max_length=30, choices=CONDITION_TYPE_CHOICES)
    condition_value = models.CharField(max_length=200)
    
    # Approvers
    approval_type = models.CharField(max_length=20, choices=APPROVAL_TYPE_CHOICES, default='sequential')
    approvers = models.ManyToManyField(User, related_name='approval_rules')
    
    # Order
    priority = models.IntegerField(default=0)  # Lower number = higher priority
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'billpay_approval_rule'
        ordering = ['priority']
    
    def __str__(self):
        return f"{self.workflow.name} - {self.condition_type}: {self.condition_value}"


class ApprovalRequest(models.Model):
    """Approval request tracking"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('escalated', 'Escalated'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='approval_requests')
    workflow = models.ForeignKey(ApprovalWorkflow, on_delete=models.SET_NULL, null=True)
    
    # Approver info
    approver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='approval_requests')
    sequence = models.IntegerField(default=1)  # Order in approval chain
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Decision
    decision_date = models.DateTimeField(null=True, blank=True)
    comments = models.TextField(blank=True)
    
    # Escalation
    escalated_at = models.DateTimeField(null=True, blank=True)
    escalated_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='escalated_approvals')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'billpay_approval_request'
        ordering = ['sequence', 'created_at']
    
    def __str__(self):
        return f"{self.bill.bill_number} - {self.approver.name} ({self.status})"


class RecurringSchedule(models.Model):
    """Recurring bill schedules"""
    
    FREQUENCY_CHOICES = [
        ('weekly', 'Weekly'),
        ('biweekly', 'Bi-Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('annually', 'Annually'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='recurring_schedules')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='recurring_schedules')
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Schedule
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    # Amount
    expected_amount = models.DecimalField(max_digits=15, decimal_places=2)
    amount_tolerance_percent = models.DecimalField(max_digits=5, decimal_places=2, default=10)  # ±10%
    
    # Auto-pay
    auto_pay_enabled = models.BooleanField(default=False)
    requires_approval = models.BooleanField(default=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    last_generated_date = models.DateField(null=True, blank=True)
    next_expected_date = models.DateField(null=True, blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'billpay_recurring_schedule'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.frequency}"


class PaymentBatch(models.Model):
    """Batch payment processing"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='payment_batches')
    
    name = models.CharField(max_length=200)
    batch_date = models.DateField()
    
    # Totals
    total_bills = models.IntegerField(default=0)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Processing
    processed_at = models.DateTimeField(null=True, blank=True)
    processing_results = models.JSONField(default=dict, blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'billpay_payment_batch'
        ordering = ['-batch_date']
    
    def __str__(self):
        return f"{self.name} - {self.batch_date}"


class BillPayment(models.Model):
    """Payment records for bills"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='payments')
    batch = models.ForeignKey(PaymentBatch, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    
    # Payment details
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=20, choices=Vendor.PAYMENT_METHOD_CHOICES)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # External references
    transaction_id = models.CharField(max_length=200, blank=True)  # From payment processor
    confirmation_number = models.CharField(max_length=200, blank=True)
    
    # Metadata
    notes = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'billpay_payment'
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"{self.bill.bill_number} - ${self.amount}"


class BillAuditLog(models.Model):
    """Complete audit trail for bills"""
    
    ACTION_CHOICES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('submitted', 'Submitted for Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('scheduled', 'Scheduled for Payment'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='audit_logs')
    
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    description = models.TextField()
    
    # Changes
    changes = models.JSONField(default=dict, blank=True)  # Store field changes
    
    # User
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'billpay_audit_log'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.bill.bill_number} - {self.action}"

