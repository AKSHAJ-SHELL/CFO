"""
URLs for billing app
"""
from django.urls import path
from . import views

urlpatterns = [
	path('create_checkout_session/', views.create_checkout_session, name='create_checkout_session'),
	path('subscription/', views.get_subscription, name='get_subscription'),
	path('webhook/', views.webhook, name='stripe_webhook'),
]

