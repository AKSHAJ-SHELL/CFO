"""
Views for billing and Stripe integration
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils import timezone
from datetime import timedelta
import stripe
from .models import BillingSubscription

if settings.STRIPE_API_KEY:
	stripe.api_key = settings.STRIPE_API_KEY


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
	"""Create Stripe checkout session"""
	org_id = request.data.get('org_id')
	plan = request.data.get('plan', 'standard')
	
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
	
	# Pricing
	prices = {
		'standard': 4900,  # $49.00
		'pro': 19900,  # $199.00
	}
	
	if plan not in prices:
		return Response(
			{'error': 'Invalid plan'},
			status=status.HTTP_400_BAD_REQUEST
		)
	
	# Mock checkout session for test mode
	session_data = {
		'session_id': f'session_{org.id}',
		'url': f'http://localhost:3000/billing/success?session_id=mock_session',
		'plan': plan,
		'amount': prices[plan]
	}
	
	# In real implementation, create Stripe checkout session
	# try:
	#     session = stripe.checkout.Session.create(
	#         payment_method_types=['card'],
	#         line_items=[{
	#             'price_data': {
	#                 'currency': 'usd',
	#                 'product_data': {'name': f'FinPilot {plan.title()}'},
	#                 'unit_amount': prices[plan],
	#             },
	#             'quantity': 1,
	#         }],
	#         mode='subscription',
	#         success_url=f'{settings.FRONTEND_URL}/billing/success?session_id={{CHECKOUT_SESSION_ID}}',
	#         cancel_url=f'{settings.FRONTEND_URL}/billing',
	#         client_reference_id=str(org.id),
	#     )
	#     session_data = {'session_id': session.id, 'url': session.url}
	# except Exception as e:
	#     return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
	
	return Response(session_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_subscription(request):
	"""Get current subscription"""
	org_id = request.query_params.get('org_id')
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
	
	subscription = getattr(org, 'subscription', None)
	if not subscription:
		return Response({'subscription': None})
	
	return Response({
		'plan': subscription.plan,
		'status': subscription.status,
		'current_period_end': subscription.current_period_end,
	})


@csrf_exempt
@require_POST
def webhook(request):
	"""Handle Stripe webhooks"""
	payload = request.body
	sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
	
	# Verify webhook signature
	# event = stripe.Webhook.construct_event(
	#     payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
	# )
	
	# Mock webhook handler
	# if event['type'] == 'checkout.session.completed':
	#     session = event['data']['object']
	#     org_id = session['client_reference_id']
	#     # Create/update subscription
	#     ...
	
	return Response({'status': 'received'})

