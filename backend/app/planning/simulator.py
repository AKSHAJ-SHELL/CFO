"""
Scenario simulation engine
"""
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, List, Tuple
import calendar


class ScenarioSimulator:
    """Simulate financial scenarios"""
    
    def __init__(self, scenario):
        self.scenario = scenario
        self.adjustments = list(scenario.adjustments.all())
    
    def simulate(self) -> Dict:
        """Run the scenario simulation"""
        # Get base data from organization's historical transactions
        base_data = self._get_base_data()
        
        # Generate month labels
        month_labels = self._generate_month_labels()
        
        # Initialize arrays
        monthly_revenue = []
        monthly_expenses = []
        monthly_profit = []
        monthly_cash_balance = []
        
        # Starting cash (get from organization's current cash balance)
        current_cash = base_data['starting_cash']
        
        # Run simulation for each month
        for month_idx in range(1, self.scenario.forecast_months + 1):
            # Calculate base revenue and expenses
            revenue = self._calculate_revenue(month_idx, base_data['avg_monthly_revenue'])
            expenses = self._calculate_expenses(month_idx, base_data['avg_monthly_expenses'])
            
            # Apply adjustments
            revenue = self._apply_adjustments(revenue, month_idx, 'revenue')
            expenses = self._apply_adjustments(expenses, month_idx, 'expense')
            
            # Apply one-time events
            one_time_amount = self._apply_one_time_events(month_idx)
            current_cash += one_time_amount
            
            # Calculate profit and cash
            profit = revenue - expenses
            current_cash += profit
            
            # Store results
            monthly_revenue.append(float(revenue))
            monthly_expenses.append(float(expenses))
            monthly_profit.append(float(profit))
            monthly_cash_balance.append(float(current_cash))
        
        # Calculate summary metrics
        total_revenue = sum(monthly_revenue)
        total_expenses = sum(monthly_expenses)
        total_profit = sum(monthly_profit)
        profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0
        
        # Cash metrics
        ending_cash = monthly_cash_balance[-1]
        lowest_cash = min(monthly_cash_balance)
        runway_days = self._calculate_runway(monthly_cash_balance, monthly_expenses)
        
        # Break-even analysis
        break_even_month, break_even_revenue = self._calculate_break_even(
            monthly_revenue, monthly_expenses
        )
        
        return {
            'month_labels': month_labels,
            'monthly_revenue': monthly_revenue,
            'monthly_expenses': monthly_expenses,
            'monthly_profit': monthly_profit,
            'monthly_cash_balance': monthly_cash_balance,
            'total_revenue': total_revenue,
            'total_expenses': total_expenses,
            'total_profit': total_profit,
            'profit_margin': round(profit_margin, 2),
            'ending_cash': ending_cash,
            'lowest_cash': lowest_cash,
            'runway_days': runway_days,
            'break_even_month': break_even_month,
            'break_even_revenue': break_even_revenue,
            'confidence_level': Decimal('75.00'),  # Default confidence
        }
    
    def _get_base_data(self) -> Dict:
        """Get base financial data from organization"""
        from app.finance.models import Transaction
        from django.db.models import Avg, Sum
        from datetime import datetime, timedelta
        
        # Get last 3 months of data for baseline
        three_months_ago = datetime.now() - timedelta(days=90)
        
        transactions = Transaction.objects.filter(
            organization=self.scenario.organization,
            date__gte=three_months_ago
        )
        
        # Calculate averages
        revenue_txns = transactions.filter(amount__gt=0)
        expense_txns = transactions.filter(amount__lt=0)
        
        avg_monthly_revenue = revenue_txns.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('10000')
        avg_monthly_revenue = avg_monthly_revenue / 3  # Average over 3 months
        
        avg_monthly_expenses = abs(expense_txns.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('8000'))
        avg_monthly_expenses = avg_monthly_expenses / 3
        
        # Get current cash balance (latest transaction balance or default)
        latest_txn = transactions.order_by('-date').first()
        starting_cash = latest_txn.balance if latest_txn else Decimal('50000')
        
        return {
            'avg_monthly_revenue': avg_monthly_revenue,
            'avg_monthly_expenses': avg_monthly_expenses,
            'starting_cash': starting_cash,
        }
    
    def _generate_month_labels(self) -> List[str]:
        """Generate month labels for the forecast period"""
        labels = []
        start_date = datetime(self.scenario.base_year, self.scenario.base_month, 1)
        
        for i in range(self.scenario.forecast_months):
            current_date = start_date + timedelta(days=30 * i)
            labels.append(current_date.strftime('%b %Y'))
        
        return labels
    
    def _calculate_revenue(self, month: int, base_revenue: Decimal) -> Decimal:
        """Calculate revenue for a given month"""
        # Apply natural growth (default 2% monthly)
        growth_rate = Decimal('1.02')
        return base_revenue * (growth_rate ** (month - 1))
    
    def _calculate_expenses(self, month: int, base_expenses: Decimal) -> Decimal:
        """Calculate expenses for a given month"""
        # Expenses grow slightly slower (1% monthly)
        growth_rate = Decimal('1.01')
        return base_expenses * (growth_rate ** (month - 1))
    
    def _apply_adjustments(self, base_amount: Decimal, month: int, adj_type: str) -> Decimal:
        """Apply adjustments to revenue or expenses"""
        amount = base_amount
        
        for adj in self.adjustments:
            if adj.adjustment_type != adj_type:
                continue
            
            # Check if adjustment applies to this month
            if month < adj.start_month:
                continue
            if adj.end_month and month > adj.end_month:
                continue
            
            # Apply the adjustment
            if adj.change_type == 'percentage':
                # Percentage change
                multiplier = Decimal('1') + (adj.value / Decimal('100'))
                amount *= multiplier
            elif adj.change_type == 'absolute':
                # Absolute amount change
                amount += adj.value
            elif adj.change_type == 'growth_rate':
                # Apply monthly growth rate
                months_since_start = month - adj.start_month
                multiplier = (Decimal('1') + adj.value / Decimal('100')) ** months_since_start
                amount *= multiplier
        
        return amount
    
    def _apply_one_time_events(self, month: int) -> Decimal:
        """Apply one-time events for a specific month"""
        total = Decimal('0')
        
        for adj in self.adjustments:
            if adj.adjustment_type == 'one_time' and adj.start_month == month:
                total += adj.value
        
        return total
    
    def _calculate_runway(self, cash_balances: List[float], expenses: List[float]) -> int:
        """Calculate runway in days"""
        if not expenses:
            return None
        
        avg_daily_burn = sum(expenses) / len(expenses) / 30
        ending_cash = cash_balances[-1]
        
        if avg_daily_burn > 0:
            return int(ending_cash / avg_daily_burn)
        return None
    
    def _calculate_break_even(
        self, revenue: List[float], expenses: List[float]
    ) -> Tuple[int, float]:
        """Calculate break-even point"""
        for month_idx, (rev, exp) in enumerate(zip(revenue, expenses), start=1):
            if rev >= exp:
                return month_idx, rev
        return None, None


