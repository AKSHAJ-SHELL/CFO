/**
 * Mock data for offline/demo mode
 */

export const mockInvoices = [
  {
    id: '1',
    customer: 'cust-1',
    customer_name: 'Acme Corp',
    invoice_number: 'INV-1001',
    issue_date: '2024-01-01',
    due_date: '2024-01-31',
    total_amount: 5000,
    amount_paid: 0,
    status: 'sent' as const,
    is_overdue: false,
  },
  {
    id: '2',
    customer: 'cust-2',
    customer_name: 'TechStart Inc',
    invoice_number: 'INV-1002',
    issue_date: '2024-01-05',
    due_date: '2024-02-05',
    total_amount: 3500,
    amount_paid: 3500,
    status: 'paid' as const,
    is_overdue: false,
  },
];

export const mockCustomers = [
  {
    id: 'cust-1',
    name: 'Acme Corp',
    email: 'billing@acme.com',
    total_invoiced: 15000,
    payment_reliability_score: 95,
  },
  {
    id: 'cust-2',
    name: 'TechStart Inc',
    email: 'finance@techstart.io',
    total_invoiced: 12000,
    payment_reliability_score: 88,
  },
];

export const mockDashboardMetrics = {
  total_revenue: 125000,
  outstanding_invoices: 18500,
  predicted_cashflow: 45000,
  health_score: 82,
  runway_days: 180,
};

export const mockHealthScore = {
  overall_score: 82,
  liquidity_score: 78,
  profitability_score: 85,
  efficiency_score: 80,
  growth_score: 85,
  calculated_at: new Date().toISOString(),
};

export const mockReserveGoals = [
  {
    id: 'goal-1',
    name: 'Emergency Fund',
    goal_type: 'emergency',
    target_amount: 50000,
    current_amount: 32000,
    progress_percent: 64,
  },
  {
    id: 'goal-2',
    name: 'Tax Reserve',
    goal_type: 'tax',
    target_amount: 25000,
    current_amount: 18000,
    progress_percent: 72,
  },
];

