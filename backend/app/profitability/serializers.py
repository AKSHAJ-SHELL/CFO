"""Serializers for Profitability"""
from rest_framework import serializers
from .models import Product, Project, CustomerProfitability, ProductProfitability, TimeEntry, CostAllocation, LTVPrediction

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProjectSerializer(serializers.ModelSerializer):
    profit = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_profit(self, obj):
        return float(obj.actual_revenue - obj.actual_cost)

class CustomerProfitabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfitability
        fields = '__all__'

class ProductProfitabilitySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = ProductProfitability
        fields = '__all__'

class TimeEntrySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = TimeEntry
        fields = '__all__'
        read_only_fields = ['id', 'total_cost']

class LTVPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LTVPrediction
        fields = '__all__'

