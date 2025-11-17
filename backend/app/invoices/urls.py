"""
URL routing for Invoice Management
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .demo_views import DemoOverviewView, DemoSetupView

router = DefaultRouter()

# Main routes
router.register(r'customers', views.CustomerViewSet, basename='customer')
router.register(r'invoices', views.InvoiceViewSet, basename='invoice')
router.register(r'ar-aging', views.ARAgingViewSet, basename='ar-aging')
router.register(r'reminder-schedule', views.ReminderScheduleViewSet, basename='reminder-schedule')

# Nested route for payments under invoices
app_name = 'invoices'

urlpatterns = [
    path('', include(router.urls)),
    
    # Demo views (no authentication required)
    path('demo/',
         DemoSetupView.as_view(),
         name='demo-setup'),
    path('demo/data/',
         DemoOverviewView.as_view(),
         name='demo-data'),
    
    # Public payment intent creation
    path('pay/<str:token>/create-intent/',
         views.PaymentIntentView.as_view(),
         name='create-payment-intent'),
    
    # Stripe webhook
    path('webhook/stripe/',
         views.StripeWebhookView.as_view(),
         name='stripe-webhook'),
    
    # Nested payments route
    path('invoices/<uuid:invoice_id>/payments/', 
         views.PaymentViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='invoice-payments'),
    path('invoices/<uuid:invoice_id>/payments/<uuid:pk>/', 
         views.PaymentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}),
         name='invoice-payment-detail'),
    
    # Payment refund
    path('payments/<uuid:payment_id>/refund/',
         views.PaymentRefundView.as_view(),
         name='payment-refund'),
]

# Note: Public URLs are now included in main urlpatterns above

