"""
Views for Bill Pay Automation
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.shortcuts import get_object_or_404
from decimal import Decimal

from .models import (
    Vendor, Bill, BillLineItem, ApprovalWorkflow, ApprovalRule,
    ApprovalRequest, RecurringSchedule, PaymentBatch, BillPayment
)
from .serializers import (
    VendorSerializer, BillSerializer, ApprovalWorkflowSerializer,
    RecurringScheduleSerializer, PaymentBatchSerializer, BillPaymentSerializer
)


class VendorViewSet(viewsets.ModelViewSet):
    """ViewSet for vendors"""
    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        org_id = self.kwargs.get('org_id')
        return Vendor.objects.filter(organization_id=org_id)
    
    def perform_create(self, serializer):
        serializer.save(organization_id=self.kwargs['org_id'], created_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def spending_report(self, request, org_id=None, pk=None):
        """Get vendor spending report"""
        vendor = self.get_object()
        bills = vendor.bills.filter(status='paid')
        
        from datetime import date, timedelta
        from django.db.models import Sum, Count
        
        # Last 12 months
        twelve_months_ago = date.today() - timedelta(days=365)
        recent_bills = bills.filter(bill_date__gte=twelve_months_ago)
        
        return Response({
            'vendor_name': vendor.name,
            'total_lifetime_spent': float(vendor.total_paid),
            'total_bills': vendor.total_bills,
            'average_bill': float(vendor.average_bill_amount),
            'last_12_months': {
                'total_spent': float(recent_bills.aggregate(Sum('total_amount'))['total_amount__sum'] or 0),
                'bill_count': recent_bills.count(),
            },
            'payment_terms': vendor.payment_terms,
            'on_time_rate': float(vendor.on_time_payment_rate)
        })


class BillViewSet(viewsets.ModelViewSet):
    """ViewSet for bills"""
    serializer_class = BillSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        org_id = self.kwargs.get('org_id')
        queryset = Bill.objects.filter(organization_id=org_id).select_related('vendor')
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(organization_id=self.kwargs['org_id'], created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def submit_for_approval(self, request, org_id=None, pk=None):
        """Submit bill for approval"""
        bill = self.get_object()
        
        if bill.status != 'draft':
            return Response({'error': 'Bill must be in draft status'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create approval requests based on workflow
        from .approval_engine import ApprovalEngine
        engine = ApprovalEngine(bill)
        approval_requests = engine.create_approval_requests()
        
        bill.status = 'pending_approval'
        bill.save()
        
        return Response({
            'success': True,
            'message': f'Bill submitted for approval to {len(approval_requests)} approvers',
            'bill': BillSerializer(bill).data
        })
    
    @action(detail=True, methods=['post'])
    def approve(self, request, org_id=None, pk=None):
        """Approve a bill"""
        bill = self.get_object()
        comments = request.data.get('comments', '')
        
        # Find pending approval request for this user
        approval = bill.approval_requests.filter(
            approver=request.user,
            status='pending'
        ).first()
        
        if not approval:
            return Response({'error': 'No pending approval for this user'}, status=status.HTTP_400_BAD_REQUEST)
        
        approval.status = 'approved'
        approval.decision_date = timezone.now()
        approval.comments = comments
        approval.save()
        
        # Check if all approvals are complete
        pending_count = bill.approval_requests.filter(status='pending').count()
        if pending_count == 0:
            bill.status = 'approved'
            bill.save()
        
        return Response({
            'success': True,
            'message': 'Bill approved',
            'pending_approvals': pending_count
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, org_id=None, pk=None):
        """Reject a bill"""
        bill = self.get_object()
        comments = request.data.get('comments', '')
        
        approval = bill.approval_requests.filter(
            approver=request.user,
            status='pending'
        ).first()
        
        if not approval:
            return Response({'error': 'No pending approval for this user'}, status=status.HTTP_400_BAD_REQUEST)
        
        approval.status = 'rejected'
        approval.decision_date = timezone.now()
        approval.comments = comments
        approval.save()
        
        bill.status = 'rejected'
        bill.save()
        
        return Response({'success': True, 'message': 'Bill rejected'})
    
    @action(detail=True, methods=['post'])
    def schedule_payment(self, request, org_id=None, pk=None):
        """Schedule bill for payment"""
        bill = self.get_object()
        payment_date = request.data.get('payment_date')
        
        if not payment_date:
            return Response({'error': 'payment_date is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        bill.scheduled_payment_date = payment_date
        bill.status = 'scheduled'
        bill.save()
        
        return Response({'success': True, 'bill': BillSerializer(bill).data})
    
    @action(detail=False, methods=['get'])
    def ap_aging(self, request, org_id=None):
        """Generate AP aging report"""
        from datetime import date
        from decimal import Decimal
        
        bills = self.get_queryset().exclude(status__in=['paid', 'cancelled'])
        today = date.today()
        
        aging = {
            'current': Decimal('0'),
            'days_1_30': Decimal('0'),
            'days_31_60': Decimal('0'),
            'days_61_90': Decimal('0'),
            'days_over_90': Decimal('0'),
        }
        
        for bill in bills:
            days_until_due = (bill.due_date - today).days
            amount = bill.amount_remaining()
            
            if days_until_due >= 0:
                aging['current'] += amount
            elif days_until_due >= -30:
                aging['days_1_30'] += amount
            elif days_until_due >= -60:
                aging['days_31_60'] += amount
            elif days_until_due >= -90:
                aging['days_61_90'] += amount
            else:
                aging['days_over_90'] += amount
        
        return Response({
            'aging_buckets': {k: float(v) for k, v in aging.items()},
            'total_payable': float(sum(aging.values())),
            'generated_at': timezone.now()
        })


class ApprovalWorkflowViewSet(viewsets.ModelViewSet):
    """ViewSet for approval workflows"""
    serializer_class = ApprovalWorkflowSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        org_id = self.kwargs.get('org_id')
        return ApprovalWorkflow.objects.filter(organization_id=org_id)
    
    def perform_create(self, serializer):
        serializer.save(organization_id=self.kwargs['org_id'], created_by=self.request.user)


class RecurringScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for recurring schedules"""
    serializer_class = RecurringScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        org_id = self.kwargs.get('org_id')
        return RecurringSchedule.objects.filter(organization_id=org_id)
    
    def perform_create(self, serializer):
        serializer.save(organization_id=self.kwargs['org_id'], created_by=self.request.user)


class PaymentBatchViewSet(viewsets.ModelViewSet):
    """ViewSet for payment batches"""
    serializer_class = PaymentBatchSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        org_id = self.kwargs.get('org_id')
        return PaymentBatch.objects.filter(organization_id=org_id)
    
    def perform_create(self, serializer):
        serializer.save(organization_id=self.kwargs['org_id'], created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def process(self, request, org_id=None, pk=None):
        """Process payment batch"""
        batch = self.get_object()
        
        if batch.status != 'scheduled':
            return Response({'error': 'Batch must be scheduled'}, status=status.HTTP_400_BAD_REQUEST)
        
        batch.status = 'processing'
        batch.save()
        
        # Process payments asynchronously
        from .tasks import process_payment_batch
        process_payment_batch.delay(str(batch.id))
        
        return Response({'success': True, 'message': 'Batch processing started'})

