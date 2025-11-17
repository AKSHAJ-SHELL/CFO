"""
Stripe integration utilities for invoice payments
"""
import stripe
from decimal import Decimal
from django.conf import settings
from .models import Payment, Invoice

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY if hasattr(settings, 'STRIPE_SECRET_KEY') else None


def create_payment_intent(invoice, customer_email=None):
    """
    Create a Stripe Payment Intent for an invoice
    
    Args:
        invoice: Invoice object
        customer_email: Optional email for receipt
    
    Returns:
        dict: Payment Intent data including client_secret
    """
    if not stripe.api_key:
        raise ValueError("Stripe API key not configured")
    
    try:
        # Convert amount to cents (Stripe uses smallest currency unit)
        amount_cents = int(invoice.amount_remaining() * 100)
        
        # Create or get Stripe customer
        stripe_customer = None
        if customer_email or invoice.customer.email:
            email = customer_email or invoice.customer.email
            
            # Search for existing customer
            customers = stripe.Customer.list(email=email, limit=1)
            if customers.data:
                stripe_customer = customers.data[0].id
            else:
                # Create new customer
                customer = stripe.Customer.create(
                    email=email,
                    name=invoice.customer.name,
                    metadata={
                        'customer_id': str(invoice.customer.id),
                        'organization_id': str(invoice.organization.id)
                    }
                )
                stripe_customer = customer.id
        
        # Create Payment Intent
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency=invoice.organization.currency.lower(),
            customer=stripe_customer,
            description=f"Invoice {invoice.invoice_number}",
            metadata={
                'invoice_id': str(invoice.id),
                'invoice_number': invoice.invoice_number,
                'organization_id': str(invoice.organization.id),
                'customer_id': str(invoice.customer.id)
            },
            receipt_email=customer_email or invoice.customer.email,
            automatic_payment_methods={
                'enabled': True,
            },
        )
        
        # Create Payment record in database
        payment = Payment.objects.create(
            invoice=invoice,
            amount=invoice.amount_remaining(),
            payment_method='card',  # Default, will be updated by webhook
            status='pending',
            stripe_payment_intent_id=intent.id,
            metadata={
                'stripe_customer_id': stripe_customer,
                'client_secret': intent.client_secret
            }
        )
        
        return {
            'payment_intent_id': intent.id,
            'client_secret': intent.client_secret,
            'amount': float(invoice.amount_remaining()),
            'currency': invoice.organization.currency,
            'payment_id': str(payment.id)
        }
    
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")


def retrieve_payment_intent(payment_intent_id):
    """
    Retrieve a Stripe Payment Intent
    
    Args:
        payment_intent_id: Stripe Payment Intent ID
    
    Returns:
        PaymentIntent object
    """
    try:
        return stripe.PaymentIntent.retrieve(payment_intent_id)
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")


def refund_payment(payment, amount=None):
    """
    Refund a payment (full or partial)
    
    Args:
        payment: Payment object
        amount: Optional partial refund amount
    
    Returns:
        dict: Refund data
    """
    if not payment.stripe_payment_intent_id:
        raise ValueError("Payment does not have a Stripe payment intent")
    
    try:
        refund_amount = amount or payment.amount
        amount_cents = int(refund_amount * 100)
        
        refund = stripe.Refund.create(
            payment_intent=payment.stripe_payment_intent_id,
            amount=amount_cents if amount else None,  # None = full refund
            reason='requested_by_customer',
            metadata={
                'payment_id': str(payment.id),
                'invoice_id': str(payment.invoice.id)
            }
        )
        
        # Update payment status
        if amount and amount < payment.amount:
            # Partial refund - don't change status
            pass
        else:
            # Full refund
            payment.status = 'refunded'
            payment.save()
            
            # Update invoice
            invoice = payment.invoice
            invoice.amount_paid -= refund_amount
            if invoice.amount_paid == 0:
                invoice.status = 'sent'  # or 'overdue' based on date
            elif invoice.amount_paid < invoice.total_amount:
                invoice.status = 'partial'
            invoice.save()
        
        return {
            'refund_id': refund.id,
            'amount': float(refund_amount),
            'status': refund.status
        }
    
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")


