"""
Serializers for users app
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Organization


class UserSerializer(serializers.ModelSerializer):
	"""User serializer"""
	class Meta:
		model = User
		fields = ('id', 'email', 'name', 'plan', 'created_at')
		read_only_fields = ('id', 'created_at')


class OrganizationSerializer(serializers.ModelSerializer):
	"""Organization serializer"""
	class Meta:
		model = Organization
		fields = ('id', 'name', 'timezone', 'currency', 'created_at')
		read_only_fields = ('id', 'created_at')


class RegisterSerializer(serializers.Serializer):
	"""Registration serializer"""
	email = serializers.EmailField()
	password = serializers.CharField(write_only=True, validators=[validate_password])
	password_confirm = serializers.CharField(write_only=True)
	name = serializers.CharField(max_length=255)
	org_name = serializers.CharField(max_length=255)

	def validate(self, attrs):
		if attrs['password'] != attrs['password_confirm']:
			raise serializers.ValidationError({'password': 'Passwords do not match'})
		return attrs

	def create(self, validated_data):
		user = User.objects.create_user(
			email=validated_data['email'],
			password=validated_data['password'],
			name=validated_data['name']
		)
		Organization.objects.create(
			owner=user,
			name=validated_data['org_name']
		)
		return user


class LoginSerializer(serializers.Serializer):
	"""Login serializer"""
	email = serializers.EmailField()
	password = serializers.CharField(write_only=True)

