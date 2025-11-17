"""Serializers for Health Score"""
from rest_framework import serializers
from .models import HealthScore, Benchmark, HealthRecommendation

class HealthScoreSerializer(serializers.ModelSerializer):
    recommendations = serializers.SerializerMethodField()
    
    class Meta:
        model = HealthScore
        fields = '__all__'
    
    def get_recommendations(self, obj):
        recs = obj.recommendations.all()[:5]
        return HealthRecommendationSerializer(recs, many=True).data

class BenchmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Benchmark
        fields = '__all__'

class HealthRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthRecommendation
        fields = '__all__'

