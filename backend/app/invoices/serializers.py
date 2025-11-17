"""
Serializers for Invoice Management
"""
from rest_framework import serializers
from decimal import Decimal
from .models import (
    Customer, Invoice, InvoiceLineItem, Payment,
    InvoiceCommunication, PaymentPrediction, ReminderSchedule
)


class CustomerSerializer(serializers.ModelSerializer):
    """Customer serializer"""
    invoice_count = serializers.SerializerMethodField()
    outstanding_balance = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'email', 'phone', 'company', 'billing_address',
            'payment_terms_default', 'preferred_payment_method',
            'payment_reliability_score', 'average_days_to_pay',
            'total_invoiced', 'total_paid', 'notes', 'tags',
            'invoice_count', 'outstanding_balance',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'payment_reliability_score', 'average_days_to_pay',
                            'total_invoiced', 'total_paid', 'created_at', 'updated_at']
    
    def get_invoice_count(self, obj):
        return obj.invoices.count()
    
    def get_outstanding_balance(self, obj):
        unpaid_invoices = obj.invoices.exclude(status__in=['paid', 'cancelled'])
        total = sum(invoice.amount_remaining() for invoice in unpaid_invoices)
        return float(total)


class InvoiceLineItemSerializer(serializers.ModelSerializer):
    """Line item serializer"""
    
    class Meta:
        model = InvoiceLineItem
        fields = ['id', 'description', 'quantity', 'unit_price', 'amount', 'sort_order']
        read_only_fields = ['id']
    
    def validate(self, data):
        """Calculate amount from quantity and unit_price"""
        if 'quantity' in data and 'unit_price' in data:
            data['amount'] = data['quantity'] * data['unit_price']
        return data


class PaymentSerializer(serializers.ModelSerializer):
    """Payment serializer"""
    
    class Meta:
        model = Payment
        fields = [
            'id', 'amount', 'payment_method', 'payment_date', 'status',
            'transaction_reference', 'notes', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'stripe_payment_intent_id', 'stripe_charge_id',
                            'created_at', 'updated_at']


class InvoiceCommunicationSerializer(serializers.ModelSerializer):
    """Communication log serializer"""
    
    class Meta:
        model = InvoiceCommunication
        fields = [
            'id', 'communication_type', 'channel', 'subject', 'message_body',
            'sent_at', 'opened_at', 'clicked_at', 'responded_at',
            'is_ai_generated', 'created_at'
        ]
        read_only_fields = ['id', 'opened_at', 'clicked_at', 'responded_at', 'created_at']


class PaymentPredictionSerializer(serializers.ModelSerializer):
    """Payment prediction serializer"""
    days_until_predicted = serializers.SerializerMethodField()
    
    class Meta:
        model = PaymentPrediction
        fields = [
            'id', 'predicted_payment_date', 'confidence_score', 'risk_level',
            'model_version', 'factors', 'days_until_predicted', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_days_until_predicted(self, obj):
        from django.utils import timezone
        delta = obj.predicted_payment_date - timezone.now().date()
        return delta.days


class InvoiceSerializer(serializers.ModelSerializer):
    """Main invoice serializer"""
    line_items = InvoiceLineItemSerializer(many=True, required=False)
    payments = PaymentSerializer(many=True, read_only=True)
    communications = InvoiceCommunicationSerializer(many=True, read_only=True)
    predictions = PaymentPredictionSerializer(many=True, read_only=True)
    
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    amount_remaining = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    days_until_due = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'customer', 'customer_name', 'customer_email',
            'issue_date', 'due_date', 'subtotal', 'tax_rate', 'tax_amount',
            'discount_amount', 'total_amount', 'amount_paid', 'amount_remaining',
            'status', 'payment_terms', 'notes', 'footer_text', 'template_id',
            'sent_at', 'viewed_at', 'paid_at', 'payment_link_token',
            'is_overdue', 'days_until_due',
            'line_items', 'payments', 'communications', 'predictions',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'invoice_number', 'amount_paid', 'sent_at',
                            'viewed_at', 'paid_at', 'payment_link_token',
                            'created_at', 'updated_at']
    
    def get_amount_remaining(self, obj):
        return float(obj.amount_remaining())
    
    def get_is_overdue(self, obj):
        return obj.is_overdue()
    
    def get_days_until_due(self, obj):
        from django.utils import timezone
        delta = obj.due_date - timezone.now().date()
        return delta.days
    
    def validate(self, data):
        """Calculate totals"""
        if 'subtotal' in data and 'tax_rate' in data:
            data['tax_amount'] = data['subtotal'] * (data['tax_rate'] / Decimal('100'))
        
        if all(k in data for k in ['subtotal', 'tax_amount', 'discount_amount']):
            data['total_amount'] = data['subtotal'] + data['tax_amount'] - data['discount_amount']
        
        return data
    
    def create(self, validated_data):
        """Create invoice with line items"""
        line_items_data = validated_data.pop('line_items', [])
        
        # Generate invoice number if not provided
        if 'invoice_number' not in validated_data or not validated_data['invoice_number']:
            org = validated_data['organization']
            last_invoice = Invoice.objects.filter(organization=org).order_by('-created_at').first()
            if last_invoice and last_invoice.invoice_number.isdigit():
                next_number = int(last_invoice.invoice_number) + 1
            else:
                next_number = 1001
            validated_data['invoice_number'] = str(next_number)
        
        invoice = Invoice.objects.create(**validated_data)
        
        # Create line items
        for item_data in line_items_data:
            InvoiceLineItem.objects.create(invoice=invoice, **item_data)
        
        return invoice
    
    def update(self, instance, validated_data):
        """Update invoice and line items"""
        line_items_data = validated_data.pop('line_items', None)
        
        # Update invoice fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update line items if provided
        if line_items_data is not None:
            # Delete existing line items
            instance.line_items.all().delete()
            # Create new line items
            for item_data in line_items_data:
                InvoiceLineItem.objects.create(invoice=instance, **item_data)
        
        return instance


class InvoiceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for invoice lists"""
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    amount_remaining = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    latest_prediction = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'customer_name', 'issue_date', 'due_date',
            'total_amount', 'amount_paid', 'amount_remaining', 'status',
            'is_overdue', 'latest_prediction', 'created_at'
        ]
    
    def get_amount_remaining(self, obj):
        return float(obj.amount_remaining())
    
    def get_is_overdue(self, obj):
        return obj.is_overdue()
    
    def get_latest_prediction(self, obj):
        prediction = obj.predictions.first()
        if prediction:
            return {
                'predicted_date': prediction.predicted_payment_date,
                'risk_level': prediction.risk_level,
                'confidence': float(prediction.confidence_score)
            }
        return None


class ReminderScheduleSerializer(serializers.ModelSerializer):
    """Reminder schedule settings serializer"""
    
    class Meta:
        model = ReminderSchedule
        fields = [
            'id', 'send_before_due_days', 'send_on_due_date', 'send_after_due_days',
            'use_email', 'use_sms', 'tone', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ARAgingReportSerializer(serializers.Serializer):
    """AR Aging Report serializer"""
    current = serializers.DecimalField(max_digits=12, decimal_places=2)
    days_1_30 = serializers.DecimalField(max_digits=12, decimal_places=2)
    days_31_60 = serializers.DecimalField(max_digits=12, decimal_places=2)
    days_61_90 = serializers.DecimalField(max_digits=12, decimal_places=2)
    days_over_90 = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_outstanding = serializers.DecimalField(max_digits=12, decimal_places=2)
    invoice_count = serializers.IntegerField()
    average_dso = serializers.DecimalField(max_digits=8, decimal_places=2)

