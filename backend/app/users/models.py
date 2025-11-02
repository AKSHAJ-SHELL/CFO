"""
User and Organization models
"""
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone


class UserManager(BaseUserManager):
	"""Custom user manager"""

	def create_user(self, email, password=None, **extra_fields):
		if not email:
			raise ValueError('The Email field must be set')
		email = self.normalize_email(email)
		user = self.model(email=email, **extra_fields)
		user.set_password(password)
		user.save(using=self._db)
		return user

	def create_superuser(self, email, password=None, **extra_fields):
		extra_fields.setdefault('is_staff', True)
		extra_fields.setdefault('is_superuser', True)
		return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser):
	"""Custom user model"""
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	email = models.EmailField(unique=True)
	name = models.CharField(max_length=255)
	password = models.CharField(max_length=128)  # Django hashes this
	is_active = models.BooleanField(default=True)
	is_staff = models.BooleanField(default=False)
	is_superuser = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	plan = models.CharField(
		max_length=20,
		choices=[('free', 'Free'), ('standard', 'Standard'), ('pro', 'Pro')],
		default='standard'
	)
	stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = ['name']

	objects = UserManager()

	def __str__(self):
		return self.email

	class Meta:
		db_table = 'users'


class Organization(models.Model):
	"""Business organization model"""
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	owner = models.ForeignKey(
		User,
		on_delete=models.CASCADE,
		related_name='organizations'
	)
	name = models.CharField(max_length=255)
	timezone = models.CharField(max_length=50, default='UTC')
	currency = models.CharField(max_length=10, default='USD')
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.name

	class Meta:
		db_table = 'organizations'


class ActionLog(models.Model):
	"""Audit log for important actions"""
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
	organization = models.ForeignKey(
		Organization,
		on_delete=models.CASCADE,
		related_name='action_logs'
	)
	action_type = models.CharField(max_length=100)
	description = models.TextField()
	metadata = models.JSONField(default=dict)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		db_table = 'action_logs'
		ordering = ['-created_at']

