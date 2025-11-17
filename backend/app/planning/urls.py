"""
URL routing for Scenario Planning & Budget Simulator
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# Main routes
router.register(r'scenarios', views.ScenarioViewSet, basename='scenario')
router.register(r'budgets', views.BudgetViewSet, basename='budget')
router.register(r'goals', views.GoalViewSet, basename='goal')

# Nested route for scenario adjustments
app_name = 'planning'

urlpatterns = [
    path('', include(router.urls)),
    
    # Nested scenario adjustments
    path('scenarios/<uuid:scenario_id>/adjustments/',
         views.ScenarioAdjustmentViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='scenario-adjustments'),
    path('scenarios/<uuid:scenario_id>/adjustments/<uuid:pk>/',
         views.ScenarioAdjustmentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}),
         name='scenario-adjustment-detail'),
    
    # Nested budget line items
    path('budgets/<uuid:budget_id>/line-items/',
         views.BudgetLineItemViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='budget-line-items'),
    path('budgets/<uuid:budget_id>/line-items/<uuid:pk>/',
         views.BudgetLineItemViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}),
         name='budget-line-item-detail'),
]