class SensitivityAnalyzer:
    """Perform sensitivity analysis on scenarios"""
    
    def __init__(self, scenario):
        self.scenario = scenario
    
    def analyze(self, variables: List[str], variations: List[float] = None) -> Dict:
        """
        Analyze sensitivity to key variables
        variables: List of variable names to test (e.g., ['revenue', 'expenses'])
        variations: Percentage variations to test (e.g., [-25, -10, 0, 10, 25])
        """
        if variations is None:
            variations = [-50, -25, -10, 0, 10, 25, 50]
        
        results = {}
        
        for variable in variables:
            var_results = []
            
            for variation in variations:
                # Create temporary scenario with this variation
                impact = self._test_variation(variable, variation)
                var_results.append({
                    'variation': variation,
                    'ending_cash': impact['ending_cash'],
                    'total_profit': impact['total_profit'],
                    'runway_days': impact['runway_days'],
                })
            
            results[variable] = var_results
        
        return results
    
    def _test_variation(self, variable: str, variation_pct: float) -> Dict:
        """Test a specific variation"""
        # This would temporarily modify the scenario and run simulation
        # For now, return mock data
        simulator = ScenarioSimulator(self.scenario)
        base_result = simulator.simulate()
        
        # Apply the variation impact
        multiplier = 1 + (variation_pct / 100)
        
        if variable == 'revenue':
            return {
                'ending_cash': base_result['ending_cash'] * multiplier,
                'total_profit': base_result['total_profit'] * multiplier,
                'runway_days': base_result['runway_days'],
            }
        elif variable == 'expenses':
            inverse_multiplier = 2 - multiplier  # Inverse effect
            return {
                'ending_cash': base_result['ending_cash'] * inverse_multiplier,
                'total_profit': base_result['total_profit'] * inverse_multiplier,
                'runway_days': int(base_result['runway_days'] * inverse_multiplier) if base_result['runway_days'] else None,
            }
        
        return base_result


class BudgetCalculator:
    """Calculate budget variances and actuals"""
    
    @staticmethod
    def update_budget_actuals(budget):
        """Update actual amounts for all budget line items"""
        from app.finance.models import Transaction
        from django.db.models import Sum
        
        # Get transactions in budget period
        transactions = Transaction.objects.filter(
            organization=budget.organization,
            date__gte=budget.start_date,
            date__lte=budget.end_date
        )
        
        # Update each line item
        for line_item in budget.line_items.all():
            # Get transactions matching this category
            category_txns = transactions.filter(
                category__icontains=line_item.category_name
            )
            
            if line_item.department:
                # Further filter by department if applicable
                pass
            
            # Sum expenses (negative amounts)
            actual_amount = abs(category_txns.filter(amount__lt=0).aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0'))
            
            # Update line item
            line_item.update_actuals(actual_amount)
        
        return budget
    
    @staticmethod
    def check_budget_alerts(budget):
        """Check if any budget thresholds are crossed and return alerts"""
        alerts = []
        
        for line_item in budget.line_items.all():
            utilization = (line_item.actual_amount / line_item.budgeted_amount * 100) if line_item.budgeted_amount > 0 else 0
            
            # Check thresholds
            if utilization >= 100 and not line_item.alert_sent_100 and budget.alert_at_100_percent:
                alerts.append({
                    'level': 'critical',
                    'category': line_item.category_name,
                    'message': f"{line_item.category_name} budget exceeded: {utilization:.1f}% used",
                    'utilization': utilization,
                })
                line_item.alert_sent_100 = True
                line_item.save()
            
            elif utilization >= 90 and not line_item.alert_sent_90 and budget.alert_at_90_percent:
                alerts.append({
                    'level': 'warning',
                    'category': line_item.category_name,
                    'message': f"{line_item.category_name} budget at {utilization:.1f}%",
                    'utilization': utilization,
                })
                line_item.alert_sent_90 = True
                line_item.save()
            
            elif utilization >= 75 and not line_item.alert_sent_75 and budget.alert_at_75_percent:
                alerts.append({
                    'level': 'info',
                    'category': line_item.category_name,
                    'message': f"{line_item.category_name} budget at {utilization:.1f}%",
                    'utilization': utilization,
                })
                line_item.alert_sent_75 = True
                line_item.save()
        
        return alerts

