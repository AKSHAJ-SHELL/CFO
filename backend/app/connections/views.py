"""
Views for account connections
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import requests
from .models import AccountConnection
from .serializers import AccountConnectionSerializer
from .tasks import sync_account_connection_task


class AccountConnectionViewSet(viewsets.ModelViewSet):
	"""Account connection viewset"""
	serializer_class = AccountConnectionSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		org_id = self.request.query_params.get('org_id')
		if not org_id:
			return AccountConnection.objects.none()
		
		org = self.request.user.organizations.filter(id=org_id).first()
		if not org:
			return AccountConnection.objects.none()
		
		return AccountConnection.objects.filter(org=org)

	@action(detail=False, methods=['post'])
	def create_link_token(self, request):
		"""Create Plaid link token (mock for sandbox)"""
		# Mock implementation - return a fake token for sandbox
		return Response({
			'link_token': 'link-sandbox-token-12345',
			'expiration': '2025-12-31T23:59:59Z'
		})

	@action(detail=False, methods=['post'])
	def exchange_public_token(self, request):
		"""Exchange Plaid public token and create connection"""
		public_token = request.data.get('public_token')
		org_id = request.data.get('org_id')
		name = request.data.get('name', 'Connected Account')
		
		if not public_token or not org_id:
			return Response(
				{'error': 'public_token and org_id required'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		org = request.user.organizations.filter(id=org_id).first()
		if not org:
			return Response(
				{'error': 'Organization not found'},
				status=status.HTTP_404_NOT_FOUND
			)
		
		# Mock exchange - in real implementation, call Plaid API
		connection = AccountConnection.objects.create(
			org=org,
			provider='plaid',
			name=name,
			provider_account_id=f'account_{public_token}',
			status='active'
		)
		
		return Response(AccountConnectionSerializer(connection).data)

	@action(detail=True, methods=['post'])
	def sync(self, request, pk=None):
		"""Trigger manual sync for account connection"""
		connection = self.get_object()
		sync_account_connection_task.delay(str(connection.id))
		return Response({'status': 'sync queued'})

