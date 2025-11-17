"""Models for Financial Health Score"""
import uuid
from django.db import models
from decimal import Decimal
from app.users.models import Organization

class HealthScore(models.Model):
    """Composite financial health score"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='health_scores')
    
    # Overall score (0-100)
    overall_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Component scores
    liquidity_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    profitability_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    efficiency_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    growth_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Metrics used
    current_ratio = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    quick_ratio = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    profit_margin = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    revenue_growth = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    burn_rate = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    runway_days = models.IntegerField(null=True)
    
    # Comparison to benchmarks
    vs_industry_avg = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    percentile_rank = models.IntegerField(null=True)  # 0-100
    
    calculated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'health_score'
        ordering = ['-calculated_at']
    
    def __str__(self):
        return f"{self.organization.name} - Score: {self.overall_score}"

class Benchmark(models.Model):
    """Industry benchmark data"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    industry = models.CharField(max_length=200)
    company_size = models.CharField(max_length=50)  # e.g., "1-10", "11-50"
    region = models.CharField(max_length=100, blank=True)
    
    # Benchmark metrics
    avg_profit_margin = models.DecimalField(max_digits=5, decimal_places=2)
    avg_current_ratio = models.DecimalField(max_digits=10, decimal_places=2)
    avg_revenue_growth = models.DecimalField(max_digits=5, decimal_places=2)
    avg_operating_expense_ratio = models.DecimalField(max_digits=5, decimal_places=2)
    
    data_source = models.CharField(max_length=200)
    data_year = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'health_benchmark'
    
    def __str__(self):
        return f"{self.industry} ({self.company_size})"

class HealthRecommendation(models.Model):
    """AI-generated improvement recommendations"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    health_score = models.ForeignKey(HealthScore, on_delete=models.CASCADE, related_name='recommendations')
    
    category = models.CharField(max_length=100)  # e.g., "Liquidity", "Profitability"
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')])
    
    estimated_impact = models.CharField(max_length=100, blank=True)
    action_items = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'health_recommendation'
    
    def __str__(self):
        return f"{self.title} ({self.priority})"

