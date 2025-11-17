"""
Views for Scenario Planning & Budget Simulator
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import (
    Scenario, ScenarioAdjustment, ScenarioResult,
    Budget, BudgetLineItem, Goal
)
from .serializers import (
    ScenarioSerializer, ScenarioAdjustmentSerializer, ScenarioResultSerializer,
    BudgetSerializer, BudgetLineItemSerializer, GoalSerializer,
    ScenarioComparisonSerializer
)
from .simulator import ScenarioSimulator, SensitivityAnalyzer, BudgetCalculator


class ScenarioViewSet(viewsets.ModelViewSet):
    """ViewSet for financial scenarios"""
    serializer_class = ScenarioSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        org_id = self.kwargs.get('org_id')
        return Scenario.objects.filter(organization_id=org_id).prefetch_related('adjustments', 'results')
    
    def perform_create(self, serializer):
        org_id = self.kwargs.get('org_id')
        serializer.save(
            organization_id=org_id,
            created_by=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def simulate(self, request, org_id=None, pk=None):
        """Run simulation for this scenario"""
        scenario = self.get_object()
        
        try:
            # Run simulation
            simulator = ScenarioSimulator(scenario)
            results = simulator.simulate()
            
            # Save results
            result = ScenarioResult.objects.create(
                scenario=scenario,
                **results
            )
            
            # Update scenario
            scenario.last_simulated_at = timezone.now()
            scenario.save()
            
            return Response({
                'success': True,
                'message': 'Simulation completed successfully',
                'results': ScenarioResultSerializer(result).data
            })
        
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def sensitivity(self, request, org_id=None, pk=None):
        """Perform sensitivity analysis on this scenario"""
        scenario = self.get_object()
        
        # Get variables to test from query params
        variables = request.query_params.getlist('variables', ['revenue', 'expenses'])
        
        try:
            analyzer = SensitivityAnalyzer(scenario)
            results = analyzer.analyze(variables)
            
            return Response({
                'success': True,
                'scenario_name': scenario.name,
                'analysis': results
            })
        
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def compare(self, request, org_id=None):
        """Compare multiple scenarios side-by-side"""
        serializer = ScenarioComparisonSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        scenario_ids = serializer.validated_data['scenario_ids']
        scenarios = Scenario.objects.filter(
            id__in=scenario_ids,
            organization_id=org_id
        ).prefetch_related('results')
        
        if scenarios.count() != len(scenario_ids):
            return Response({
                'error': 'One or more scenarios not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        comparison_data = []
        for scenario in scenarios:
            latest_result = scenario.results.first()
            comparison_data.append({
                'id': str(scenario.id),
                'name': scenario.name,
                'scenario_type': scenario.scenario_type,
                'result': ScenarioResultSerializer(latest_result).data if latest_result else None
            })
        
        return Response({
            'success': True,
            'scenarios': comparison_data
        })
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, org_id=None, pk=None):
        """Create a copy of this scenario"""
        original = self.get_object()
        
        # Create new scenario
        new_scenario = Scenario.objects.create(
            organization_id=org_id,
            name=f"{original.name} (Copy)",
            description=original.description,
            scenario_type=original.scenario_type,
            base_year=original.base_year,
            base_month=original.base_month,
            forecast_months=original.forecast_months,
            created_by=request.user,
        )
        
        # Copy adjustments
        for adj in original.adjustments.all():
            ScenarioAdjustment.objects.create(
                scenario=new_scenario,
                name=adj.name,
                adjustment_type=adj.adjustment_type,
                change_type=adj.change_type,
                value=adj.value,
                category=adj.category,
                start_month=adj.start_month,
                end_month=adj.end_month,
                description=adj.description,
                assumptions=adj.assumptions,
            )
        
        return Response({
            'success': True,
            'scenario': ScenarioSerializer(new_scenario).data
        }, status=status.HTTP_201_CREATED)


class ScenarioAdjustmentViewSet(viewsets.ModelViewSet):
    """ViewSet for scenario adjustments"""
    serializer_class = ScenarioAdjustmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        org_id = self.kwargs.get('org_id')
        scenario_id = self.kwargs.get('scenario_id')
        return ScenarioAdjustment.objects.filter(
            scenario_id=scenario_id,
            scenario__organization_id=org_id
        )
    
    def perform_create(self, serializer):
        scenario_id = self.kwargs.get('scenario_id')
        scenario = get_object_or_404(Scenario, id=scenario_id)
        serializer.save(scenario=scenario)


class BudgetViewSet(viewsets.ModelViewSet):
    """ViewSet for budgets"""
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        org_id = self.kwargs.get('org_id')
        return Budget.objects.filter(organization_id=org_id).prefetch_related('line_items')
    
    def perform_create(self, serializer):
        org_id = self.kwargs.get('org_id')
        serializer.save(
            organization_id=org_id,
            created_by=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def approve(self, request, org_id=None, pk=None):
        """Approve a budget"""
        budget = self.get_object()
        budget.is_approved = True
        budget.approved_by = request.user
        budget.approved_at = timezone.now()
        budget.save()
        
        return Response({
            'success': True,
            'message': 'Budget approved successfully',
            'budget': BudgetSerializer(budget).data
        })
    
    @action(detail=True, methods=['post'])
    def update_actuals(self, request, org_id=None, pk=None):
        """Update actual amounts from transactions"""
        budget = self.get_object()
        
        try:
            updated_budget = BudgetCalculator.update_budget_actuals(budget)
            
            return Response({
                'success': True,
                'message': 'Actuals updated successfully',
                'budget': BudgetSerializer(updated_budget).data
            })
        
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def alerts(self, request, org_id=None, pk=None):
        """Get budget alerts"""
        budget = self.get_object()
        
        try:
            alerts = BudgetCalculator.check_budget_alerts(budget)
            
            return Response({
                'success': True,
                'budget_name': budget.name,
                'alerts': alerts,
                'alert_count': len(alerts)
            })
        
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def variance_report(self, request, org_id=None, pk=None):
        """Generate variance report"""
        budget = self.get_object()
        
        line_items = []
        for item in budget.line_items.all():
            utilization = (item.actual_amount / item.budgeted_amount * 100) if item.budgeted_amount > 0 else 0
            
            line_items.append({
                'category': item.category_name,
                'department': item.department,
                'budgeted': float(item.budgeted_amount),
                'actual': float(item.actual_amount),
                'variance': float(item.variance_amount),
                'variance_percent': float(item.variance_percent),
                'utilization': round(utilization, 2),
                'status': 'over' if item.variance_amount > 0 else 'under'
            })
        
        # Sort by variance (most over budget first)
        line_items.sort(key=lambda x: x['variance'], reverse=True)
        
        return Response({
            'success': True,
            'budget_name': budget.name,
            'period': f"{budget.start_date} to {budget.end_date}",
            'total_budgeted': float(budget.total_amount),
            'total_actual': sum(item['actual'] for item in line_items),
            'total_variance': sum(item['variance'] for item in line_items),
            'line_items': line_items
        })


class BudgetLineItemViewSet(viewsets.ModelViewSet):
    """ViewSet for budget line items"""
    serializer_class = BudgetLineItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        org_id = self.kwargs.get('org_id')
        budget_id = self.kwargs.get('budget_id')
        return BudgetLineItem.objects.filter(
            budget_id=budget_id,
            budget__organization_id=org_id
        )
    
    def perform_create(self, serializer):
        budget_id = self.kwargs.get('budget_id')
        budget = get_object_or_404(Budget, id=budget_id)
        serializer.save(budget=budget)


class GoalViewSet(viewsets.ModelViewSet):
    """ViewSet for financial goals"""
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        org_id = self.kwargs.get('org_id')
        queryset = Goal.objects.filter(organization_id=org_id)
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by active if provided
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    def perform_create(self, serializer):
        org_id = self.kwargs.get('org_id')
        serializer.save(
            organization_id=org_id,
            created_by=self.request.user,
            owner=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, org_id=None, pk=None):
        """Update goal progress"""
        goal = self.get_object()
        current_value = request.data.get('current_value')
        
        if current_value is None:
            return Response({
                'error': 'current_value is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from decimal import Decimal
            current_value = Decimal(str(current_value))
            goal.update_progress(current_value)
            
            return Response({
                'success': True,
                'message': 'Goal progress updated',
                'goal': GoalSerializer(goal).data
            })
        
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request, org_id=None):
        """Get goals dashboard summary"""
        goals = self.get_queryset()
        
        summary = {
            'total_goals': goals.count(),
            'on_track': goals.filter(status='on_track').count(),
            'at_risk': goals.filter(status='at_risk').count(),
            'off_track': goals.filter(status='off_track').count(),
            'achieved': goals.filter(status='achieved').count(),
        }
        
        # Get goals by type
        by_type = {}
        for goal_type, _ in Goal.GOAL_TYPE_CHOICES:
            by_type[goal_type] = goals.filter(goal_type=goal_type).count()
        
        # Recent goals
        recent = goals.order_by('-created_at')[:5]
        
        return Response({
            'success': True,
            'summary': summary,
            'by_type': by_type,
            'recent_goals': GoalSerializer(recent, many=True).data
        })

