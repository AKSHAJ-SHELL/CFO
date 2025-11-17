"""Serializers for Reserves"""
from rest_framework import serializers
from .models import ReserveGoal, SavingsAccount, AutoTransfer

class ReserveGoalSerializer(serializers.ModelSerializer):
    progress_percent = serializers.SerializerMethodField()
    
    class Meta:
        model = ReserveGoal
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_progress_percent(self, obj):
        if obj.target_amount > 0:
            return round((obj.current_amount / obj.target_amount) * 100, 2)
        return 0

class SavingsAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsAccount
        fields = '__all__'

class AutoTransferSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutoTransfer
        fields = '__all__'

