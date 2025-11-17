'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PiggyBank, Target, TrendingUp, ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import Breadcrumb from '@/components/saas/Breadcrumb';
import { apiClient } from '@/lib/api';

interface ReserveGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  progress_percent: number;
}

export default function CashReservesPage() {
  const [goals, setGoals] = useState<ReserveGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalReserves: 50000,
    goalAmount: 75000,
    overallProgress: 67,
  });

  const getOrgId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('org_id') || 'demo-org-id';
    }
    return 'demo-org-id';
  };

  useEffect(() => {
    loadReserveGoals();
  }, []);

  const loadReserveGoals = async () => {
    try {
      setLoading(true);
      const orgId = getOrgId();
      const data = await apiClient.getReserveGoals(orgId);
      if (Array.isArray(data) && data.length > 0) {
        setGoals(data);
        const total = data.reduce((sum, g) => sum + (g.current_amount || 0), 0);
        const goalTotal = data.reduce((sum, g) => sum + (g.target_amount || 0), 0);
        setSummary({
          totalReserves: total,
          goalAmount: goalTotal,
          overallProgress: goalTotal > 0 ? Math.round((total / goalTotal) * 100) : 0,
        });
      } else {
        // Fallback to mock data
        setGoals([
          { id: '1', name: 'Emergency Fund', target_amount: 50000, current_amount: 35000, progress_percent: 70 },
          { id: '2', name: 'Operating Reserve', target_amount: 25000, current_amount: 15000, progress_percent: 60 },
        ]);
      }
    } catch (error) {
      console.error('Failed to load reserve goals:', error);
      // Fallback to mock data
      setGoals([
        { id: '1', name: 'Emergency Fund', target_amount: 50000, current_amount: 35000, progress_percent: 70 },
        { id: '2', name: 'Operating Reserve', target_amount: 25000, current_amount: 15000, progress_percent: 60 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-main py-12 px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb items={[
          { label: 'Finances', href: '/dashboard/finances' },
          { label: 'Smart Cash Reserves' },
        ]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-dark mb-2">Smart Cash Reserves</h1>
            <p className="text-text-muted">Automated cash reserve management and goal tracking</p>
          </div>
          <Link
            href="/dashboard/finances"
            className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
            <p className="mt-4 text-text-muted">Loading reserve goals...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="card-base">
                <PiggyBank className="h-8 w-8 text-yellow-500 mb-4" />
                <div className="text-2xl font-bold text-text-dark mb-1">${summary.totalReserves.toLocaleString()}</div>
                <div className="text-text-muted text-sm">Total Reserves</div>
              </div>
              <div className="card-base">
                <Target className="h-8 w-8 text-primary-blue mb-4" />
                <div className="text-2xl font-bold text-text-dark mb-1">${summary.goalAmount.toLocaleString()}</div>
                <div className="text-text-muted text-sm">Goal Amount</div>
              </div>
              <div className="card-base">
                <TrendingUp className="h-8 w-8 text-primary-green mb-4" />
                <div className="text-2xl font-bold text-text-dark mb-1">{summary.overallProgress}%</div>
                <div className="text-text-muted text-sm">Overall Progress</div>
              </div>
            </div>

            <div className="card-base">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-text-dark">Reserve Goals</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 text-sm">
                  <Plus className="h-4 w-4" />
                  <span>New Goal</span>
                </button>
              </div>
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-text-dark font-semibold">{goal.name}</div>
                      <div className="text-primary-blue font-bold">
                        ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="mb-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-blue to-accent-violet"
                        style={{ width: `${goal.progress_percent}%` }}
                      />
                    </div>
                    <div className="text-sm text-text-muted">{goal.progress_percent}% complete</div>
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
