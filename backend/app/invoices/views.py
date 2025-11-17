"""
Invoice Management Views
"""
import secrets
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from django.db.models import Q, Sum, Count, Avg
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from rest_framework import viewsets, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import (
    Customer, Invoice, Payment, InvoiceCommunication,
    PaymentPrediction, ReminderSchedule
)
from .serializers import (
    CustomerSerializer, InvoiceSerializer, InvoiceListSerializer,
    PaymentSerializer, InvoiceCommunicationSerializer,
    PaymentPredictionSerializer, ReminderScheduleSerializer,
    ARAgingReportSerializer
)
from .stripe_utils import (
    create_payment_intent, verify_webhook_signature, 
    handle_webhook_event, refund_payment
)
from django.conf import settings


class CustomerViewSet(viewsets.ModelViewSet):
    """Customer CRUD operations"""
    permission_classes = [IsAuthenticated]
    serializer_class = CustomerSerializer
    
    def get_queryset(self):
        # Get organization from request context (set by middleware or view)
        org_id = self.kwargs.get('org_id')
        return Customer.objects.filter(organization_id=org_id)
    
    def perform_create(self, serializer):
        org_id = self.kwargs.get('org_id')
        serializer.save(organization_id=org_id)
    
    @action(detail=True, methods=['get'])
    def payment_history(self, request, org_id=None, pk=None):
        """Get customer payment history and analytics"""
        customer = self.get_object()
        
        invoices = customer.invoices.all()
        payments = Payment.objects.filter(invoice__customer=customer, status='succeeded')
        
        # Calculate metrics
        total_invoices = invoices.count()
        paid_invoices = invoices.filter(status='paid').count()
        overdue_invoices = invoices.filter(status='overdue').count()
        
        # Payment timing analysis
        paid_invoice_data = []
        for invoice in invoices.filter(status='paid'):
            if invoice.paid_at and invoice.issue_date:
                days_to_pay = (invoice.paid_at.date() - invoice.issue_date).days
                paid_invoice_data.append(days_to_pay)
        
        avg_days_to_pay = sum(paid_invoice_data) / len(paid_invoice_data) if paid_invoice_data else 0
        
        return Response({
            'customer': CustomerSerializer(customer).data,
            'metrics': {
                'total_invoices': total_invoices,
                'paid_invoices': paid_invoices,
                'overdue_invoices': overdue_invoices,
                'average_days_to_pay': round(avg_days_to_pay, 1),
                'on_time_payment_rate': (paid_invoices / total_invoices * 100) if total_invoices > 0 else 0
            },
            'recent_payments': PaymentSerializer(payments[:10], many=True).data
        })


