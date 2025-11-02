from django.contrib import admin
from .models import Transaction, Forecast, Anomaly, Report, ExpenseCategory


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
	list_display = ('date', 'description', 'amount', 'category', 'org')
	list_filter = ('category', 'date', 'org')
	search_fields = ('description',)
	readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Forecast)
class ForecastAdmin(admin.ModelAdmin):
	list_display = ('org', 'generated_at', 'horizon_days', 'runway_days')
	list_filter = ('generated_at',)
	readonly_fields = ('id', 'generated_at')


@admin.register(Anomaly)
class AnomalyAdmin(admin.ModelAdmin):
	list_display = ('transaction', 'score', 'resolved', 'created_at')
	list_filter = ('resolved', 'created_at')
	readonly_fields = ('id', 'created_at')


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
	list_display = ('org', 'period_start', 'period_end', 'created_at')
	list_filter = ('created_at',)
	readonly_fields = ('id', 'created_at')


@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
	list_display = ('name', 'org', 'parent')
	list_filter = ('org',)

