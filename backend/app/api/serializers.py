"""
Serializers for API models
"""
from rest_framework import serializers
from .models import Transaction, Forecast, Anomaly, Report, ExpenseCategory
from app.connections.serializers import AccountConnectionSerializer


class TransactionSerializer(serializers.ModelSerializer):
	"""Transaction serializer"""
	account_connection_name = serializers.CharField(
		source='account_connection.name',
		read_only=True
	)

	class Meta:
		model = Transaction
		fields = (
			'id', 'org', 'account_connection', 'account_connection_name',
			'provider_tx_id', 'date', 'amount', 'currency', 'description',
			'category', 'classified_at', 'raw', 'created_at', 'updated_at'
		)
		read_only_fields = ('id', 'created_at', 'updated_at', 'classified_at')


class ExpenseCategorySerializer(serializers.ModelSerializer):
	"""Expense category serializer"""
	class Meta:
		model = ExpenseCategory
		fields = ('id', 'org', 'name', 'parent', 'created_at')
		read_only_fields = ('id', 'created_at')


class ForecastSerializer(serializers.ModelSerializer):
	"""Forecast serializer"""
	class Meta:
		model = Forecast
		fields = (
			'id', 'org', 'generated_at', 'horizon_days',
			'runway_days', 'forecast_points'
		)
		read_only_fields = ('id', 'generated_at')


class AnomalySerializer(serializers.ModelSerializer):
	"""Anomaly serializer"""
	transaction = TransactionSerializer(read_only=True)

	class Meta:
		model = Anomaly
		fields = (
			'id', 'org', 'transaction', 'score', 'reason',
			'resolved', 'created_at'
		)
		read_only_fields = ('id', 'created_at')


class ReportSerializer(serializers.ModelSerializer):
	"""Report serializer"""
	class Meta:
		model = Report
		fields = (
			'id', 'org', 'period_start', 'period_end',
			'gpt_summary', 'metrics', 'created_at'
		)
		read_only_fields = ('id', 'created_at')