class InvoiceViewSet(viewsets.ModelViewSet):
    """Invoice CRUD operations"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        return InvoiceSerializer
    
    def get_queryset(self):
        org_id = self.kwargs.get('org_id')
        queryset = Invoice.objects.filter(organization_id=org_id).select_related('customer')
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by customer
        customer_id = self.request.query_params.get('customer')
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(issue_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(issue_date__lte=end_date)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(invoice_number__icontains=search) |
                Q(customer__name__icontains=search) |
                Q(notes__icontains=search)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        org_id = self.kwargs.get('org_id')
        serializer.save(
            organization_id=org_id,
            created_by=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def send(self, request, org_id=None, pk=None):
        """Send invoice to customer"""
        invoice = self.get_object()
        
        if invoice.status == 'draft':
            # Generate payment link token
            invoice.payment_link_token = secrets.token_urlsafe(32)
            invoice.status = 'sent'
            invoice.sent_at = timezone.now()
            invoice.save()
            
            # Create communication log
            InvoiceCommunication.objects.create(
                invoice=invoice,
                communication_type='sent',
                channel='email',
                subject=f'Invoice {invoice.invoice_number} from {invoice.organization.name}',
                message_body=f'Your invoice for ${invoice.total_amount} is ready.',
            )
            
            # TODO: Send actual email via email service
            # send_invoice_email.delay(invoice.id)
            
            return Response({
                'message': 'Invoice sent successfully',
                'payment_link': f'/pay/{invoice.payment_link_token}'
            })
        else:
            return Response(
                {'error': 'Invoice must be in draft status to send'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def remind(self, request, org_id=None, pk=None):
        """Send manual payment reminder"""
        invoice = self.get_object()
        
        if invoice.status in ['sent', 'viewed', 'overdue']:
            # Determine communication type based on status
            if invoice.is_overdue():
                comm_type = 'overdue'
                subject = f'Overdue: Invoice {invoice.invoice_number}'
            else:
                comm_type = 'reminder'
                subject = f'Reminder: Invoice {invoice.invoice_number} due soon'
            
            # Create communication log
            InvoiceCommunication.objects.create(
                invoice=invoice,
                communication_type=comm_type,
                channel='email',
                subject=subject,
                message_body=request.data.get('message', 'This is a friendly reminder about your outstanding invoice.'),
            )
            
            # TODO: Send actual email
            # send_reminder_email.delay(invoice.id)
            
            return Response({'message': 'Reminder sent successfully'})
        else:
            return Response(
                {'error': 'Cannot send reminder for invoice in current status'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def preview(self, request, org_id=None, pk=None):
        """Generate invoice preview (PDF or HTML)"""
        invoice = self.get_object()
        # TODO: Generate PDF preview
        return Response(InvoiceSerializer(invoice).data)
    
    @action(detail=True, methods=['post'])
    def mark_viewed(self, request, org_id=None, pk=None):
        """Mark invoice as viewed (called when customer opens invoice)"""
        invoice = self.get_object()
        
        if invoice.status == 'sent' and not invoice.viewed_at:
            invoice.status = 'viewed'
            invoice.viewed_at = timezone.now()
            invoice.save()
        
        return Response({'message': 'Invoice marked as viewed'})
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, org_id=None, pk=None):
        """Cancel invoice"""
        invoice = self.get_object()
        
        if invoice.status not in ['paid', 'cancelled']:
            invoice.status = 'cancelled'
            invoice.save()
            return Response({'message': 'Invoice cancelled successfully'})
        else:
            return Response(
                {'error': 'Cannot cancel paid or already cancelled invoice'},
                status=status.HTTP_400_BAD_REQUEST
            )


class PaymentViewSet(viewsets.ModelViewSet):
    """Payment operations"""
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer
    
    def get_queryset(self):
        org_id = self.kwargs.get('org_id')
        invoice_id = self.kwargs.get('invoice_id')
        return Payment.objects.filter(
            invoice__organization_id=org_id,
            invoice_id=invoice_id
        )
    
    def perform_create(self, serializer):
        """Record a payment and update invoice"""
        invoice_id = self.kwargs.get('invoice_id')
        invoice = Invoice.objects.get(id=invoice_id)
        
        payment = serializer.save(invoice=invoice)
        
        # Update invoice amounts
        if payment.status == 'succeeded':
            invoice.amount_paid += payment.amount
            
            # Update invoice status
            if invoice.amount_paid >= invoice.total_amount:
                invoice.status = 'paid'
                invoice.paid_at = timezone.now()
            elif invoice.amount_paid > 0:
                invoice.status = 'partial'
            
            invoice.save()
            
            # Send thank you communication
            InvoiceCommunication.objects.create(
                invoice=invoice,
                communication_type='thank_you',
                channel='email',
                subject=f'Payment received for Invoice {invoice.invoice_number}',
                message_body=f'Thank you for your payment of ${payment.amount}.',
            )


class ARAgingViewSet(viewsets.ViewSet):
    """AR Aging Report"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request, org_id=None):
        """Generate AR aging report"""
        today = timezone.now().date()
        
        # Get all unpaid invoices
        invoices = Invoice.objects.filter(
            organization_id=org_id,
            status__in=['sent', 'viewed', 'partial', 'overdue']
        )
        
        # Calculate aging buckets
        current = Decimal('0.00')
        days_1_30 = Decimal('0.00')
        days_31_60 = Decimal('0.00')
        days_61_90 = Decimal('0.00')
        days_over_90 = Decimal('0.00')
        
        invoice_count = 0
        total_days_outstanding = 0
        
        for invoice in invoices:
            remaining = invoice.amount_remaining()
            days_overdue = (today - invoice.due_date).days
            
            if days_overdue < 0:
                current += remaining
            elif days_overdue <= 30:
                days_1_30 += remaining
            elif days_overdue <= 60:
                days_31_60 += remaining
            elif days_overdue <= 90:
                days_61_90 += remaining
            else:
                days_over_90 += remaining
            
            invoice_count += 1
            if days_overdue > 0:
                total_days_outstanding += days_overdue
        
        total_outstanding = current + days_1_30 + days_31_60 + days_61_90 + days_over_90
        average_dso = (total_days_outstanding / invoice_count) if invoice_count > 0 else 0
        
        data = {
            'current': current,
            'days_1_30': days_1_30,
            'days_31_60': days_31_60,
            'days_61_90': days_61_90,
            'days_over_90': days_over_90,
            'total_outstanding': total_outstanding,
            'invoice_count': invoice_count,
            'average_dso': Decimal(str(average_dso))
        }
        
        serializer = ARAgingReportSerializer(data)
        return Response(serializer.data)


