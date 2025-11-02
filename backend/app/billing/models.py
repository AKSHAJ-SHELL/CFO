"""
Billing and subscription models
"""
import uuid
from django.db import models
from app.users.models import Organization


class BillingSubscription(models.Model):
	"""Stripe subscription model"""
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	org = models.OneToOneField(
		Organization,
		on_delete=models.CASCADE,
		related_name='subscription'
	)
	stripe_subscription_id = models.CharField(max_length=255, unique=True)
	plan = models.CharField(
		max_length=20,
		choices=[('free', 'Free'), ('standard', 'Standard'), ('pro', 'Pro')],
		default='standard'
	)
	status = models.CharField(
		max_length=20,
		choices=[
			('active', 'Active'),
			('canceled', 'Canceled'),
			('past_due', 'Past Due'),
			('trialing', 'Trialing'),
		],
		default='active'
	)
	current_period_end = models.DateTimeField()
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		db_table = 'billing_subscriptions'

	def __str__(self):
		return f'{self.org.name} - {self.plan} ({self.status})'

