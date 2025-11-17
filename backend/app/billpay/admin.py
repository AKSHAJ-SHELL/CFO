"""
Django admin for Bill Pay
"""
from django.contrib import admin
from .models import Vendor, Bill, BillLineItem, ApprovalWorkflow, ApprovalRule, ApprovalRequest, RecurringSchedule, PaymentBatch, BillPayment, BillAuditLog


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'category', 'preferred_payment_method', 'total_paid', 'is_active']
    list_filter = ['is_active', 'preferred_payment_method', 'category']
    search_fields = ['name', 'company_name', 'email']


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ['bill_number', 'vendor', 'bill_date', 'due_date', 'total_amount', 'status']
    list_filter = ['status', 'capture_method', 'is_recurring']
    search_fields = ['bill_number', 'vendor__name']


@admin.register(ApprovalWorkflow)
class ApprovalWorkflowAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'is_default', 'is_active']
    list_filter = ['is_default', 'is_active']


@admin.register(ApprovalRequest)
class ApprovalRequestAdmin(admin.ModelAdmin):
    list_display = ['bill', 'approver', 'sequence', 'status', 'created_at']
    list_filter = ['status']


@admin.register(RecurringSchedule)
class RecurringScheduleAdmin(admin.ModelAdmin):
    list_display = ['name', 'vendor', 'frequency', 'expected_amount', 'is_active']
    list_filter = ['frequency', 'is_active']


@admin.register(PaymentBatch)
class PaymentBatchAdmin(admin.ModelAdmin):
    list_display = ['name', 'batch_date', 'total_bills', 'total_amount', 'status']
    list_filter = ['status']


@admin.register(BillPayment)
class BillPaymentAdmin(admin.ModelAdmin):
    list_display = ['bill', 'amount', 'payment_date', 'payment_method', 'status']
    list_filter = ['status', 'payment_method']

