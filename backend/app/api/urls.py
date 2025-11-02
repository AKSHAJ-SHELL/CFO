"""
URLs for API app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
	TransactionViewSet,
	ForecastViewSet,
	AnomalyViewSet,
	ReportViewSet
)

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'forecasts', ForecastViewSet, basename='forecast')
router.register(r'anomalies', AnomalyViewSet, basename='anomaly')
router.register(r'reports', ReportViewSet, basename='report')

urlpatterns = [
	path('', include(router.urls)),
]