def handle_webhook_event(event):
    """
    Process Stripe webhook events
    
    Args:
        event: Stripe Event object
    
    Returns:
        dict: Processing result
    """
    event_type = event['type']
    
    if event_type == 'payment_intent.succeeded':
        return handle_payment_success(event['data']['object'])
    
    elif event_type == 'payment_intent.payment_failed':
        return handle_payment_failed(event['data']['object'])
    
    elif event_type == 'charge.refunded':
        return handle_refund(event['data']['object'])
    
    elif event_type == 'payment_intent.canceled':
        return handle_payment_canceled(event['data']['object'])
    
    return {'status': 'unhandled', 'type': event_type}


def handle_payment_success(payment_intent):
    """Handle successful payment"""
    try:
        payment = Payment.objects.get(stripe_payment_intent_id=payment_intent['id'])
        
        # Update payment
        payment.status = 'succeeded'
        payment.payment_method = payment_intent.get('payment_method_types', ['card'])[0]
        if 'charges' in payment_intent and payment_intent['charges']['data']:
            payment.stripe_charge_id = payment_intent['charges']['data'][0]['id']
        payment.save()
        
        # Update invoice
        invoice = payment.invoice
        invoice.amount_paid += payment.amount
        
        if invoice.amount_paid >= invoice.total_amount:
            invoice.status = 'paid'
            from django.utils import timezone
            invoice.paid_at = timezone.now()
        elif invoice.amount_paid > 0:
            invoice.status = 'partial'
        
        invoice.save()
        
        # Trigger thank you email task
        from .tasks import send_thank_you_email
        send_thank_you_email.delay(str(invoice.id))
        
        return {
            'status': 'success',
            'payment_id': str(payment.id),
            'invoice_id': str(invoice.id),
            'invoice_status': invoice.status
        }
    
    except Payment.DoesNotExist:
        return {'status': 'error', 'message': 'Payment not found'}


def handle_payment_failed(payment_intent):
    """Handle failed payment"""
    try:
        payment = Payment.objects.get(stripe_payment_intent_id=payment_intent['id'])
        payment.status = 'failed'
        payment.metadata['error'] = payment_intent.get('last_payment_error', {}).get('message', 'Unknown error')
        payment.save()
        
        return {
            'status': 'failed',
            'payment_id': str(payment.id),
            'error': payment.metadata.get('error')
        }
    
    except Payment.DoesNotExist:
        return {'status': 'error', 'message': 'Payment not found'}


def handle_payment_canceled(payment_intent):
    """Handle canceled payment"""
    try:
        payment = Payment.objects.get(stripe_payment_intent_id=payment_intent['id'])
        payment.status = 'cancelled'
        payment.save()
        
        return {
            'status': 'cancelled',
            'payment_id': str(payment.id)
        }
    
    except Payment.DoesNotExist:
        return {'status': 'error', 'message': 'Payment not found'}


def handle_refund(charge):
    """Handle refund event"""
    # Refunds are typically handled by the refund_payment function
    # This webhook handler is for confirmation/logging
    return {'status': 'refund_processed', 'charge_id': charge['id']}


def verify_webhook_signature(payload, signature, webhook_secret):
    """
    Verify Stripe webhook signature
    
    Args:
        payload: Raw request body
        signature: Stripe-Signature header value
        webhook_secret: Webhook signing secret
    
    Returns:
        Event object if valid
    
    Raises:
        stripe.error.SignatureVerificationError if invalid
    """
    try:
        event = stripe.Webhook.construct_event(
            payload, signature, webhook_secret
        )
        return event
    except ValueError:
        # Invalid payload
        raise ValueError("Invalid payload")
    except stripe.error.SignatureVerificationError:
        # Invalid signature
        raise stripe.error.SignatureVerificationError("Invalid signature", signature)

