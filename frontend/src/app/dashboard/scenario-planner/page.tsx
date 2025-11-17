'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Plus, Play, Copy, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Breadcrumb from '@/components/saas/Breadcrumb';
import { apiClient } from '@/lib/api';

interface Scenario {
  id: string;
  name: string;
  scenario_type: 'best' | 'expected' | 'worst' | 'custom';
  forecast_months: number;
  profit?: number;
  created_at?: string;
}

export default function ScenarioPlannerPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newScenario, setNewScenario] = useState({
    name: '',
    scenario_type: 'custom' as const,
    forecast_months: 12,
  });

  // Get organization ID from localStorage or use demo
  const getOrgId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('org_id') || 'demo-org-id';
    }
    return 'demo-org-id';
  };

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      const orgId = getOrgId();
      const data = await apiClient.getScenarios(orgId);
      setScenarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      // Fallback to mock data
      setScenarios([
        { id: '1', name: 'Growth Scenario', scenario_type: 'best', forecast_months: 12, profit: 125000 },
        { id: '2', name: 'Conservative', scenario_type: 'worst', forecast_months: 12, profit: 45000 },
        { id: '3', name: 'Current Trajectory', scenario_type: 'expected', forecast_months: 12, profit: 85000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScenario = async () => {
    try {
      const orgId = getOrgId();
      const created = await apiClient.createScenario(orgId, newScenario);
      setScenarios([...scenarios, created]);
      setShowCreateModal(false);
      setNewScenario({ name: '', scenario_type: 'custom', forecast_months: 12 });
    } catch (error) {
      console.error('Failed to create scenario:', error);
      alert('Failed to create scenario. Please try again.');
    }
  };

  const handleRunScenario = async (scenarioId: string) => {
    try {
      const orgId = getOrgId();
      await apiClient.runScenario(orgId, scenarioId);
      loadScenarios(); // Reload to get updated results
    } catch (error) {
      console.error('Failed to run scenario:', error);
      alert('Failed to run scenario. Please try again.');
    }
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    if (!confirm('Are you sure you want to delete this scenario?')) return;
    
    try {
      const orgId = getOrgId();
      await apiClient.deleteScenario(orgId, scenarioId);
      setScenarios(scenarios.filter(s => s.id !== scenarioId));
    } catch (error) {
      console.error('Failed to delete scenario:', error);
      alert('Failed to delete scenario. Please try again.');
    }
  };

  const handleDuplicateScenario = async (scenario: Scenario) => {
    try {
      const orgId = getOrgId();
      const duplicated = await apiClient.createScenario(orgId, {
        name: `${scenario.name} (Copy)`,
        scenario_type: scenario.scenario_type,
        forecast_months: scenario.forecast_months,
      });
      setScenarios([...scenarios, duplicated]);
    } catch (error) {
      console.error('Failed to duplicate scenario:', error);
      alert('Failed to duplicate scenario. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background-main py-12 px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb items={[
          { label: 'Models', href: '/dashboard/models' },
          { label: 'Scenario Planning & Budget Simulator' },
        ]} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-dark mb-2">Scenario Planning & Budget Simulator</h1>
            <p className="text-text-muted">
              Model what-if scenarios and compare outcomes.
            </p>
          </div>
          <div className="flex space-x-2">
            <Link
              href="/dashboard/models"
              className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Scenario
            </button>
          </div>
        </div>

        {/* Scenarios Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
            <p className="mt-4 text-text-muted">Loading scenarios...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <div key={scenario.id} className="card-base hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-text-dark">{scenario.name}</h3>
                    <p className="text-sm text-text-muted capitalize">{scenario.scenario_type} Case</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-blue/10 text-primary-blue">
                    {scenario.forecast_months} months
                  </span>
                </div>
                
                <div className="space-y-4">
                  {scenario.profit !== undefined && (
                    <div>
                      <p className="text-sm text-text-muted">Projected Profit</p>
                      <p className="text-2xl font-bold text-primary-green">${(scenario.profit / 1000).toFixed(1)}k</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleRunScenario(scenario.id)}
                      className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Run
                    </button>
                    <button 
                      onClick={() => handleDuplicateScenario(scenario)}
                      className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </button>
                    <button 
                      onClick={() => {
                        // TODO: Implement edit functionality
                        alert('Edit functionality coming soon');
                      }}
                      className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteScenario(scenario.id)}
                      className="flex items-center justify-center px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Scenario Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-text-dark mb-4">Create New Scenario</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Scenario Name</label>
                  <input
                    type="text"
                    value={newScenario.name}
                    onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    placeholder="e.g., Q1 Growth Plan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Scenario Type</label>
                  <select
                    value={newScenario.scenario_type}
                    onChange={(e) => setNewScenario({ ...newScenario, scenario_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  >
                    <option value="best">Best Case</option>
                    <option value="expected">Expected</option>
                    <option value="worst">Worst Case</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Forecast Period (months)</label>
                  <input
                    type="number"
                    value={newScenario.forecast_months}
                    onChange={(e) => setNewScenario({ ...newScenario, forecast_months: parseInt(e.target.value) })}
                    min="1"
                    max="36"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateScenario}
                  disabled={!newScenario.name.trim()}
                  className="flex-1 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Scenario
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Budget Overview */}
        <div className="card-base">
          <h2 className="text-xl font-bold text-text-dark mb-4">Active Budgets</h2>
          <div className="space-y-4">
            {[
              { name: 'Q4 2024 Budget', allocated: 50000, spent: 42500, categories: 8 },
              { name: 'Marketing Budget', allocated: 15000, spent: 12750, categories: 4 },
              { name: 'Operations Budget', allocated: 25000, spent: 18900, categories: 6 },
            ].map((budget) => (
              <div key={budget.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-text-dark">{budget.name}</h3>
                  <span className="text-sm text-text-muted">{budget.categories} categories</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-text-muted">
                    <span>Spent: ${budget.spent.toLocaleString()}</span>
                    <span>Budget: ${budget.allocated.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-blue h-2 rounded-full"
                      style={{ width: `${(budget.spent / budget.allocated) * 100}%` }}
                    />
                  </div>
                  <div className="text-right text-sm text-text-muted">
                    {((budget.spent / budget.allocated) * 100).toFixed(1)}% utilized
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals Tracking */}
        <div className="card-base">
          <h2 className="text-xl font-bold text-text-dark mb-4">Financial Goals</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { name: 'Revenue Target', target: 150000, current: 125000, unit: '$' },
              { name: 'Profit Margin', target: 25, current: 22, unit: '%' },
              { name: 'Cash Reserve', target: 50000, current: 38000, unit: '$' },
              { name: 'Growth Rate', target: 15, current: 12, unit: '%' },
            ].map((goal) => (
              <div key={goal.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-text-dark">{goal.name}</h3>
                  <TrendingUp className="h-5 w-5 text-primary-green" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-text-muted">
                    <span>Current: {goal.unit}{goal.current.toLocaleString()}</span>
                    <span>Target: {goal.unit}{goal.target.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-green h-2 rounded-full"
                      style={{ width: `${(goal.current / goal.target) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

