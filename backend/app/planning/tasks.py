"""
Celery tasks for Scenario Planning & Budgets
"""
from celery import shared_task
from django.utils import timezone
from decimal import Decimal


@shared_task
def update_budget_actuals():
    """Update actual amounts for all active budgets"""
    from .models import Budget
    from .simulator import BudgetCalculator
    
    active_budgets = Budget.objects.filter(is_active=True)
    
    updated_count = 0
    for budget in active_budgets:
        try:
            BudgetCalculator.update_budget_actuals(budget)
            updated_count += 1
        except Exception as e:
            print(f"Error updating budget {budget.id}: {e}")
    
    return f"Updated {updated_count} budgets"


@shared_task
def check_budget_alerts():
    """Check all budgets for threshold crossings and send alerts"""
    from .models import Budget
    from .simulator import BudgetCalculator
    
    active_budgets = Budget.objects.filter(is_active=True)
    
    all_alerts = []
    for budget in active_budgets:
        try:
            alerts = BudgetCalculator.check_budget_alerts(budget)
            if alerts:
                all_alerts.extend([{
                    'budget_name': budget.name,
                    'org_id': str(budget.organization_id),
                    **alert
                } for alert in alerts])
                
                # TODO: Send email/notification to budget owner
        except Exception as e:
            print(f"Error checking budget alerts for {budget.id}: {e}")
    
    return f"Generated {len(all_alerts)} alerts"


@shared_task
def update_goal_progress():
    """Update progress for all active goals"""
    from .models import Goal
    from app.finance.models import Transaction
    from django.db.models import Sum
    from datetime import date
    
    active_goals = Goal.objects.filter(is_active=True, target_date__gte=date.today())
    
    updated_count = 0
    for goal in active_goals:
        try:
            # Calculate current value based on goal type
            if goal.goal_type == 'revenue':
                # Sum revenue since goal start
                revenue = Transaction.objects.filter(
                    organization=goal.organization,
                    date__gte=goal.start_date,
                    date__lte=date.today(),
                    amount__gt=0
                ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
                goal.update_progress(revenue)
                updated_count += 1
            
            elif goal.goal_type == 'profit':
                # Calculate profit
                txns = Transaction.objects.filter(
                    organization=goal.organization,
                    date__gte=goal.start_date,
                    date__lte=date.today()
                )
                profit = txns.aggregate(total=Sum('amount'))['total'] or Decimal('0')
                goal.update_progress(profit)
                updated_count += 1
            
            elif goal.goal_type == 'cash':
                # Get current cash balance
                latest = Transaction.objects.filter(
                    organization=goal.organization
                ).order_by('-date').first()
                if latest:
                    goal.update_progress(latest.balance)
                    updated_count += 1
            
            # Add other goal types as needed
        
        except Exception as e:
            print(f"Error updating goal {goal.id}: {e}")
    
    return f"Updated {updated_count} goals"


@shared_task
def run_scheduled_scenarios():
    """Run simulations for scenarios that need updates"""
    from .models import Scenario
    from .simulator import ScenarioSimulator
    from datetime import timedelta
    
    # Find scenarios that haven't been simulated in 24 hours
    cutoff = timezone.now() - timedelta(hours=24)
    scenarios = Scenario.objects.filter(
        is_active=True
    ).filter(
        last_simulated_at__lt=cutoff
    ) | Scenario.objects.filter(
        is_active=True,
        last_simulated_at__isnull=True
    )
    
    simulated_count = 0
    for scenario in scenarios:
        try:
            simulator = ScenarioSimulator(scenario)
            results = simulator.simulate()
            
            from .models import ScenarioResult
            ScenarioResult.objects.create(
                scenario=scenario,
                **results
            )
            
            scenario.last_simulated_at = timezone.now()
            scenario.save()
            
            simulated_count += 1
        except Exception as e:
            print(f"Error simulating scenario {scenario.id}: {e}")
    
    return f"Simulated {simulated_count} scenarios"


@shared_task
def generate_budget_recommendations():
    """Generate AI-powered budget recommendations"""
    from .models import Budget, BudgetLineItem
    from app.finance.models import Transaction
    from django.db.models import Avg, Sum
    from datetime import timedelta, date
    
    # For each organization, analyze spending patterns
    from app.users.models import Organization
    
    recommendations = []
    for org in Organization.objects.all():
        # Get last 3 months of transactions
        three_months_ago = date.today() - timedelta(days=90)
        
        txns = Transaction.objects.filter(
            organization=org,
            date__gte=three_months_ago,
            amount__lt=0  # Expenses only
        )
        
        # Group by category
        from collections import defaultdict
        category_spending = defaultdict(Decimal)
        
        for txn in txns:
            category_spending[txn.category] += abs(txn.amount)
        
        # Calculate monthly averages
        for category, total in category_spending.items():
            monthly_avg = total / 3
            
            # Suggest budget allocation (10% buffer)
            suggested_budget = monthly_avg * Decimal('1.10')
            
            recommendations.append({
                'org_id': str(org.id),
                'category': category,
                'suggested_monthly_budget': float(suggested_budget),
                'based_on_avg': float(monthly_avg),
            })
    
    return f"Generated {len(recommendations)} budget recommendations"

