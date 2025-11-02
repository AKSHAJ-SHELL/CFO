"""
Basic authentication tests
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.mark.django_db
def test_user_registration():
	"""Test user registration"""
	client = APIClient()
	response = client.post('/api/auth/register/', {
		'email': 'test@example.com',
		'password': 'TestPass123!',
		'password_confirm': 'TestPass123!',
		'name': 'Test User',
		'org_name': 'Test Org'
	})
	assert response.status_code == 201
	assert 'tokens' in response.data
	assert 'access' in response.data['tokens']


@pytest.mark.django_db
def test_user_login():
	"""Test user login"""
	client = APIClient()
	# Create user first
	User.objects.create_user(
		email='test@example.com',
		password='TestPass123!',
		name='Test User'
	)
	
	response = client.post('/api/auth/login/', {
		'email': 'test@example.com',
		'password': 'TestPass123!'
	})
	assert response.status_code == 200
	assert 'tokens' in response.data

