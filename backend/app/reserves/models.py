"""Models for Cash Reserves"""
import uuid
from django.db import models
from decimal import Decimal
from app.users.models import Organization

class ReserveGoal(models.Model):
    """Cash reserve goals"""
    GOAL_TYPE_CHOICES = [
        ('emergency', 'Emergency Fund'),
        ('tax', 'Tax Reserve'),
        ('seasonal', 'Seasonal Buffer'),
        ('custom', 'Custom Goal'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='reserve_goals')
    
    name = models.CharField(max_length=200)
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPE_CHOICES)
    target_amount = models.DecimalField(max_digits=15, decimal_places=2)
    current_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Auto-funding
    auto_transfer_enabled = models.BooleanField(default=False)
    monthly_contribution = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reserves_goal'
    
    def __str__(self):
        return f"{self.name} - ${self.target_amount}"

class SavingsAccount(models.Model):
    """Linked savings accounts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='savings_accounts')
    
    account_name = models.CharField(max_length=200)
    account_number_last4 = models.CharField(max_length=4)
    bank_name = models.CharField(max_length=200)
    
    current_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    plaid_account_id = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reserves_savings_account'
    
    def __str__(self):
        return f"{self.account_name} - {self.bank_name}"

class AutoTransfer(models.Model):
    """Automated transfer records"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reserve_goal = models.ForeignKey(ReserveGoal, on_delete=models.CASCADE, related_name='auto_transfers')
    savings_account = models.ForeignKey(SavingsAccount, on_delete=models.CASCADE, related_name='transfers')
    
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    scheduled_date = models.DateField()
    executed_date = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=200, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reserves_auto_transfer'
        ordering = ['-scheduled_date']
    
    def __str__(self):
        return f"${self.amount} to {self.reserve_goal.name}"

