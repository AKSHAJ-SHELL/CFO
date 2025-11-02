"""
Authentication views
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Organization
from .serializers import (
	UserSerializer,
	RegisterSerializer,
	LoginSerializer,
	OrganizationSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
	"""Register new user and create organization"""
	serializer = RegisterSerializer(data=request.data)
	if serializer.is_valid():
		user = serializer.save()
		org = user.organizations.first()
		
		# Generate tokens
		refresh = RefreshToken.for_user(user)
		
		return Response({
			'user': UserSerializer(user).data,
			'org': OrganizationSerializer(org).data,
			'tokens': {
				'access': str(refresh.access_token),
				'refresh': str(refresh)
			}
		}, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
	"""Login and return JWT tokens"""
	serializer = LoginSerializer(data=request.data)
	if serializer.is_valid():
		email = serializer.validated_data['email']
		password = serializer.validated_data['password']
		user = authenticate(request, username=email, password=password)
		
		if user:
			refresh = RefreshToken.for_user(user)
			org = user.organizations.first()
			
			return Response({
				'user': UserSerializer(user).data,
				'org': OrganizationSerializer(org).data if org else None,
				'tokens': {
					'access': str(refresh.access_token),
					'refresh': str(refresh)
				}
			})
		
		return Response(
			{'error': 'Invalid credentials'},
			status=status.HTTP_401_UNAUTHORIZED
		)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
	"""Get current user profile"""
	serializer = UserSerializer(request.user)
	orgs = OrganizationSerializer(request.user.organizations.all(), many=True)
	return Response({
		'user': serializer.data,
		'organizations': orgs.data
	})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_token(request):
	"""Refresh access token"""
	refresh_token = request.data.get('refresh')
	if not refresh_token:
		return Response(
			{'error': 'Refresh token required'},
			status=status.HTTP_400_BAD_REQUEST
		)
	
	try:
		refresh = RefreshToken(refresh_token)
		return Response({
			'access': str(refresh.access_token)
		})
	except Exception as e:
		return Response(
			{'error': 'Invalid refresh token'},
			status=status.HTTP_401_UNAUTHORIZED
		)

