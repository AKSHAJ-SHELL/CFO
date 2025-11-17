"""
Database models for Profitability Intelligence
Feature 5
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from app.users.models import Organization, User


class Product(models.Model):
    """Products or services offered"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='products')
    
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    
    # Pricing
    base_price = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    cost_per_unit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Metrics
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_sold = models.IntegerField(default=0)
    gross_margin_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'profitability_product'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Project(models.Model):
    """Projects for service businesses"""
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='projects')
    
    name = models.CharField(max_length=200)
    client_name = models.CharField(max_length=200, blank=True)
    project_code = models.CharField(max_length=50, blank=True)
    
    # Financials
    budgeted_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    actual_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    budgeted_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    actual_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Time tracking
    budgeted_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    actual_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'profitability_project'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.client_name}"


class CustomerProfitability(models.Model):
    """Customer-level profitability analysis"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    
    # Link to invoice customer or use customer name
    customer_id = models.UUIDField(null=True, blank=True)  # Reference to invoices.Customer
    customer_name = models.CharField(max_length=200)
    
    # Revenue
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Costs
    direct_costs = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    labor_costs = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    overhead_allocated = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Profit
    gross_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    net_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    profit_margin_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # LTV
    lifetime_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    predicted_ltv = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    retention_probability = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Period
    period_start = models.DateField()
    period_end = models.DateField()
    
    calculated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'profitability_customer'
        ordering = ['-total_revenue']
        unique_together = ['organization', 'customer_name', 'period_start']
    
    def __str__(self):
        return f"{self.customer_name} - ${self.net_profit}"


class ProductProfitability(models.Model):
    """Product-level profitability analysis"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='profitability_records')
    
    # Units & Revenue
    units_sold = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    average_price = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Costs
    cogs_per_unit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_cogs = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Margins
    gross_profit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    gross_margin_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    contribution_margin = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Period
    period_start = models.DateField()
    period_end = models.DateField()
    
    calculated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'profitability_product_analysis'
        ordering = ['-total_revenue']
    
    def __str__(self):
        return f"{self.product.name} - {self.period_start}"


class TimeEntry(models.Model):
    """Time tracking entries"""
    SOURCE_CHOICES = [
        ('manual', 'Manual Entry'),
        ('toggl', 'Toggl'),
        ('harvest', 'Harvest'),
        ('clockify', 'Clockify'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='time_entries')
    
    # Time details
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='time_entries')
    date = models.DateField()
    hours = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])
    
    # Assignment
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='time_entries')
    task_description = models.CharField(max_length=500, blank=True)
    
    # Cost
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_cost = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Source
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='manual')
    external_id = models.CharField(max_length=200, blank=True)
    
    is_billable = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'profitability_time_entry'
        ordering = ['-date']
    
    def save(self, *args, **kwargs):
        self.total_cost = self.hours * self.hourly_rate
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.name} - {self.hours}h on {self.date}"


class CostAllocation(models.Model):
    """Overhead cost allocation"""
    ALLOCATION_METHOD_CHOICES = [
        ('revenue_based', 'Revenue-Based'),
        ('activity_based', 'Activity-Based'),
        ('equal', 'Equal Distribution'),
        ('custom', 'Custom'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    
    name = models.CharField(max_length=200)
    cost_type = models.CharField(max_length=100)  # e.g., "Rent", "Admin Salaries"
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)
    
    allocation_method = models.CharField(max_length=20, choices=ALLOCATION_METHOD_CHOICES)
    
    period_start = models.DateField()
    period_end = models.DateField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'profitability_cost_allocation'
    
    def __str__(self):
        return f"{self.name} - ${self.total_amount}"


class LTVPrediction(models.Model):
    """Customer Lifetime Value predictions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    
    customer_id = models.UUIDField()
    customer_name = models.CharField(max_length=200)
    
    # Predictions
    predicted_ltv = models.DecimalField(max_digits=15, decimal_places=2)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Components
    predicted_future_revenue = models.DecimalField(max_digits=15, decimal_places=2)
    predicted_retention_months = models.IntegerField()
    churn_probability = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Model info
    model_version = models.CharField(max_length=50)
    features_used = models.JSONField(default=dict)
    
    predicted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'profitability_ltv_prediction'
        ordering = ['-predicted_ltv']
    
    def __str__(self):
        return f"{self.customer_name} - LTV ${self.predicted_ltv}"

