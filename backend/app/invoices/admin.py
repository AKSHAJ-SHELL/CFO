"""
Django Admin configuration for Invoice Management
"""
from django.contrib import admin
from .models import (
    Customer, Invoice, InvoiceLineItem, Payment,
    InvoiceCommunication, PaymentPrediction, ReminderSchedule
)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'company', 'organization', 'total_invoiced', 
                    'payment_reliability_score', 'created_at']
    list_filter = ['organization', 'preferred_payment_method', 'created_at']
    search_fields = ['name', 'email', 'company']
    readonly_fields = ['id', 'payment_reliability_score', 'average_days_to_pay',
                       'total_invoiced', 'total_paid', 'created_at', 'updated_at']


class InvoiceLineItemInline(admin.TabularInline):
    model = InvoiceLineItem
    extra = 1
    fields = ['description', 'quantity', 'unit_price', 'amount', 'sort_order']
    readonly_fields = ['amount']


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    fields = ['amount', 'payment_method', 'payment_date', 'status']
    readonly_fields = ['stripe_payment_intent_id', 'stripe_charge_id']


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'customer', 'organization', 'issue_date', 
                    'due_date', 'total_amount', 'amount_paid', 'status', 'is_overdue']
    list_filter = ['status', 'organization', 'issue_date', 'due_date']
    search_fields = ['invoice_number', 'customer__name', 'customer__email']
    readonly_fields = ['id', 'invoice_number', 'amount_paid', 'sent_at', 'viewed_at',
                       'paid_at', 'payment_link_token', 'created_at', 'updated_at']
    inlines = [InvoiceLineItemInline, PaymentInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'organization', 'customer', 'invoice_number', 'status')
        }),
        ('Dates', {
            'fields': ('issue_date', 'due_date', 'sent_at', 'viewed_at', 'paid_at')
        }),
        ('Amounts', {
            'fields': ('subtotal', 'tax_rate', 'tax_amount', 'discount_amount', 
                      'total_amount', 'amount_paid')
        }),
        ('Terms & Notes', {
            'fields': ('payment_terms', 'notes', 'footer_text', 'template_id')
        }),
        ('Tracking', {
            'fields': ('payment_link_token', 'created_by', 'created_at', 'updated_at')
        }),
    )
    
    def is_overdue(self, obj):
        return obj.is_overdue()
    is_overdue.boolean = True
    is_overdue.short_description = 'Overdue'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['invoice', 'amount', 'payment_method', 'payment_date', 
                    'status', 'created_at']
    list_filter = ['status', 'payment_method', 'payment_date']
    search_fields = ['invoice__invoice_number', 'transaction_reference',
                     'stripe_payment_intent_id']
    readonly_fields = ['id', 'stripe_payment_intent_id', 'stripe_charge_id',
                       'created_at', 'updated_at']


@admin.register(InvoiceCommunication)
class InvoiceCommunicationAdmin(admin.ModelAdmin):
    list_display = ['invoice', 'communication_type', 'channel', 'sent_at',
                    'opened_at', 'is_ai_generated']
    list_filter = ['communication_type', 'channel', 'is_ai_generated', 'sent_at']
    search_fields = ['invoice__invoice_number', 'subject', 'message_body']
    readonly_fields = ['id', 'opened_at', 'clicked_at', 'responded_at', 'created_at']


@admin.register(PaymentPrediction)
class PaymentPredictionAdmin(admin.ModelAdmin):
    list_display = ['invoice', 'predicted_payment_date', 'confidence_score',
                    'risk_level', 'model_version', 'created_at']
    list_filter = ['risk_level', 'model_version', 'created_at']
    search_fields = ['invoice__invoice_number']
    readonly_fields = ['id', 'created_at']


@admin.register(ReminderSchedule)
class ReminderScheduleAdmin(admin.ModelAdmin):
    list_display = ['organization', 'send_before_due_days', 'send_on_due_date',
                    'use_email', 'use_sms', 'is_active']
    list_filter = ['is_active', 'tone', 'use_email', 'use_sms']
    readonly_fields = ['id', 'created_at', 'updated_at']

