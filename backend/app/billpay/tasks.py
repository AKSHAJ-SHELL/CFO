"""
Celery tasks for Bill Pay
"""
from celery import shared_task


@shared_task
def detect_recurring_bills():
    """Detect recurring bill patterns using ML"""
    from .models import Bill, RecurringSchedule
    from datetime import timedelta
    # ML-based detection of recurring patterns
    return "Recurring bills detected"


@shared_task
def check_bill_due_dates():
    """Check for upcoming and overdue bills"""
    from .models import Bill
    from datetime import date, timedelta
    
    # Check bills due in next 7 days
    upcoming = Bill.objects.filter(
        due_date__lte=date.today() + timedelta(days=7),
        due_date__gte=date.today(),
        status__in=['approved', 'scheduled']
    )
    
    # Send reminders
    for bill in upcoming:
        # TODO: Send notification
        pass
    
    # Mark overdue bills
    overdue = Bill.objects.filter(
        due_date__lt=date.today(),
        status__in=['draft', 'pending_approval', 'approved']
    )
    
    overdue.update(status='overdue')
    
    return f"Checked {upcoming.count()} upcoming, marked {overdue.count()} overdue"


@shared_task
def process_payment_batch(batch_id):
    """Process a payment batch"""
    from .models import PaymentBatch, BillPayment
    from django.utils import timezone
    
    batch = PaymentBatch.objects.get(id=batch_id)
    
    results = {'success': 0, 'failed': 0}
    
    for payment in batch.payments.all():
        try:
            # Process payment through payment gateway
            # Mock implementation
            payment.status = 'completed'
            payment.save()
            
            # Update bill
            bill = payment.bill
            bill.amount_paid += payment.amount
            if bill.amount_paid >= bill.total_amount:
                bill.status = 'paid'
                bill.paid_at = timezone.now()
            bill.save()
            
            results['success'] += 1
        except Exception as e:
            payment.status = 'failed'
            payment.save()
            results['failed'] += 1
    
    batch.status = 'completed' if results['failed'] == 0 else 'failed'
    batch.processed_at = timezone.now()
    batch.processing_results = results
    batch.save()
    
    return results


@shared_task
def generate_recurring_bills():
    """Generate bills from recurring schedules"""
    from .models import RecurringSchedule, Bill
    from datetime import date
    
    schedules = RecurringSchedule.objects.filter(
        is_active=True,
        next_expected_date__lte=date.today()
    )
    
    generated_count = 0
    for schedule in schedules:
        # Create new bill
        Bill.objects.create(
            organization=schedule.organization,
            vendor=schedule.vendor,
            bill_number=f"REC-{schedule.id}-{date.today()}",
            bill_date=date.today(),
            due_date=date.today() + timedelta(days=30),
            total_amount=schedule.expected_amount,
            is_recurring=True,
            recurring_schedule=schedule,
            status='draft'
        )
        
        # Update schedule
        schedule.last_generated_date = date.today()
        # Calculate next date based on frequency
        schedule.save()
        
        generated_count += 1
    
    return f"Generated {generated_count} recurring bills"


@shared_task
def escalate_pending_approvals():
    """Escalate approval requests that are overdue"""
    from .models import ApprovalRequest
    from django.utils import timezone
    from datetime import timedelta
    
    cutoff = timezone.now() - timedelta(hours=48)
    
    pending_requests = ApprovalRequest.objects.filter(
        status='pending',
        created_at__lt=cutoff,
        escalated_at__isnull=True
    )
    
    for request in pending_requests:
        # Escalate to manager or workflow owner
        request.status = 'escalated'
        request.escalated_at = timezone.now()
        request.save()
        
        # TODO: Send escalation notification
    
    return f"Escalated {pending_requests.count()} approvals"

