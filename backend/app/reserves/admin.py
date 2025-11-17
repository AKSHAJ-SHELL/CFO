"""Admin for Reserves"""
from django.contrib import admin
from .models import ReserveGoal, SavingsAccount, AutoTransfer

@admin.register(ReserveGoal)
class ReserveGoalAdmin(admin.ModelAdmin):
    list_display = ['name', 'goal_type', 'target_amount', 'current_amount', 'auto_transfer_enabled']

@admin.register(SavingsAccount)
class SavingsAccountAdmin(admin.ModelAdmin):
    list_display = ['account_name', 'bank_name', 'current_balance', 'interest_rate', 'is_primary']

@admin.register(AutoTransfer)
class AutoTransferAdmin(admin.ModelAdmin):
    list_display = ['reserve_goal', 'amount', 'scheduled_date', 'status']

