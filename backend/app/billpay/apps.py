"""
Bill Pay app configuration
"""
from django.apps import AppConfig


class BillPayConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.billpay'
    verbose_name = 'Bill Pay Automation'

