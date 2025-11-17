"""Views for Cash Reserves"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ReserveGoal, SavingsAccount, AutoTransfer
from .serializers import ReserveGoalSerializer, SavingsAccountSerializer, AutoTransferSerializer
from .calculator import ReserveCalculator

class ReserveGoalViewSet(viewsets.ModelViewSet):
    serializer_class = ReserveGoalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ReserveGoal.objects.filter(organization_id=self.kwargs['org_id'])
    
    def perform_create(self, serializer):
        serializer.save(organization_id=self.kwargs['org_id'])
    
    @action(detail=False, methods=['post'])
    def calculate_recommendations(self, request, org_id=None):
        """Calculate recommended reserve amounts"""
        monthly_expenses = request.data.get('monthly_expenses', 10000)
        calculator = ReserveCalculator()
        
        return Response({
            'emergency_fund': float(calculator.calculate_emergency_fund(monthly_expenses)),
            'tax_reserve': float(calculator.calculate_tax_reserve(monthly_expenses * 12)),
        })

class SavingsAccountViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsAccountSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SavingsAccount.objects.filter(organization_id=self.kwargs['org_id'])
    
    def perform_create(self, serializer):
        serializer.save(organization_id=self.kwargs['org_id'])

class AutoTransferViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AutoTransferSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AutoTransfer.objects.filter(reserve_goal__organization_id=self.kwargs['org_id'])

