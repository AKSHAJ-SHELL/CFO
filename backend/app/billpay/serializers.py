"""
Serializers for Bill Pay Automation
"""
from rest_framework import serializers
from .models import (
    Vendor, Bill, BillLineItem, ApprovalWorkflow, ApprovalRule,
    ApprovalRequest, RecurringSchedule, PaymentBatch, BillPayment, BillAuditLog
)


class VendorSerializer(serializers.ModelSerializer):
    """Serializer for vendors"""
    spending_last_12_months = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendor
        fields = [
            'id', 'name', 'company_name', 'vendor_number', 'email', 'phone', 'website',
            'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country',
            'preferred_payment_method', 'payment_terms',
            'early_payment_discount_percent', 'early_payment_discount_days',
            'category', 'tax_id', 'w9_on_file', 'is_active', 'is_1099_vendor',
            'total_paid', 'total_bills', 'average_bill_amount', 'on_time_payment_rate',
            'notes', 'tags', 'created_at', 'updated_at', 'spending_last_12_months'
        ]
        read_only_fields = ['id', 'total_paid', 'total_bills', 'average_bill_amount', 'on_time_payment_rate', 'created_at', 'updated_at']
    
    def get_spending_last_12_months(self, obj):
        from datetime import date, timedelta
        from decimal import Decimal
        from django.db.models import Sum
        cutoff = date.today() - timedelta(days=365)
        return float(obj.bills.filter(
            bill_date__gte=cutoff, status='paid'
        ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0'))


class BillLineItemSerializer(serializers.ModelSerializer):
    """Serializer for bill line items"""
    
    class Meta:
        model = BillLineItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'amount', 'category', 'account_code', 'sort_order']
        read_only_fields = ['id']


class BillPaymentSerializer(serializers.ModelSerializer):
    """Serializer for bill payments"""
    
    class Meta:
        model = BillPayment
        fields = [
            'id', 'amount', 'payment_date', 'payment_method', 'status',
            'transaction_id', 'confirmation_number', 'notes', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ApprovalRequestSerializer(serializers.ModelSerializer):
    """Serializer for approval requests"""
    approver_name = serializers.CharField(source='approver.name', read_only=True)
    approver_email = serializers.EmailField(source='approver.email', read_only=True)
    
    class Meta:
        model = ApprovalRequest
        fields = [
            'id', 'approver', 'approver_name', 'approver_email', 'sequence',
            'status', 'decision_date', 'comments', 'escalated_at', 'escalated_to', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class BillSerializer(serializers.ModelSerializer):
    """Serializer for bills"""
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    line_items = BillLineItemSerializer(many=True, read_only=True)
    payments = BillPaymentSerializer(many=True, read_only=True)
    approval_requests = ApprovalRequestSerializer(many=True, read_only=True)
    amount_remaining = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Bill
        fields = [
            'id', 'vendor', 'vendor_name', 'bill_number', 'bill_date', 'due_date',
            'subtotal', 'tax_amount', 'discount_amount', 'total_amount',
            'status', 'amount_paid', 'amount_remaining', 'paid_at',
            'scheduled_payment_date', 'payment_method',
            'capture_method', 'ocr_confidence', 'attachment', 'attachment_url',
            'category', 'department', 'project',
            'is_recurring', 'recurring_schedule', 'requires_approval',
            'description', 'notes', 'tags', 'is_overdue',
            'created_by', 'created_at', 'updated_at',
            'line_items', 'payments', 'approval_requests'
        ]
        read_only_fields = ['id', 'amount_paid', 'paid_at', 'created_at', 'updated_at']
    
    def get_amount_remaining(self, obj):
        return float(obj.amount_remaining())
    
    def get_is_overdue(self, obj):
        return obj.is_overdue()


class ApprovalRuleSerializer(serializers.ModelSerializer):
    """Serializer for approval rules"""
    approver_names = serializers.SerializerMethodField()
    
    class Meta:
        model = ApprovalRule
        fields = [
            'id', 'condition_type', 'condition_value', 'approval_type',
            'approvers', 'approver_names', 'priority', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_approver_names(self, obj):
        return [approver.name for approver in obj.approvers.all()]


class ApprovalWorkflowSerializer(serializers.ModelSerializer):
    """Serializer for approval workflows"""
    rules = ApprovalRuleSerializer(many=True, read_only=True)
    
    class Meta:
        model = ApprovalWorkflow
        fields = [
            'id', 'name', 'description', 'is_default', 'is_active',
            'escalation_hours', 'created_by', 'created_at', 'updated_at', 'rules'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RecurringScheduleSerializer(serializers.ModelSerializer):
    """Serializer for recurring schedules"""
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    
    class Meta:
        model = RecurringSchedule
        fields = [
            'id', 'vendor', 'vendor_name', 'name', 'description', 'frequency',
            'start_date', 'end_date', 'expected_amount', 'amount_tolerance_percent',
            'auto_pay_enabled', 'requires_approval', 'is_active',
            'last_generated_date', 'next_expected_date', 'created_at'
        ]
        read_only_fields = ['id', 'last_generated_date', 'next_expected_date', 'created_at']


class PaymentBatchSerializer(serializers.ModelSerializer):
    """Serializer for payment batches"""
    payments = BillPaymentSerializer(many=True, read_only=True)
    
    class Meta:
        model = PaymentBatch
        fields = [
            'id', 'name', 'batch_date', 'total_bills', 'total_amount',
            'status', 'processed_at', 'processing_results',
            'created_by', 'created_at', 'updated_at', 'payments'
        ]
        read_only_fields = ['id', 'processed_at', 'created_at', 'updated_at']


class BillAuditLogSerializer(serializers.ModelSerializer):
    """Serializer for audit logs"""
    performed_by_name = serializers.CharField(source='performed_by.name', read_only=True)
    
    class Meta:
        model = BillAuditLog
        fields = [
            'id', 'action', 'description', 'changes',
            'performed_by', 'performed_by_name', 'ip_address', 'created_at'
        ]
        read_only_fields = fields

