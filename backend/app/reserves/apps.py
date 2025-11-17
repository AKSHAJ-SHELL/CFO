"""Reserves app configuration"""
from django.apps import AppConfig

class ReservesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.reserves'
    verbose_name = 'Cash Reserves & Savings'

