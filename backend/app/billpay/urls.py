"""
URL routing for Bill Pay Automation
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'vendors', views.VendorViewSet, basename='vendor')
router.register(r'bills', views.BillViewSet, basename='bill')
router.register(r'workflows', views.ApprovalWorkflowViewSet, basename='workflow')
router.register(r'recurring', views.RecurringScheduleViewSet, basename='recurring')
router.register(r'batches', views.PaymentBatchViewSet, basename='batch')

app_name = 'billpay'

urlpatterns = [
    path('', include(router.urls)),
]

