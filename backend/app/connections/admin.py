from django.contrib import admin
from .models import AccountConnection


@admin.register(AccountConnection)
class AccountConnectionAdmin(admin.ModelAdmin):
	list_display = ('name', 'provider', 'status', 'org', 'last_synced_at')
	list_filter = ('provider', 'status', 'created_at')
	search_fields = ('name',)
	readonly_fields = ('id', 'created_at', 'updated_at')

