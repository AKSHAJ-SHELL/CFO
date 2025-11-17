"""
Celery tasks for Invoice Management
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from .models import Invoice, InvoiceCommunication, ReminderSchedule, Customer, Payment


@shared_task
def send_invoice_reminders():
    """
    Daily task to send automated invoice reminders
    Runs at 9 AM daily
    """
    from django.db.models import Q
    
    today = timezone.now().date()
    
    # Get all active organizations with reminder schedules
    schedules = ReminderSchedule.objects.filter(is_active=True)
    
    for schedule in schedules:
        org = schedule.organization
        
        # Find invoices that need reminders
        invoices_to_remind = []
        
        # 1. Before due date reminders
        if schedule.send_before_due_days > 0:
            before_due_date = today + timedelta(days=schedule.send_before_due_days)
            before_due_invoices = Invoice.objects.filter(
                organization=org,
                status__in=['sent', 'viewed'],
                due_date=before_due_date
            )
            for invoice in before_due_invoices:
                # Check if we haven't sent this type of reminder before
                last_reminder = invoice.communications.filter(
                    communication_type='reminder'
                ).first()
                if not last_reminder or (today - last_reminder.sent_at.date()).days >= 1:
                    invoices_to_remind.append((invoice, 'reminder', 'Upcoming payment reminder'))
        
        # 2. Due date reminders
        if schedule.send_on_due_date:
            due_today_invoices = Invoice.objects.filter(
                organization=org,
                status__in=['sent', 'viewed'],
                due_date=today
            )
            for invoice in due_today_invoices:
                invoices_to_remind.append((invoice, 'reminder', 'Payment due today'))
        
        # 3. Overdue reminders
        for days_after in schedule.send_after_due_days:
            overdue_date = today - timedelta(days=days_after)
            overdue_invoices = Invoice.objects.filter(
                organization=org,
                status='overdue',
                due_date=overdue_date
            )
            for invoice in overdue_invoices:
                invoices_to_remind.append((invoice, 'overdue', f'Overdue by {days_after} days'))
        
        # Send reminders
        for invoice, comm_type, reason in invoices_to_remind:
            send_invoice_reminder.delay(invoice.id, comm_type, reason)
    
    return f"Processed {len(schedules)} organizations"


@shared_task
def send_invoice_reminder(invoice_id, communication_type='reminder', reason=''):
    """
    Send a single invoice reminder
    """
    try:
        invoice = Invoice.objects.get(id=invoice_id)
        schedule = ReminderSchedule.objects.get(organization=invoice.organization)
        
        # Generate message based on tone and type
        if communication_type == 'overdue':
            if schedule.tone == 'friendly':
                subject = f"Friendly reminder: Invoice {invoice.invoice_number} is overdue"
                message = f"Hi {invoice.customer.name},\n\nJust a friendly reminder that invoice {invoice.invoice_number} for ${invoice.total_amount} is now overdue. We'd appreciate your payment at your earliest convenience."
            elif schedule.tone == 'firm':
                subject = f"Overdue Invoice {invoice.invoice_number} - Immediate Action Required"
                message = f"Dear {invoice.customer.name},\n\nInvoice {invoice.invoice_number} for ${invoice.total_amount} is now overdue. Please arrange payment immediately to avoid any service interruptions."
            else:  # professional
                subject = f"Payment Reminder: Invoice {invoice.invoice_number} is overdue"
                message = f"Dear {invoice.customer.name},\n\nThis is a reminder that invoice {invoice.invoice_number} for ${invoice.total_amount} is now overdue. Please submit payment at your earliest convenience."
        else:  # reminder
            subject = f"Payment Reminder: Invoice {invoice.invoice_number}"
            message = f"Dear {invoice.customer.name},\n\nThis is a friendly reminder that invoice {invoice.invoice_number} for ${invoice.total_amount} is due soon. You can pay online using the link below."
        
        # Create communication log
        comm = InvoiceCommunication.objects.create(
            invoice=invoice,
            communication_type=communication_type,
            channel='email' if schedule.use_email else 'in_app',
            subject=subject,
            message_body=message,
            is_ai_generated=False
        )
        
        # TODO: Integrate with email service (SendGrid, AWS SES)
        # send_email(
        #     to=invoice.customer.email,
        #     subject=subject,
        #     body=message,
        #     tracking_id=str(comm.id)
        # )
        
        return f"Reminder sent for invoice {invoice.invoice_number}"
    
    except Invoice.DoesNotExist:
        return f"Invoice {invoice_id} not found"


@shared_task
def update_invoice_statuses():
    """
    Daily task to update invoice statuses (mark as overdue)
    Runs at 1 AM daily
    """
    today = timezone.now().date()
    
    # Mark overdue invoices
    overdue_invoices = Invoice.objects.filter(
        status__in=['sent', 'viewed', 'partial'],
        due_date__lt=today
    )
    
    count = overdue_invoices.update(status='overdue')
    
    return f"Marked {count} invoices as overdue"


@shared_task
def update_customer_payment_metrics():
    """
    Weekly task to update customer payment reliability scores
    Runs on Sunday at 3 AM
    """
    customers = Customer.objects.all()
    
    for customer in customers:
        # Get all paid invoices
        paid_invoices = customer.invoices.filter(status='paid')
        
        if paid_invoices.exists():
            # Calculate average days to pay
            days_to_pay_list = []
            on_time_count = 0
            
            for invoice in paid_invoices:
                if invoice.paid_at and invoice.issue_date:
                    days_to_pay = (invoice.paid_at.date() - invoice.issue_date).days
                    days_to_pay_list.append(days_to_pay)
                    
                    # Check if paid on time (before or on due date)
                    if invoice.paid_at.date() <= invoice.due_date:
                        on_time_count += 1
            
            if days_to_pay_list:
                avg_days = sum(days_to_pay_list) / len(days_to_pay_list)
                customer.average_days_to_pay = int(avg_days)
                
                # Calculate reliability score (0-100)
                # Based on: on-time payment rate (60%), average days to pay (40%)
                on_time_rate = (on_time_count / len(days_to_pay_list)) * 100
                
                # Penalize for slow payment (beyond 30 days)
                days_score = max(0, 100 - (avg_days - 30) * 2) if avg_days > 30 else 100
                
                reliability = (on_time_rate * 0.6) + (days_score * 0.4)
                customer.payment_reliability_score = Decimal(str(round(reliability, 2)))
                
                customer.save()
    
    return f"Updated metrics for {customers.count()} customers"


@shared_task
def generate_payment_predictions():
    """
    Daily task to generate payment predictions for outstanding invoices
    Runs at 2 AM daily
    """
    # Get all unpaid invoices
    invoices = Invoice.objects.filter(
        status__in=['sent', 'viewed', 'partial', 'overdue']
    )
    
    count = 0
    for invoice in invoices:
        # TODO: Call ML service to generate prediction
        # For now, use simple heuristic
        
        # Calculate expected payment date based on customer's average
        customer = invoice.customer
        if customer.average_days_to_pay > 0:
            predicted_days = customer.average_days_to_pay
        else:
            # Default to payment terms (e.g., Net 30 = 30 days)
            predicted_days = 30
        
        predicted_date = invoice.issue_date + timedelta(days=predicted_days)
        
        # Calculate risk level
        days_until_due = (invoice.due_date - timezone.now().date()).days
        if days_until_due < 0:
            risk_level = 'high'
            confidence = Decimal('0.75')
        elif customer.payment_reliability_score < 50:
            risk_level = 'high'
            confidence = Decimal('0.65')
        elif customer.payment_reliability_score < 80:
            risk_level = 'medium'
            confidence = Decimal('0.80')
        else:
            risk_level = 'low'
            confidence = Decimal('0.90')
        
        # Create or update prediction
        from .models import PaymentPrediction
        PaymentPrediction.objects.update_or_create(
            invoice=invoice,
            defaults={
                'predicted_payment_date': predicted_date,
                'confidence_score': confidence,
                'risk_level': risk_level,
                'model_version': '1.0-heuristic',
                'factors': {
                    'customer_avg_days': customer.average_days_to_pay,
                    'customer_reliability': float(customer.payment_reliability_score),
                    'invoice_age_days': (timezone.now().date() - invoice.issue_date).days
                }
            }
        )
        count += 1
    
    return f"Generated predictions for {count} invoices"


@shared_task
def send_invoice_email(invoice_id):
    """
    Send invoice email to customer
    """
    try:
        invoice = Invoice.objects.get(id=invoice_id)
        
        # TODO: Integrate with email service
        # This is a placeholder for actual email sending
        
        subject = f"Invoice {invoice.invoice_number} from {invoice.organization.name}"
        payment_link = f"https://app.finpilot.com/pay/{invoice.payment_link_token}"
        
        message = f"""
        Dear {invoice.customer.name},
        
        Please find your invoice attached.
        
        Invoice Number: {invoice.invoice_number}
        Amount Due: ${invoice.total_amount}
        Due Date: {invoice.due_date}
        
        You can pay online using this secure link:
        {payment_link}
        
        Thank you for your business!
        
        Best regards,
        {invoice.organization.name}
        """
        
        # Log the communication
        InvoiceCommunication.objects.create(
            invoice=invoice,
            communication_type='sent',
            channel='email',
            subject=subject,
            message_body=message
        )
        
        return f"Email sent for invoice {invoice.invoice_number}"
    
    except Invoice.DoesNotExist:
        return f"Invoice {invoice_id} not found"


@shared_task
def process_stripe_webhook(event_data):
    """
    Process Stripe webhook events for payments
    """
    event_type = event_data.get('type')
    
    if event_type == 'payment_intent.succeeded':
        payment_intent = event_data['data']['object']
        payment_intent_id = payment_intent['id']
        
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
            payment.status = 'succeeded'
            payment.save()
            
            # Update invoice
            invoice = payment.invoice
            invoice.amount_paid += payment.amount
            
            if invoice.amount_paid >= invoice.total_amount:
                invoice.status = 'paid'
                invoice.paid_at = timezone.now()
            elif invoice.amount_paid > 0:
                invoice.status = 'partial'
            
            invoice.save()
            
            # Send thank you email
            send_thank_you_email.delay(invoice.id)
            
            return f"Payment processed for invoice {invoice.invoice_number}"
        
        except Payment.DoesNotExist:
            return f"Payment not found for intent {payment_intent_id}"
    
    elif event_type == 'payment_intent.payment_failed':
        payment_intent = event_data['data']['object']
        payment_intent_id = payment_intent['id']
        
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
            payment.status = 'failed'
            payment.save()
            
            return f"Payment failed for intent {payment_intent_id}"
        
        except Payment.DoesNotExist:
            return f"Payment not found for intent {payment_intent_id}"
    
    return f"Unhandled event type: {event_type}"


@shared_task
def send_thank_you_email(invoice_id):
    """
    Send thank you email after payment received
    """
    try:
        invoice = Invoice.objects.get(id=invoice_id)
        
        subject = f"Payment received - Thank you!"
        message = f"""
        Dear {invoice.customer.name},
        
        Thank you for your payment of ${invoice.amount_paid} for invoice {invoice.invoice_number}.
        
        We appreciate your business!
        
        Best regards,
        {invoice.organization.name}
        """
        
        InvoiceCommunication.objects.create(
            invoice=invoice,
            communication_type='thank_you',
            channel='email',
            subject=subject,
            message_body=message
        )
        
        # TODO: Send actual email
        
        return f"Thank you email sent for invoice {invoice.invoice_number}"
    
    except Invoice.DoesNotExist:
        return f"Invoice {invoice_id} not found"

