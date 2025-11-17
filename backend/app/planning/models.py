"""
Database models for Scenario Planning & Budget Simulator
Feature 3
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from app.users.models import Organization, User


class Scenario(models.Model):
    """Financial scenario for what-if analysis"""
    
    SCENARIO_TYPE_CHOICES = [
        ('best', 'Best Case'),
        ('expected', 'Expected'),
        ('worst', 'Worst Case'),
        ('custom', 'Custom'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='scenarios')
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    scenario_type = models.CharField(max_length=20, choices=SCENARIO_TYPE_CHOICES, default='custom')
    
    # Base period for comparison
    base_year = models.IntegerField()
    base_month = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    
    # Forecast period
    forecast_months = models.IntegerField(default=12, validators=[MinValueValidator(1), MaxValueValidator(36)])
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_scenarios')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Tracking
    is_active = models.BooleanField(default=True)
    last_simulated_at = models.DateTimeField(null=True, blank=True)
    version = models.IntegerField(default=1)
    
    class Meta:
        db_table = 'planning_scenario'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'is_active']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.organization.name})"


class ScenarioAdjustment(models.Model):
    """Revenue or expense adjustments for a scenario"""
    
    ADJUSTMENT_TYPE_CHOICES = [
        ('revenue', 'Revenue'),
        ('expense', 'Expense'),
        ('one_time', 'One-Time Event'),
    ]
    
    CHANGE_TYPE_CHOICES = [
        ('percentage', 'Percentage Change'),
        ('absolute', 'Absolute Amount'),
        ('growth_rate', 'Monthly Growth Rate'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE, related_name='adjustments')
    
    # Adjustment details
    name = models.CharField(max_length=200)
    adjustment_type = models.CharField(max_length=20, choices=ADJUSTMENT_TYPE_CHOICES)
    change_type = models.CharField(max_length=20, choices=CHANGE_TYPE_CHOICES)
    
    # Values
    value = models.DecimalField(max_digits=15, decimal_places=2)  # Amount or percentage
    category = models.CharField(max_length=100, blank=True)  # Which expense/revenue category
    
    # Timing
    start_month = models.IntegerField(validators=[MinValueValidator(1)])  # Month 1 = first month of forecast
    end_month = models.IntegerField(null=True, blank=True)  # null = ongoing
    
    # Notes
    description = models.TextField(blank=True)
    assumptions = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'planning_scenario_adjustment'
        ordering = ['start_month', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.scenario.name})"


class ScenarioResult(models.Model):
    """Cached simulation results for a scenario"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE, related_name='results')
    
    # Monthly results (stored as JSON arrays)
    month_labels = models.JSONField(default=list)  # ["Jan 2024", "Feb 2024", ...]
    monthly_revenue = models.JSONField(default=list)  # [10000, 11000, ...]
    monthly_expenses = models.JSONField(default=list)
    monthly_profit = models.JSONField(default=list)
    monthly_cash_balance = models.JSONField(default=list)
    
    # Summary metrics
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_expenses = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    profit_margin = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # Percentage
    
    # Cash metrics
    ending_cash = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    lowest_cash = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    runway_days = models.IntegerField(null=True, blank=True)
    
    # Break-even analysis
    break_even_month = models.IntegerField(null=True, blank=True)
    break_even_revenue = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Simulation metadata
    simulated_at = models.DateTimeField(auto_now=True)
    confidence_level = models.DecimalField(max_digits=5, decimal_places=2, default=75)  # AI confidence
    
    class Meta:
        db_table = 'planning_scenario_result'
        ordering = ['-simulated_at']
    
    def __str__(self):
        return f"Results for {self.scenario.name}"


class Budget(models.Model):
    """Budget definitions"""
    
    BUDGET_TYPE_CHOICES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('annual', 'Annual'),
    ]
    
    PERIOD_TYPE_CHOICES = [
        ('static', 'Static'),  # Fixed for the period
        ('rolling', 'Rolling'),  # Updates monthly
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='budgets')
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    budget_type = models.CharField(max_length=20, choices=BUDGET_TYPE_CHOICES, default='monthly')
    period_type = models.CharField(max_length=20, choices=PERIOD_TYPE_CHOICES, default='static')
    
    # Period
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Total budget amount
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_budgets')
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Tracking
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_budgets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Alert thresholds
    alert_at_50_percent = models.BooleanField(default=True)
    alert_at_75_percent = models.BooleanField(default=True)
    alert_at_90_percent = models.BooleanField(default=True)
    alert_at_100_percent = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'planning_budget'
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['organization', 'is_active']),
            models.Index(fields=['start_date', 'end_date']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.start_date} to {self.end_date})"


class BudgetLineItem(models.Model):
    """Category-level budget allocations"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name='line_items')
    
    # Category info
    category_name = models.CharField(max_length=100)
    department = models.CharField(max_length=100, blank=True)  # Optional department
    
    # Budget allocation
    budgeted_amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    # Actual tracking (calculated from transactions)
    actual_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    variance_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    variance_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Alerts
    alert_sent_50 = models.BooleanField(default=False)
    alert_sent_75 = models.BooleanField(default=False)
    alert_sent_90 = models.BooleanField(default=False)
    alert_sent_100 = models.BooleanField(default=False)
    
    # Notes
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'planning_budget_line_item'
        ordering = ['category_name']
        unique_together = ['budget', 'category_name', 'department']
    
    def __str__(self):
        return f"{self.category_name} - {self.budget.name}"
    
    def update_actuals(self, actual_amount):
        """Update actual amount and calculate variance"""
        self.actual_amount = actual_amount
        self.variance_amount = self.actual_amount - self.budgeted_amount
        if self.budgeted_amount > 0:
            self.variance_percent = (self.variance_amount / self.budgeted_amount) * 100
        self.save()


class Goal(models.Model):
    """Financial goals tracking"""
    
    GOAL_TYPE_CHOICES = [
        ('revenue', 'Revenue Target'),
        ('profit', 'Profit Target'),
        ('margin', 'Profit Margin %'),
        ('runway', 'Minimum Runway Days'),
        ('cash', 'Cash Reserve Target'),
        ('growth', 'Growth Rate %'),
        ('custom', 'Custom Metric'),
    ]
    
    STATUS_CHOICES = [
        ('on_track', 'On Track'),
        ('at_risk', 'At Risk'),
        ('off_track', 'Off Track'),
        ('achieved', 'Achieved'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='goals')
    
    # Goal details
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPE_CHOICES)
    
    # Target
    target_value = models.DecimalField(max_digits=15, decimal_places=2)
    current_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Period
    start_date = models.DateField()
    target_date = models.DateField()
    
    # Progress
    progress_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='on_track')
    
    # Tracking
    is_active = models.BooleanField(default=True)
    last_updated_at = models.DateTimeField(null=True, blank=True)
    
    # Owner
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='owned_goals')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_goals')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'planning_goal'
        ordering = ['target_date', '-created_at']
        indexes = [
            models.Index(fields=['organization', 'is_active']),
            models.Index(fields=['target_date']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.target_value}"
    
    def update_progress(self, current_value):
        """Update goal progress and status"""
        self.current_value = current_value
        if self.target_value > 0:
            self.progress_percent = min((self.current_value / self.target_value) * 100, 100)
        
        # Update status
        if self.progress_percent >= 100:
            self.status = 'achieved'
        elif self.progress_percent >= 80:
            self.status = 'on_track'
        elif self.progress_percent >= 50:
            self.status = 'at_risk'
        else:
            self.status = 'off_track'
        
        from django.utils import timezone
        self.last_updated_at = timezone.now()
        self.save()

