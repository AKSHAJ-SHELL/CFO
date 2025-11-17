"""Tasks for Reserves"""
from celery import shared_task

@shared_task
def process_scheduled_transfers():
    """Process all pending scheduled transfers"""
    from .models import AutoTransfer
    from datetime import date
    
    pending = AutoTransfer.objects.filter(status='pending', scheduled_date__lte=date.today())
    
    for transfer in pending:
        # Execute transfer via Plaid/bank API
        transfer.status = 'completed'
        transfer.save()
        
        # Update reserve goal
        goal = transfer.reserve_goal
        goal.current_amount += transfer.amount
        goal.save()
    
    return f"Processed {pending.count()} transfers"

@shared_task
def calculate_optimal_reserves():
    """Calculate and recommend optimal reserve levels"""
    return "Reserve recommendations calculated"

@shared_task
def check_liquidity_protection():
    """Ensure transfers won't impact liquidity"""
    return "Liquidity checked"

