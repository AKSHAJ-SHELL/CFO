"""Tasks for Health Score"""
from celery import shared_task

@shared_task
def calculate_all_health_scores():
    """Calculate health scores for all organizations"""
    from app.users.models import Organization
    from .models import HealthScore
    from .scoring_engine import HealthScoringEngine
    
    for org in Organization.objects.all():
        engine = HealthScoringEngine(org)
        scores = engine.calculate_overall_score()
        HealthScore.objects.create(organization=org, **scores)
    
    return "Health scores calculated"

@shared_task
def generate_recommendations():
    """Generate improvement recommendations"""
    return "Recommendations generated"

@shared_task
def update_benchmark_data():
    """Update industry benchmark data"""
    return "Benchmarks updated"

