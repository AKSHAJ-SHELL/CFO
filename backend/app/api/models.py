"""
API models for transactions, forecasts, anomalies, and reports
"""
import uuid
from django.db import models
from app.users.models import Organization
from app.connections.models import AccountConnection


class Transaction(models.Model):
	"""Transaction model"""
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	org = models.ForeignKey(
		Organization,
		on_delete=models.CASCADE,
		related_name='transactions'
	)
	account_connection = models.ForeignKey(
		AccountConnection,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name='transactions'
	)
	provider_tx_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
	date = models.DateField()
	amount = models.DecimalField(max_digits=12, decimal_places=2)
	currency = models.CharField(max_length=10, default='USD')
	description = models.TextField()  # TODO: Add encryption in production
	category = models.CharField(max_length=50, default='Unknown')
	classified_at = models.DateTimeField(null=True, blank=True)
	raw = models.JSONField(default=dict)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		db_table = 'transactions'
		ordering = ['-date', '-created_at']
		indexes = [
			models.Index(fields=['org', 'date']),
			models.Index(fields=['org', 'category']),
		]

	def __str__(self):
		return f'{self.date} - {self.amount} - {self.description[:50]}'


class ExpenseCategory(models.Model):
	"""Expense category taxonomy"""
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	org = models.ForeignKey(
		Organization,
		on_delete=models.CASCADE,
		related_name='expense_categories'
	)
	name = models.CharField(max_length=100)
	parent = models.ForeignKey(
		'self',
		on_delete=models.CASCADE,
		null=True,
		blank=True,
		related_name='children'
	)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		db_table = 'expense_categories'
		verbose_name_plural = 'Expense Categories'

	def __str__(self):
		return self.name


class Forecast(models.Model):
	"""Cashflow forecast model"""
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	org = models.ForeignKey(
		Organization,
		on_delete=models.CASCADE,
		related_name='forecasts'
	)
	generated_at = models.DateTimeField(auto_now_add=True)
	horizon_days = models.IntegerField(default=90)
	runway_days = models.IntegerField(default=0)
	forecast_points = models.JSONField(default=list)  # [{"date": "2025-11-02", "balance": 20500.45}]

	class Meta:
		db_table = 'forecasts'
		ordering = ['-generated_at']

	def __str__(self):
		return f'Forecast for {self.org.name} - {self.runway_days} days runway'


class Anomaly(models.Model):
	"""Anomaly detection results"""
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	org = models.ForeignKey(
		Organization,
		on_delete=models.CASCADE,
		related_name='anomalies'
	)
	transaction = models.ForeignKey(
		Transaction,
		on_delete=models.CASCADE,
		related_name='anomalies'
	)
	score = models.FloatField()
	reason = models.TextField()
	resolved = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		db_table = 'anomalies'
		ordering = ['-score', '-created_at']

	def __str__(self):
		return f'Anomaly: {self.transaction.description[:50]} (score: {self.score})'


class Report(models.Model):
	"""AI-generated financial report"""
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	org = models.ForeignKey(
		Organization,
		on_delete=models.CASCADE,
		related_name='reports'
	)
	period_start = models.DateField()
	period_end = models.DateField()
	gpt_summary = models.TextField()
	metrics = models.JSONField(default=dict)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		db_table = 'reports'
		ordering = ['-created_at']

	def __str__(self):
		return f'Report for {self.org.name} ({self.period_start} to {self.period_end})'

