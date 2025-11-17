"""Admin for Health Score"""
from django.contrib import admin
from .models import HealthScore, Benchmark, HealthRecommendation

@admin.register(HealthScore)
class HealthScoreAdmin(admin.ModelAdmin):
    list_display = ['organization', 'overall_score', 'liquidity_score', 'profitability_score', 'calculated_at']

@admin.register(Benchmark)
class BenchmarkAdmin(admin.ModelAdmin):
    list_display = ['industry', 'company_size', 'avg_profit_margin', 'data_year']

@admin.register(HealthRecommendation)
class HealthRecommendationAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'priority']

