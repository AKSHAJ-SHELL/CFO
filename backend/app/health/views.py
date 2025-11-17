"""Views for Health Score"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import HealthScore, Benchmark
from .serializers import HealthScoreSerializer, BenchmarkSerializer
from .scoring_engine import HealthScoringEngine

class HealthScoreViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HealthScoreSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return HealthScore.objects.filter(organization_id=self.kwargs['org_id'])
    
    @action(detail=False, methods=['post'])
    def calculate(self, request, org_id=None):
        """Calculate new health score"""
        from app.users.models import Organization
        org = Organization.objects.get(id=org_id)
        
        engine = HealthScoringEngine(org)
        scores = engine.calculate_overall_score()
        
        health_score = HealthScore.objects.create(
            organization=org,
            **scores
        )
        
        return Response(HealthScoreSerializer(health_score).data)

class BenchmarkViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BenchmarkSerializer
    permission_classes = [IsAuthenticated]
    queryset = Benchmark.objects.all()
    
    @action(detail=False, methods=['get'])
    def for_industry(self, request):
        """Get benchmarks for specific industry"""
        industry = request.query_params.get('industry')
        if industry:
            benchmarks = Benchmark.objects.filter(industry__icontains=industry)
            return Response(BenchmarkSerializer(benchmarks, many=True).data)
        return Response({'error': 'industry parameter required'}, status=400)

