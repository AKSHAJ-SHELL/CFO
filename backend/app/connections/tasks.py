"""
Celery tasks for account connections
"""
from celery import shared_task
from django.utils import timezone
from .models import AccountConnection
from app.finance.tasks import classify_transaction_task


@shared_task
def sync_account_connection_task(connection_id):
	"""Sync transactions from account connection"""
	connection = AccountConnection.objects.filter(id=connection_id).first()
	if not connection:
		return
	
	# Mock sync - fetch transactions from provider
	# In real implementation, call Plaid/QuickBooks API
	# For now, we'll just update the sync timestamp
	connection.last_synced_at = timezone.now()
	connection.save()
	
	# Classify any new transactions
	# This would be triggered by transaction creation signals

