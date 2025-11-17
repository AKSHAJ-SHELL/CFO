'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, TrendingUp, Users, Package, Edit, ArrowLeft, Save, X } from 'lucide-react';
import Breadcrumb from '@/components/saas/Breadcrumb';
import { apiClient } from '@/lib/api';

interface ProfitabilityMetrics {
  totalProfit: number;
  avgMargin: number;
  customers: number;
  products: number;
}

export default function ProfitabilityPage() {
  const [metrics, setMetrics] = useState<ProfitabilityMetrics>({
    totalProfit: 27000,
    avgMargin: 23.3,
    customers: 3,
    products: 12,
  });
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [customers, setCustomers] = useState([
    { id: '1', name: 'Acme Corp', revenue: 50000, costs: 35000, profit: 15000, margin: 30 },
    { id: '2', name: 'TechStart Inc', revenue: 35000, costs: 28000, profit: 7000, margin: 20 },
    { id: '3', name: 'GrowthCo', revenue: 25000, costs: 20000, profit: 5000, margin: 20 },
  ]);
  const [loading, setLoading] = useState(true);

  const getOrgId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('org_id') || 'demo-org-id';
    }
    return 'demo-org-id';
  };

  useEffect(() => {
    loadProfitabilityData();
  }, []);

  const loadProfitabilityData = async () => {
    try {
      setLoading(true);
      const orgId = getOrgId();
      const [customerData, productData] = await Promise.all([
        apiClient.getCustomerProfitability(orgId),
        apiClient.getProducts(orgId),
      ]);

      if (Array.isArray(customerData) && customerData.length > 0) {
        const totalProfit = customerData.reduce((sum: number, c: any) => sum + (c.net_profit || 0), 0);
        const avgMargin = customerData.reduce((sum: number, c: any) => sum + (c.profit_margin_percent || 0), 0) / customerData.length;
        setMetrics({
          totalProfit,
          avgMargin: avgMargin || 23.3,
          customers: customerData.length,
          products: Array.isArray(productData) ? productData.length : 12,
        });
        setCustomers(customerData);
      }
    } catch (error) {
      console.error('Failed to load profitability data:', error);
      // Keep mock data as fallback
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (metric: keyof ProfitabilityMetrics) => {
    setEditingMetric(metric);
    setEditValue(metrics[metric]);
  };

  const handleSaveEdit = async () => {
    if (editingMetric === null) return;

    try {
      const orgId = getOrgId();
      const updatedMetrics = { ...metrics, [editingMetric]: editValue };
      setMetrics(updatedMetrics);
      
      // TODO: Save to backend if update endpoint exists
      // await apiClient.updateProfitabilityMetrics(orgId, { [editingMetric]: editValue });
      
      setEditingMetric(null);
    } catch (error) {
      console.error('Failed to update metric:', error);
      alert('Failed to update metric. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingMetric(null);
    setEditValue(0);
  };

  const EditableMetric = ({ 
    label, 
    value, 
    metricKey, 
    icon: Icon, 
    color 
  }: { 
    label: string; 
    value: number; 
    metricKey: keyof ProfitabilityMetrics;
    icon: typeof DollarSign;
    color: string;
  }) => {
    const isEditing = editingMetric === metricKey;
    
    return (
      <div className="card-base">
        <div className="flex items-center justify-between mb-4">
          <Icon className={`h-8 w-8 ${color}`} />
          {!isEditing && (
            <button
              onClick={() => handleStartEdit(metricKey)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label={`Edit ${label}`}
            >
              <Edit className="h-4 w-4 text-text-muted" />
            </button>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-2xl font-bold"
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-3 py-1 bg-primary-green text-white rounded hover:bg-primary-green/90 text-sm flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center justify-center"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-text-dark mb-1">
              {metricKey === 'totalProfit' ? `$${value.toLocaleString()}` : 
               metricKey === 'avgMargin' ? `${value.toFixed(1)}%` : 
               value.toLocaleString()}
            </div>
            <div className="text-text-muted text-sm">{label}</div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background-main py-12 px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb items={[
          { label: 'Finances', href: '/dashboard/finances' },
          { label: 'Profitability Intelligence' },
        ]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-dark mb-2">Profitability Intelligence</h1>
            <p className="text-text-muted">Analyze profitability across customers, products, and projects</p>
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
            <p className="mt-4 text-text-muted">Loading profitability data...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <EditableMetric
                label="Total Profit"
                value={metrics.totalProfit}
                metricKey="totalProfit"
                icon={DollarSign}
                color="text-primary-green"
              />
              <EditableMetric
                label="Avg Margin"
                value={metrics.avgMargin}
                metricKey="avgMargin"
                icon={TrendingUp}
                color="text-primary-blue"
              />
              <EditableMetric
                label="Active Customers"
                value={metrics.customers}
                metricKey="customers"
                icon={Users}
                color="text-accent-violet"
              />
              <EditableMetric
                label="Products"
                value={metrics.products}
                metricKey="products"
                icon={Package}
                color="text-yellow-500"
              />
            </div>

            <div className="card-base">
              <h2 className="text-2xl font-bold text-text-dark mb-4">Customer Profitability</h2>
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div key={customer.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-text-dark font-semibold">{customer.name}</div>
                      <div className="text-primary-green font-bold">${customer.profit.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <span>Revenue: ${customer.revenue.toLocaleString()}</span>
                      <span>Costs: ${customer.costs.toLocaleString()}</span>
                      <span>Margin: {customer.margin}%</span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-green to-emerald-500"
                        style={{ width: `${customer.margin}%` }}
                      />
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

