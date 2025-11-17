"""URLs for Profitability"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'projects', views.ProjectViewSet, basename='project')
router.register(r'customer-profitability', views.CustomerProfitabilityViewSet, basename='customer-profitability')
router.register(r'product-profitability', views.ProductProfitabilityViewSet, basename='product-profitability')
router.register(r'time-entries', views.TimeEntryViewSet, basename='time-entry')

app_name = 'profitability'
urlpatterns = [path('', include(router.urls))]

