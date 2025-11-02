"""
Account connection models (Plaid, QuickBooks, etc.)
"""
import uuid
from django.db import models
from app.users.models import Organization


class AccountConnection(models.Model):
	"""Bank/account connection model"""
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	org = models.ForeignKey(
		Organization,
		on_delete=models.CASCADE,
		related_name='account_connections'
	)
	provider = models.CharField(
		max_length=50,
		choices=[
			('plaid', 'Plaid'),
			('quickbooks', 'QuickBooks'),
			('stripe', 'Stripe'),
		]
	)
	name = models.CharField(max_length=255)
	provider_account_id = models.CharField(max_length=255)  # TODO: Add encryption in production
	status = models.CharField(
		max_length=20,
		choices=[
			('active', 'Active'),
			('pending', 'Pending'),
			('error', 'Error'),
			('disconnected', 'Disconnected'),
		],
		default='pending'
	)
	last_synced_at = models.DateTimeField(null=True, blank=True)
	metadata = models.JSONField(default=dict)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		db_table = 'account_connections'
		ordering = ['-created_at']

	def __str__(self):
		return f'{self.provider} - {self.name} ({self.status})'

