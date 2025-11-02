"""
Admin configuration for users app
"""
from django.contrib import admin
from .models import User, Organization, ActionLog


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
	list_display = ('email', 'name', 'plan', 'is_active', 'created_at')
	list_filter = ('plan', 'is_active', 'is_staff')
	search_fields = ('email', 'name')
	readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
	list_display = ('name', 'owner', 'currency', 'created_at')
	list_filter = ('currency', 'created_at')
	search_fields = ('name', 'owner__email')
	readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(ActionLog)
class ActionLogAdmin(admin.ModelAdmin):
	list_display = ('action_type', 'user', 'organization', 'created_at')
	list_filter = ('action_type', 'created_at')
	search_fields = ('action_type', 'description')
	readonly_fields = ('id', 'created_at')

