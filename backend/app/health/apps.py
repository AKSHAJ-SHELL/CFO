"""Health Score app configuration"""
from django.apps import AppConfig

class HealthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.health'
    verbose_name = 'Financial Health Score'

