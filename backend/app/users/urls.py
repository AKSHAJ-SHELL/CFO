"""
URLs for users app
"""
from django.urls import path
from . import views

urlpatterns = [
	path('register/', views.register, name='register'),
	path('login/', views.login, name='login'),
	path('me/', views.me, name='me'),
	path('refresh/', views.refresh_token, name='refresh'),
]

