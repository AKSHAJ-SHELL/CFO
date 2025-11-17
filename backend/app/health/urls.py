"""URLs for Health Score"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'scores', views.HealthScoreViewSet, basename='health-score')
router.register(r'benchmarks', views.BenchmarkViewSet, basename='benchmark')

app_name = 'health'
urlpatterns = [path('', include(router.urls))]

