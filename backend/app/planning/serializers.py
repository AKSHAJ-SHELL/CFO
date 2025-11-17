"""
Serializers for Scenario Planning & Budget Simulator
"""
from rest_framework import serializers
from .models import (
    Scenario, ScenarioAdjustment, ScenarioResult,
    Budget, BudgetLineItem, Goal
)


class ScenarioAdjustmentSerializer(serializers.ModelSerializer):
    """Serializer for scenario adjustments"""
    
    class Meta:
        model = ScenarioAdjustment
        fields = [
            'id', 'name', 'adjustment_type', 'change_type',
            'value', 'category', 'start_month', 'end_month',
            'description', 'assumptions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ScenarioResultSerializer(serializers.ModelSerializer):
    """Serializer for scenario results"""
    
    class Meta:
        model = ScenarioResult
        fields = [
            'id', 'month_labels', 'monthly_revenue', 'monthly_expenses',
            'monthly_profit', 'monthly_cash_balance', 'total_revenue',
            'total_expenses', 'total_profit', 'profit_margin',
            'ending_cash', 'lowest_cash', 'runway_days',
            'break_even_month', 'break_even_revenue',
            'simulated_at', 'confidence_level'
        ]
        read_only_fields = fields


class ScenarioSerializer(serializers.ModelSerializer):
    """Serializer for scenarios"""
    adjustments = ScenarioAdjustmentSerializer(many=True, read_only=True)
    latest_result = serializers.SerializerMethodField()
    
    class Meta:
        model = Scenario
        fields = [
            'id', 'name', 'description', 'scenario_type',
            'base_year', 'base_month', 'forecast_months',
            'is_active', 'last_simulated_at', 'version',
            'created_by', 'created_at', 'updated_at',
            'adjustments', 'latest_result'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_simulated_at', 'version']
    
    def get_latest_result(self, obj):
        latest = obj.results.first()
        if latest:
            return ScenarioResultSerializer(latest).data
        return None


class BudgetLineItemSerializer(serializers.ModelSerializer):
    """Serializer for budget line items"""
    utilization_percent = serializers.SerializerMethodField()
    
    class Meta:
        model = BudgetLineItem
        fields = [
            'id', 'category_name', 'department', 'budgeted_amount',
            'actual_amount', 'variance_amount', 'variance_percent',
            'utilization_percent', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'actual_amount', 'variance_amount', 'variance_percent', 'created_at', 'updated_at']
    
    def get_utilization_percent(self, obj):
        if obj.budgeted_amount > 0:
            return round((obj.actual_amount / obj.budgeted_amount) * 100, 2)
        return 0


class BudgetSerializer(serializers.ModelSerializer):
    """Serializer for budgets"""
    line_items = BudgetLineItemSerializer(many=True, read_only=True)
    total_actual = serializers.SerializerMethodField()
    total_variance = serializers.SerializerMethodField()
    utilization_percent = serializers.SerializerMethodField()
    
    class Meta:
        model = Budget
        fields = [
            'id', 'name', 'description', 'budget_type', 'period_type',
            'start_date', 'end_date', 'total_amount', 'is_active',
            'is_approved', 'approved_by', 'approved_at',
            'alert_at_50_percent', 'alert_at_75_percent',
            'alert_at_90_percent', 'alert_at_100_percent',
            'created_by', 'created_at', 'updated_at',
            'line_items', 'total_actual', 'total_variance', 'utilization_percent'
        ]
        read_only_fields = ['id', 'is_approved', 'approved_by', 'approved_at', 'created_at', 'updated_at']
    
    def get_total_actual(self, obj):
        return sum(item.actual_amount for item in obj.line_items.all())
    
    def get_total_variance(self, obj):
        total_actual = self.get_total_actual(obj)
        return total_actual - obj.total_amount
    
    def get_utilization_percent(self, obj):
        total_actual = self.get_total_actual(obj)
        if obj.total_amount > 0:
            return round((total_actual / obj.total_amount) * 100, 2)
        return 0


class GoalSerializer(serializers.ModelSerializer):
    """Serializer for goals"""
    days_remaining = serializers.SerializerMethodField()
    required_monthly_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Goal
        fields = [
            'id', 'name', 'description', 'goal_type',
            'target_value', 'current_value', 'progress_percent',
            'status', 'start_date', 'target_date', 'is_active',
            'last_updated_at', 'owner', 'created_by',
            'created_at', 'updated_at', 'days_remaining',
            'required_monthly_progress'
        ]
        read_only_fields = ['id', 'progress_percent', 'status', 'last_updated_at', 'created_at', 'updated_at']
    
    def get_days_remaining(self, obj):
        from datetime import date
        delta = obj.target_date - date.today()
        return max(delta.days, 0)
    
    def get_required_monthly_progress(self, obj):
        days_remaining = self.get_days_remaining(obj)
        if days_remaining > 0:
            remaining_value = obj.target_value - obj.current_value
            months_remaining = days_remaining / 30
            if months_remaining > 0:
                return round(remaining_value / months_remaining, 2)
        return 0


class ScenarioComparisonSerializer(serializers.Serializer):
    """Serializer for comparing multiple scenarios"""
    scenario_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=2,
        max_length=5
    )

