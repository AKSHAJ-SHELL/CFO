"""
API viewsets for transactions, forecasts, anomalies, and reports
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from .models import Transaction, Forecast, Anomaly, Report
from .serializers import (
	TransactionSerializer,
	ForecastSerializer,
	AnomalySerializer,
	ReportSerializer
)
from app.finance.tasks import classify_transaction_task, generate_forecast_task
from app.reports.tasks import generate_report_task


class TransactionViewSet(viewsets.ModelViewSet):
	"""Transaction viewset"""
	serializer_class = TransactionSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		org_id = self.kwargs.get('org_id') or self.request.query_params.get('org_id')
		if not org_id:
			return Transaction.objects.none()
		
		# Verify org belongs to user
		org = self.request.user.organizations.filter(id=org_id).first()
		if not org:
			return Transaction.objects.none()
		
		queryset = Transaction.objects.filter(org=org)
		
		# Filter by date range
		start = self.request.query_params.get('start')
		end = self.request.query_params.get('end')
		if start:
			queryset = queryset.filter(date__gte=start)
		if end:
			queryset = queryset.filter(date__lte=end)
		
		# Filter by category
		category = self.request.query_params.get('category')
		if category:
			queryset = queryset.filter(category=category)
		
		# Search
		search = self.request.query_params.get('search')
		if search:
			queryset = queryset.filter(description__icontains=search)
		
		return queryset

	@action(detail=True, methods=['post'])
	def classify(self, request, pk=None):
		"""Reclassify a transaction"""
		transaction = self.get_object()
		category = request.data.get('category')
		
		if category:
			transaction.category = category
			transaction.classified_at = timezone.now()
			transaction.save()
			
			return Response(TransactionSerializer(transaction).data)
		
		# Trigger ML classification
		classify_transaction_task.delay(str(transaction.id))
		return Response({'status': 'classification queued'})

	@action(detail=False, methods=['post'], url_path='seed')
	def seed(self, request):
		"""Seed demo transactions (admin/demo only)"""
		org_id = request.data.get('org_id')
		if not org_id:
			return Response(
				{'error': 'org_id required'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		# This would call the seed script
		# For now, return success
		return Response({'status': 'seeding queued'})


class ForecastViewSet(viewsets.ReadOnlyModelViewSet):
	"""Forecast viewset"""
	serializer_class = ForecastSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		org_id = self.kwargs.get('org_id') or self.request.query_params.get('org_id')
		if not org_id:
			return Forecast.objects.none()
		
		org = self.request.user.organizations.filter(id=org_id).first()
		if not org:
			return Forecast.objects.none()
		
		return Forecast.objects.filter(org=org)

	@action(detail=False, methods=['post'])
	def generate(self, request):
		"""Generate or refresh forecast"""
		org_id = request.data.get('org_id')
		horizon_days = request.data.get('horizon_days', 90)
		
		if not org_id:
			return Response(
				{'error': 'org_id required'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		org = request.user.organizations.filter(id=org_id).first()
		if not org:
			return Response(
				{'error': 'Organization not found'},
				status=status.HTTP_404_NOT_FOUND
			)
		
		# Trigger forecast generation
		generate_forecast_task.delay(str(org.id), horizon_days)
		
		# Return latest forecast if available
		latest = Forecast.objects.filter(org=org).first()
		if latest:
			return Response(ForecastSerializer(latest).data)
		
		return Response({'status': 'forecast generation queued'})


class AnomalyViewSet(viewsets.ReadOnlyModelViewSet):
	"""Anomaly viewset"""
	serializer_class = AnomalySerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		org_id = self.kwargs.get('org_id') or self.request.query_params.get('org_id')
		if not org_id:
			return Anomaly.objects.none()
		
		org = self.request.user.organizations.filter(id=org_id).first()
		if not org:
			return Anomaly.objects.none()
		
		queryset = Anomaly.objects.filter(org=org, resolved=False)
		
		# Filter by threshold
		min_score = self.request.query_params.get('min_score')
		if min_score:
			queryset = queryset.filter(score__gte=float(min_score))
		
		return queryset

	@action(detail=True, methods=['post'])
	def resolve(self, request, pk=None):
		"""Mark anomaly as resolved"""
		anomaly = self.get_object()
		anomaly.resolved = True
		anomaly.save()
		return Response(AnomalySerializer(anomaly).data)


class ReportViewSet(viewsets.ReadOnlyModelViewSet):
	"""Report viewset"""
	serializer_class = ReportSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		org_id = self.kwargs.get('org_id') or self.request.query_params.get('org_id')
		if not org_id:
			return Report.objects.none()
		
		org = self.request.user.organizations.filter(id=org_id).first()
		if not org:
			return Report.objects.none()
		
		return Report.objects.filter(org=org)

	@action(detail=False, methods=['post'])
	def generate(self, request):
		"""Generate new report"""
		org_id = request.data.get('org_id')
		period_start = request.data.get('period_start')
		period_end = request.data.get('period_end')
		
		if not org_id:
			return Response(
				{'error': 'org_id required'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		org = request.user.organizations.filter(id=org_id).first()
		if not org:
			return Response(
				{'error': 'Organization not found'},
				status=status.HTTP_404_NOT_FOUND
			)
		
		# Default to last week if not specified
		if not period_end:
			period_end = timezone.now().date()
		if not period_start:
			period_start = period_end - timedelta(days=7)
		
		# Trigger report generation
		generate_report_task.delay(
			str(org.id),
			period_start.isoformat(),
			period_end.isoformat()
		)
		
		return Response({'status': 'report generation queued'})

