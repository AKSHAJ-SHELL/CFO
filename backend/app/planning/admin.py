"""
Django admin for Scenario Planning & Budgets
"""
from django.contrib import admin
from .models import (
    Scenario, ScenarioAdjustment, ScenarioResult,
    Budget, BudgetLineItem, Goal
)


@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'scenario_type', 'forecast_months', 'is_active', 'created_at']
    list_filter = ['scenario_type', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'organization__name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_simulated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'organization', 'name', 'description', 'scenario_type')
        }),
        ('Period Settings', {
            'fields': ('base_year', 'base_month', 'forecast_months')
        }),
        ('Status', {
            'fields': ('is_active', 'version', 'last_simulated_at')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(ScenarioAdjustment)
class ScenarioAdjustmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'scenario', 'adjustment_type', 'change_type', 'value', 'start_month']
    list_filter = ['adjustment_type', 'change_type']
    search_fields = ['name', 'description', 'scenario__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(ScenarioResult)
class ScenarioResultAdmin(admin.ModelAdmin):
    list_display = ['scenario', 'total_revenue', 'total_expenses', 'total_profit', 'profit_margin', 'simulated_at']
    list_filter = ['simulated_at']
    search_fields = ['scenario__name']
    readonly_fields = ['id', 'simulated_at']


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'budget_type', 'start_date', 'end_date', 'total_amount', 'is_active', 'is_approved']
    list_filter = ['budget_type', 'period_type', 'is_active', 'is_approved']
    search_fields = ['name', 'description', 'organization__name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'approved_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'organization', 'name', 'description')
        }),
        ('Budget Settings', {
            'fields': ('budget_type', 'period_type', 'start_date', 'end_date', 'total_amount')
        }),
        ('Approval', {
            'fields': ('is_approved', 'approved_by', 'approved_at')
        }),
        ('Alerts', {
            'fields': ('alert_at_50_percent', 'alert_at_75_percent', 'alert_at_90_percent', 'alert_at_100_percent')
        }),
        ('Metadata', {
            'fields': ('is_active', 'created_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(BudgetLineItem)
class BudgetLineItemAdmin(admin.ModelAdmin):
    list_display = ['category_name', 'budget', 'department', 'budgeted_amount', 'actual_amount', 'variance_amount', 'variance_percent']
    list_filter = ['budget__budget_type', 'department']
    search_fields = ['category_name', 'department', 'budget__name']
    readonly_fields = ['id', 'actual_amount', 'variance_amount', 'variance_percent', 'created_at', 'updated_at']


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'goal_type', 'target_value', 'current_value', 'progress_percent', 'status', 'target_date']
    list_filter = ['goal_type', 'status', 'is_active']
    search_fields = ['name', 'description', 'organization__name']
    readonly_fields = ['id', 'progress_percent', 'status', 'last_updated_at', 'created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'organization', 'name', 'description', 'goal_type')
        }),
        ('Target & Progress', {
            'fields': ('target_value', 'current_value', 'progress_percent', 'status')
        }),
        ('Timeline', {
            'fields': ('start_date', 'target_date', 'last_updated_at')
        }),
        ('Ownership', {
            'fields': ('owner', 'created_by')
        }),
        ('Metadata', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )

