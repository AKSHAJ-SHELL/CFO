/**
 * TypeScript type definitions for FinPilot
 */

// User & Organization
export interface User {
  id: string;
  email: string;
  name: string;
  organization_id: string;
}

export interface Organization {
  id: string;
  name: string;
  currency: string;
  timezone: string;
}

// Invoice Management (Feature 1)
export interface Invoice {
  id: string;
  customer: string;
  customer_name: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  amount_paid: number;
  status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  is_overdue: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  total_invoiced: number;
  payment_reliability_score: number;
}

// Scenario Planning (Feature 3)
export interface Scenario {
  id: string;
  name: string;
  scenario_type: 'best' | 'expected' | 'worst' | 'custom';
  forecast_months: number;
  latest_result?: ScenarioResult;
}

export interface ScenarioResult {
  monthly_revenue: number[];
  monthly_expenses: number[];
  monthly_profit: number[];
  monthly_cash_balance: number[];
  total_profit: number;
  runway_days: number;
}

export interface Budget {
  id: string;
  name: string;
  total_amount: number;
  total_actual: number;
  utilization_percent: number;
  start_date: string;
  end_date: string;
}

// Bill Pay (Feature 4)
export interface Vendor {
  id: string;
  name: string;
  total_paid: number;
  total_bills: number;
  category: string;
}

export interface Bill {
  id: string;
  vendor_name: string;
  bill_number: string;
  bill_date: string;
  due_date: string;
  total_amount: number;
  status: string;
  is_overdue: boolean;
}

// Profitability (Feature 5)
export interface CustomerProfitability {
  customer_name: string;
  total_revenue: number;
  net_profit: number;
  profit_margin_percent: number;
}

export interface Product {
  id: string;
  name: string;
  total_revenue: number;
  gross_margin_percent: number;
  total_sold: number;
}

// Health Score (Feature 6)
export interface HealthScore {
  overall_score: number;
  liquidity_score: number;
  profitability_score: number;
  efficiency_score: number;
  growth_score: number;
  calculated_at: string;
}

// Cash Reserves (Feature 7)
export interface ReserveGoal {
  id: string;
  name: string;
  goal_type: string;
  target_amount: number;
  current_amount: number;
  progress_percent: number;
}

// Dashboard
export interface DashboardMetrics {
  total_revenue: number;
  outstanding_invoices: number;
  predicted_cashflow: number;
  health_score: number;
  runway_days: number;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// SaaS Frontend Types

// Overview Metrics
export interface OverviewMetrics {
  mrr: number; // Monthly Recurring Revenue
  customers: number;
  runwayDays: number;
  healthScore: number;
}

// Feature Types
export type FeatureCategory = 'Data Visualization' | 'Web Dev' | 'Financial Tools' | 'AI Models' | 'Dashboards';

export interface Feature {
  id: string;
  title: string;
  short: string; // Short description
  long: string; // Long description
  category: FeatureCategory;
  image?: string;
  icon?: string;
  highlights: string[]; // Key features/bullets
  demoUrl?: string;
}

// Integration Types
export type IntegrationStatus = 'Connected' | 'Available' | 'Coming Soon';

export interface Integration {
  id: string;
  name: string;
  logo: string;
  description: string;
  status: IntegrationStatus;
  category: 'Banking' | 'Accounting' | 'Payment' | 'Analytics' | 'Other';
  connectedSince?: string;
}

// Pricing Types
export type PricingTier = 'Free' | 'Standard' | 'Pro';

export interface PricingPlan {
  tier: PricingTier;
  name: string;
  price: number;
  priceUnit?: string; // 'month', 'year', etc.
  description: string;
  features: string[];
  ctaText: string;
  highlighted?: boolean;
}

// Testimonial Types
export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
}

// File Upload Types
export type FileType = 'CSV' | 'XLSX' | 'OFX' | 'QFX' | 'PDF' | 'JSON' | 'PNG' | 'JPG' | 'ZIP';

export interface UploadedFile {
  id: string;
  name: string;
  type: FileType;
  size: number;
  uploadedAt: string;
  dataUrl: string; // Base64 data URL for client-side storage
}

// Feature Status (for beta dashboard)
export interface FeatureStatus {
  featureId: string;
  enabled: boolean;
  lastDemoRun?: string;
}

// Integration Status (for beta dashboard)
export interface IntegrationStatusInfo {
  integrationId: string;
  enabled: boolean;
  mockConnected: boolean;
}

// Session Log Types
export interface SessionLogEntry {
  id: string;
  timestamp: string;
  action: string;
  featureId?: string;
  details?: Record<string, unknown>;
}

// Contact Form Types
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ContactFormErrors {
  name?: string;
  email?: string;
  message?: string;
}

// Demo Action Types
export type DemoAction = 
  | 'create-invoice'
  | 'send-reminder'
  | 'process-payment'
  | 'run-scenario'
  | 'create-budget'
  | 'track-goal'
  | 'upload-bill'
  | 'approve-bill'
  | 'schedule-payment'
  | 'calculate-profitability'
  | 'view-ltv'
  | 'analyze-margin'
  | 'refresh-health-score'
  | 'view-benchmarks'
  | 'calculate-reserves'
  | 'set-reserve-goal';

