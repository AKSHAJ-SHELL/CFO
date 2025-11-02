from django.contrib import admin
from .models import BillingSubscription


@admin.register(BillingSubscription)
class BillingSubscriptionAdmin(admin.ModelAdmin):
	list_display = ('org', 'plan', 'status', 'current_period_end')
	list_filter = ('plan', 'status')
	search_fields = ('org__name',)

