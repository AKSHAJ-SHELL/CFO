"""Admin for Profitability"""
from django.contrib import admin
from .models import Product, Project, CustomerProfitability, ProductProfitability, TimeEntry, CostAllocation, LTVPrediction

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'base_price', 'total_revenue', 'gross_margin_percent', 'is_active']

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'client_name', 'status', 'actual_revenue', 'actual_cost']

@admin.register(CustomerProfitability)
class CustomerProfitabilityAdmin(admin.ModelAdmin):
    list_display = ['customer_name', 'total_revenue', 'net_profit', 'profit_margin_percent']

@admin.register(TimeEntry)
class TimeEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'hours', 'project', 'total_cost']

