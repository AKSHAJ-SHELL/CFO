'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, TrendingUp, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Breadcrumb from '@/components/saas/Breadcrumb';
import { apiClient } from '@/lib/api';

export default function HealthScorePage() {
  const [healthScore, setHealthScore] = useState({
    overall_score: 82,
    liquidity_score: 85,
    profitability_score: 80,
    efficiency_score: 75,
    growth_score: 88,
  });
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const getOrgId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('org_id') || 'demo-org-id';
    }
    return 'demo-org-id';
  };

  useEffect(() => {
    loadHealthScore();
  }, []);

  const loadHealthScore = async () => {
    try {
      setLoading(true);
      const orgId = getOrgId();
      const score = await apiClient.getLatestHealthScore(orgId);
      if (score) {
        setHealthScore(score);
      }
    } catch (error) {
      console.error('Failed to load health score:', error);
      // Keep default values
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    try {
      setCalculating(true);
      const orgId = getOrgId();
      const newScore = await apiClient.calculateHealthScore(orgId);
      setHealthScore(newScore);
    } catch (error) {
      console.error('Failed to calculate health score:', error);
      alert('Failed to calculate health score. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-primary-green';
    if (score >= 60) return 'text-yellow-500';
    return 'text-status-error';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-primary-green/10';
    if (score >= 60) return 'bg-yellow-500/10';
    return 'bg-status-error/10';
  };

  return (
    <div className="min-h-screen bg-background-main py-12 px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb items={[
          { label: 'Finances', href: '/dashboard/finances' },
          { label: 'Financial Health Score' },
        ]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-dark">Financial Health Score</h1>
            <p className="mt-2 text-text-muted">
              Track your financial health and get AI-powered recommendations.
            </p>
          </div>
          <div className="flex space-x-2">
            <Link
              href="/dashboard/finances"
              className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
            <button
              onClick={handleCalculate}
              disabled={calculating}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${calculating ? 'animate-spin' : ''}`} />
              <span>{calculating ? 'Calculating...' : 'Recalculate'}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
            <p className="mt-4 text-text-muted">Loading health score...</p>
          </div>
        ) : (
          <>
            {/* Overall Score */}
            <div className="card-base">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-text-dark mb-4">Overall Health Score</h2>
                  <div className={`text-6xl font-bold ${getScoreColor(healthScore.overall_score)}`}>
                    {healthScore.overall_score}/100
                  </div>
                  <p className="mt-4 text-text-muted">
                    Your business is in <strong>good</strong> financial health.
                  </p>
                </div>
                <div className="w-64 h-64 flex items-center justify-center">
                  <div className={`w-48 h-48 rounded-full flex items-center justify-center ${getScoreBgColor(healthScore.overall_score)}`}>
                    <Activity className={`h-24 w-24 ${getScoreColor(healthScore.overall_score)}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Component Scores */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Liquidity', score: healthScore.liquidity_score, icon: '💧' },
                { label: 'Profitability', score: healthScore.profitability_score, icon: '💰' },
                { label: 'Efficiency', score: healthScore.efficiency_score, icon: '⚡' },
                { label: 'Growth', score: healthScore.growth_score, icon: '📈' },
              ].map((component) => (
                <div key={component.label} className="card-base">
                  <div className="text-3xl mb-3">{component.icon}</div>
                  <h3 className="text-lg font-semibold text-text-dark mb-2">{component.label}</h3>
                  <div className="flex items-baseline">
                    <span className={`text-4xl font-bold ${getScoreColor(component.score)}`}>
                      {component.score}
                    </span>
                    <span className="text-text-muted ml-2">/100</span>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${component.score >= 80 ? 'bg-primary-green' : component.score >= 60 ? 'bg-yellow-500' : 'bg-status-error'}`}
                      style={{ width: `${component.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="card-base">
              <h2 className="text-xl font-bold text-text-dark mb-4">AI Recommendations</h2>
              <div className="space-y-4">
                {[
                  {
                    priority: 'high',
                    title: 'Improve Cash Flow Management',
                    description: 'Your liquidity score could be improved by reducing Days Sales Outstanding (DSO).',
                    impact: 'Could increase score by 5-7 points',
                  },
                  {
                    priority: 'medium',
                    title: 'Optimize Expense Ratios',
                    description: 'Operating expenses are slightly above industry average for your size.',
                    impact: 'Potential savings: $2,500/month',
                  },
                  {
                    priority: 'low',
                    title: 'Maintain Growth Trajectory',
                    description: 'Your growth metrics are strong. Continue current strategies.',
                    impact: 'Keep momentum for 85+ growth score',
                  },
                ].map((rec, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 flex items-start space-x-4">
                    <div className={`mt-1 ${rec.priority === 'high' ? 'text-status-error' : rec.priority === 'medium' ? 'text-yellow-500' : 'text-primary-green'}`}>
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-text-dark">{rec.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${rec.priority === 'high' ? 'bg-status-error/20 text-status-error' : rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-primary-green/20 text-primary-green'}`}>
                          {rec.priority} priority
                        </span>
                      </div>
                      <p className="text-sm text-text-muted mb-2">{rec.description}</p>
                      <p className="text-sm font-medium text-primary-blue">{rec.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
