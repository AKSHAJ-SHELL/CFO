"""URLs for Reserves"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'goals', views.ReserveGoalViewSet, basename='reserve-goal')
router.register(r'savings-accounts', views.SavingsAccountViewSet, basename='savings-account')
router.register(r'auto-transfers', views.AutoTransferViewSet, basename='auto-transfer')

app_name = 'reserves'
urlpatterns = [path('', include(router.urls))]