class ReminderScheduleViewSet(viewsets.ModelViewSet):
    """Reminder schedule settings"""
    permission_classes = [IsAuthenticated]
    serializer_class = ReminderScheduleSerializer
    
    def get_queryset(self):
        org_id = self.kwargs.get('org_id')
        return ReminderSchedule.objects.filter(organization_id=org_id)
    
    def get_object(self):
        """Get or create reminder schedule for organization"""
        org_id = self.kwargs.get('org_id')
        schedule, created = ReminderSchedule.objects.get_or_create(
            organization_id=org_id
        )
        return schedule
    
    def list(self, request, org_id=None):
        """Get reminder schedule (single object)"""
        schedule = self.get_object()
        serializer = self.get_serializer(schedule)
        return Response(serializer.data)
    
    def update(self, request, org_id=None, pk=None):
        """Update reminder schedule"""
        schedule = self.get_object()
        serializer = self.get_serializer(schedule, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PaymentIntentView(views.APIView):
    """Create Stripe Payment Intent for invoice payment"""
    permission_classes = [AllowAny]  # Public endpoint for payment page
    
    def post(self, request, token=None):
        """
        Create a payment intent for an invoice
        
        URL: POST /api/invoices/pay/{payment_link_token}/create-intent/
        Body: { "email": "optional@email.com" }
        """
        try:
            # Get invoice by payment link token
            invoice = Invoice.objects.get(payment_link_token=token)
            
            # Check if invoice can be paid
            if invoice.status in ['paid', 'cancelled']:
                return Response(
                    {'error': 'Invoice cannot be paid'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if invoice.amount_remaining() <= 0:
                return Response(
                    {'error': 'Invoice is already paid'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create payment intent
            customer_email = request.data.get('email')
            intent_data = create_payment_intent(invoice, customer_email)
            
            # Return client secret for Stripe.js
            return Response({
                'clientSecret': intent_data['client_secret'],
                'amount': intent_data['amount'],
                'currency': intent_data['currency'],
                'invoice': {
                    'number': invoice.invoice_number,
                    'due_date': invoice.due_date,
                    'organization': invoice.organization.name
                }
            })
        
        except Invoice.DoesNotExist:
            return Response(
                {'error': 'Invoice not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PaymentRefundView(views.APIView):
    """Refund a payment"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, org_id=None, payment_id=None):
        """
        Refund a payment (full or partial)
        
        Body: { "amount": 50.00 }  # Optional, omit for full refund
        """
        try:
            payment = Payment.objects.get(
                id=payment_id,
                invoice__organization_id=org_id
            )
            
            if payment.status != 'succeeded':
                return Response(
                    {'error': 'Can only refund successful payments'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            refund_amount = request.data.get('amount')
            if refund_amount:
                refund_amount = Decimal(str(refund_amount))
                if refund_amount > payment.amount:
                    return Response(
                        {'error': 'Refund amount exceeds payment amount'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Process refund
            refund_data = refund_payment(payment, refund_amount)
            
            return Response({
                'message': 'Refund processed successfully',
                'refund': refund_data
            })
        
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(views.APIView):
    """Handle Stripe webhooks"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        Process Stripe webhook events
        
        Stripe will send events to: POST /api/invoices/webhook/stripe/
        """
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        
        # Get webhook secret from settings
        webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)
        
        if not webhook_secret:
            return HttpResponse('Webhook secret not configured', status=500)
        
        try:
            # Verify webhook signature
            event = verify_webhook_signature(payload, sig_header, webhook_secret)
        except ValueError:
            return HttpResponse('Invalid payload', status=400)
        except Exception as e:
            return HttpResponse(f'Invalid signature: {str(e)}', status=400)
        
        # Handle the event
        try:
            result = handle_webhook_event(event)
            
            # Log the webhook processing
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Stripe webhook processed: {event['type']} - Result: {result}")
            
            return HttpResponse(status=200)
        
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error processing webhook: {str(e)}")
            return HttpResponse(f'Webhook processing error: {str(e)}', status=500)

