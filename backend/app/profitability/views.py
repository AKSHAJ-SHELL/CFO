"""Views for Profitability Intelligence"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Product, Project, CustomerProfitability, ProductProfitability, TimeEntry
from .serializers import ProductSerializer, ProjectSerializer, CustomerProfitabilitySerializer, ProductProfitabilitySerializer, TimeEntrySerializer

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Product.objects.filter(organization_id=self.kwargs['org_id'])
    
    def perform_create(self, serializer):
        serializer.save(organization_id=self.kwargs['org_id'])

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Project.objects.filter(organization_id=self.kwargs['org_id'])
    
    def perform_create(self, serializer):
        serializer.save(organization_id=self.kwargs['org_id'], created_by=self.request.user)

class CustomerProfitabilityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CustomerProfitabilitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CustomerProfitability.objects.filter(organization_id=self.kwargs['org_id'])
    
    @action(detail=False, methods=['get'])
    def top_customers(self, request, org_id=None):
        top = self.get_queryset().order_by('-net_profit')[:10]
        return Response(CustomerProfitabilitySerializer(top, many=True).data)

class ProductProfitabilityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductProfitabilitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ProductProfitability.objects.filter(organization_id=self.kwargs['org_id'])

class TimeEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TimeEntrySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TimeEntry.objects.filter(organization_id=self.kwargs['org_id'])
    
    def perform_create(self, serializer):
        serializer.save(organization_id=self.kwargs['org_id'], user=self.request.user)

