"""
Planning app configuration
"""
from django.apps import AppConfig


class PlanningConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app.planning'
    verbose_name = 'Scenario Planning & Budgets'
