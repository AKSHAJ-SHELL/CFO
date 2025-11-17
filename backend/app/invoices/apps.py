"""
Invoices app configuration
"""
from django.apps import AppConfig


class InvoicesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.invoices'
    verbose_name = 'Invoice Management'

