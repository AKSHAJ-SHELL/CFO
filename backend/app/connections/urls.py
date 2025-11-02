"""
URLs for connections app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AccountConnectionViewSet

router = DefaultRouter()
router.register(r'', AccountConnectionViewSet, basename='connection')

urlpatterns = [
	path('', include(router.urls)),
	path('create_link_token/', AccountConnectionViewSet.as_view({'post': 'create_link_token'})),
	path('exchange_public_token/', AccountConnectionViewSet.as_view({'post': 'exchange_public_token'})),
]

