/**
 * Mock API Layer for FinPilot SaaS Frontend
 * Provides demo data for all features with all features enabled by default
 */

import type {
  OverviewMetrics,
  Feature,
  FeatureCategory,
  Integration,
  IntegrationStatus,
  PricingPlan,
  Testimonial,
  UploadedFile,
  FileType,
  FeatureStatus,
  IntegrationStatusInfo,
  SessionLogEntry,
} from './types';

// Storage keys for localStorage
const STORAGE_KEYS = {
  UPLOADED_FILES: 'finpilot_uploaded_files',
  FEATURE_STATUS: 'finpilot_feature_status',
  INTEGRATION_STATUS: 'finpilot_integration_status',
  SESSION_LOG: 'finpilot_session_log',
} as const;

// Default feature status: ALL ENABLED
const DEFAULT_FEATURE_STATUS: FeatureStatus[] = [
  { featureId: 'invoices', enabled: true },
  { featureId: 'scenario-planner', enabled: true },
  { featureId: 'bill-pay', enabled: true },
  { featureId: 'profitability', enabled: true },
  { featureId: 'health-score', enabled: true },
  { featureId: 'cash-reserves', enabled: true },
  { featureId: 'forecast', enabled: true },
  { featureId: 'alerts', enabled: true },
  { featureId: 'analytics', enabled: true },
  { featureId: 'chat', enabled: true },
  { featureId: 'playground', enabled: true },
  { featureId: 'reports', enabled: true },
  { featureId: 'settings', enabled: true },
  { featureId: 'integrations', enabled: true },
];

// Default integration status: ALL CONNECTED
const DEFAULT_INTEGRATION_STATUS: IntegrationStatusInfo[] = [
  { integrationId: 'plaid', enabled: true, mockConnected: true },
  { integrationId: 'stripe', enabled: true, mockConnected: true },
  { integrationId: 'quickbooks', enabled: true, mockConnected: true },
  { integrationId: 'xero', enabled: true, mockConnected: true },
  { integrationId: 'freshbooks', enabled: true, mockConnected: true },
];

/**
 * Get overview metrics
 */
export function getOverview(): OverviewMetrics {
  return {
    mrr: 125000,
    customers: 342,
    runwayDays: 180,
    healthScore: 87,
  };
}

/**
 * Feature category mapping
 */
export const FEATURE_CATEGORIES = {
  finances: ['invoices', 'bill-pay', 'profitability', 'health-score', 'cash-reserves', 'analytics', 'reports'],
  automation: ['invoices', 'bill-pay'],
  models: ['scenario-planner', 'playground'],
  ai: ['forecast', 'alerts', 'chat'],
} as const;

/**
 * Get features by category
 */
export function getFeaturesByCategory(category: keyof typeof FEATURE_CATEGORIES): Feature[] {
  const featureIds = FEATURE_CATEGORIES[category];
  const allFeatures = getFeatures();
  return allFeatures.filter(f => featureIds.includes(f.id as typeof featureIds[number]));
}

/**
 * Get all features (14 features)
 */
export function getFeatures(): Feature[] {
  return [
    {
      id: 'invoices',
      title: 'Invoice Management & Collections',
      short: 'Automate invoicing, track payments, and manage AR aging',
      long: 'Complete invoice management system with automated reminders, payment tracking, AR aging reports, and Stripe integration for online payments.',
      category: 'Financial Tools',
      icon: 'FileText',
      highlights: [
        'Automated invoice generation and sending',
        'Payment prediction using ML',
        'AR aging reports',
        'Stripe payment integration',
        'Automated reminder system',
      ],
    },
    {
      id: 'scenario-planner',
      title: 'Scenario Planning & Budget Simulator',
      short: 'Model what-if scenarios and compare financial outcomes',
      long: 'Create multiple financial scenarios, run simulations, compare outcomes, and build budgets with actual vs budget tracking.',
      category: 'Financial Tools',
      icon: 'TrendingUp',
      highlights: [
        'Best/worst/expected case scenarios',
        '12-month cash flow projections',
        'Budget vs actual tracking',
        'Goal tracking and sensitivity analysis',
        'Interactive comparison charts',
      ],
    },
    {
      id: 'bill-pay',
      title: 'Bill Pay Automation',
      short: 'Automate bill processing with OCR and approval workflows',
      long: 'Upload bills via OCR, auto-extract data, route through approval workflows, and schedule payments automatically.',
      category: 'Financial Tools',
      icon: 'Receipt',
      highlights: [
        'OCR bill capture and extraction',
        'Approval workflow engine',
        'Recurring bill detection',
        'Payment scheduling and ACH integration',
        'Vendor management',
      ],
    },
    {
      id: 'profitability',
      title: 'Profitability Intelligence',
      short: 'Analyze customer and product profitability with LTV prediction',
      long: 'Track profitability by customer and product, calculate LTV, analyze margins, and identify unprofitable relationships.',
      category: 'Financial Tools',
      icon: 'PieChart',
      highlights: [
        'Customer profitability analysis',
        'Product margin tracking',
        'LTV prediction model',
        'Time tracking integration',
        'Profitability dashboards',
      ],
    },
    {
      id: 'health-score',
      title: 'Financial Health Score',
      short: 'Monitor financial health with industry benchmarks',
      long: 'Calculate comprehensive health score across liquidity, profitability, efficiency, and growth. Compare with industry peers.',
      category: 'Dashboards',
      icon: 'Activity',
      highlights: [
        'Multi-component health scoring',
        'Industry benchmarking',
        'Peer comparison',
        'Trend analysis',
        'Actionable recommendations',
      ],
    },
    {
      id: 'cash-reserves',
      title: 'Smart Cash Reserves',
      short: 'Calculate and automate cash reserve goals',
      long: 'Determine optimal cash reserves based on expenses, set goals, track progress, and automate transfers to savings accounts.',
      category: 'Financial Tools',
      icon: 'PiggyBank',
      highlights: [
        'Reserve goal calculator',
        'Liquidity protection logic',
        'Auto-transfer engine',
        'Savings partner integration',
        'Progress tracking',
      ],
    },
    {
      id: 'forecast',
      title: 'Forecasting & Predictions',
      short: 'AI-powered financial forecasting',
      long: 'Generate accurate cash flow forecasts, revenue predictions, and scenario-based projections using machine learning models.',
      category: 'AI Models',
      icon: 'TrendingUp',
      highlights: [
        'ML-powered forecasting',
        'Cash flow predictions',
        'Revenue forecasting',
        'Anomaly detection',
        'Confidence intervals',
      ],
    },
    {
      id: 'alerts',
      title: 'AI Alerts & Notifications',
      short: 'Intelligent alerts for financial anomalies',
      long: 'Get notified about important financial events, anomalies, trends, and opportunities using AI-powered analysis.',
      category: 'AI Models',
      icon: 'Bell',
      highlights: [
        'Anomaly detection',
        'Trend alerts',
        'Threshold monitoring',
        'Smart prioritization',
        'Multi-channel notifications',
      ],
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      short: 'Comprehensive financial analytics and reporting',
      long: 'Generate detailed reports, visualize data with interactive charts, and export insights for stakeholders.',
      category: 'Data Visualization',
      icon: 'BarChart',
      highlights: [
        'Custom report builder',
        'Interactive dashboards',
        'Export to PDF/CSV',
        'Scheduled reports',
        'KPI tracking',
      ],
    },
    {
      id: 'chat',
      title: 'AI CFO Chat',
      short: 'Chat with your AI CFO assistant',
      long: 'Get instant answers to financial questions, analyze data, and receive recommendations from your AI-powered CFO assistant.',
      category: 'AI Models',
      icon: 'MessageSquare',
      highlights: [
        'Natural language queries',
        'Financial data analysis',
        'Recommendations',
        'Context-aware responses',
        'Multi-language support',
      ],
    },
    {
      id: 'playground',
      title: 'Model Playground',
      short: 'Train and test your own financial models',
      long: 'Upload datasets, train custom ML models, test predictions, and visualize model performance with confusion matrices.',
      category: 'AI Models',
      icon: 'Brain',
      highlights: [
        'CSV dataset upload',
        'Model training interface',
        'Performance visualization',
        'Confusion matrix',
        'Forecast accuracy metrics',
      ],
    },
    {
      id: 'reports',
      title: 'Custom Reports',
      short: 'Build and schedule custom financial reports',
      long: 'Create custom reports with drag-and-drop fields, schedule automated delivery, and share with stakeholders.',
      category: 'Dashboards',
      icon: 'FileBarChart',
      highlights: [
        'Drag-and-drop builder',
        'Report templates',
        'Scheduled delivery',
        'Email distribution',
        'PDF export',
      ],
    },
    {
      id: 'settings',
      title: 'Settings & Configuration',
      short: 'Configure your FinPilot account',
      long: 'Manage account settings, integrations, preferences, team members, and notifications.',
      category: 'Dashboards',
      icon: 'Settings',
      highlights: [
        'Account management',
        'Integration settings',
        'User permissions',
        'Notification preferences',
        'Data export',
      ],
    },
    {
      id: 'integrations',
      title: 'Integrations Hub',
      short: 'Connect with your favorite tools',
      long: 'Connect FinPilot with banking, accounting, payment, and analytics platforms for seamless data synchronization.',
      category: 'Dashboards',
      icon: 'Plug',
      highlights: [
        'One-click connections',
        '100+ integrations',
        'Real-time sync',
        'OAuth security',
        'Webhook support',
      ],
    },
  ];
}

/**
 * Get all integrations
 */
export function getIntegrations(): Integration[] {
  return [
    {
      id: 'plaid',
      name: 'Plaid',
      logo: '/integrations/plaid.svg',
      description: 'Connect bank accounts and access transaction data',
      status: 'Connected',
      category: 'Banking',
      connectedSince: '2024-01-15',
    },
    {
      id: 'stripe',
      name: 'Stripe',
      logo: '/integrations/stripe.svg',
      description: 'Process payments and manage subscriptions',
      status: 'Connected',
      category: 'Payment',
      connectedSince: '2024-01-10',
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      logo: '/integrations/quickbooks.svg',
      description: 'Sync accounting data and transactions',
      status: 'Connected',
      category: 'Accounting',
      connectedSince: '2024-01-20',
    },
    {
      id: 'xero',
      name: 'Xero',
      logo: '/integrations/xero.svg',
      description: 'Cloud-based accounting platform integration',
      status: 'Available',
      category: 'Accounting',
    },
    {
      id: 'freshbooks',
      name: 'FreshBooks',
      logo: '/integrations/freshbooks.svg',
      description: 'Invoicing and time tracking integration',
      status: 'Available',
      category: 'Accounting',
    },
    {
      id: 'shopify',
      name: 'Shopify',
      logo: '/integrations/shopify.svg',
      description: 'E-commerce sales and revenue data',
      status: 'Available',
      category: 'Analytics',
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      logo: '/integrations/salesforce.svg',
      description: 'CRM and sales pipeline integration',
      status: 'Coming Soon',
      category: 'Analytics',
    },
  ];
}

/**
 * Get pricing plans
 */
export function getPricing(): PricingPlan[] {
  return [
    {
      tier: 'Free',
      name: 'Starter',
      price: 0,
      description: 'Perfect for small businesses getting started',
      features: [
        'Up to 50 invoices/month',
        'Basic reporting',
        'Email support',
        '1 user',
        'Mobile app access',
      ],
      ctaText: 'Get Started',
    },
    {
      tier: 'Standard',
      name: 'Growth',
      price: 99,
      priceUnit: 'month',
      description: 'For growing businesses that need more',
      features: [
        'Unlimited invoices',
        'Advanced reporting',
        'Priority support',
        'Up to 5 users',
        'API access',
        'Custom integrations',
        'AI-powered insights',
      ],
      ctaText: 'Start Free Trial',
      highlighted: true,
    },
    {
      tier: 'Pro',
      name: 'Enterprise',
      price: 299,
      priceUnit: 'month',
      description: 'For teams that need it all',
      features: [
        'Everything in Standard',
        'Unlimited users',
        'Dedicated support',
        'Custom development',
        'On-premise deployment',
        'Advanced security',
        'SLA guarantee',
      ],
      ctaText: 'Contact Sales',
    },
  ];
}

/**
 * Get testimonials
 */
export function getTestimonials(): Testimonial[] {
  return [
    {
      id: '1',
      quote: 'FinPilot has transformed how we manage our finances. The AI insights are incredibly accurate and save us hours every week.',
      author: 'Sarah Chen',
      role: 'CFO',
      company: 'TechStart Inc.',
    },
    {
      id: '2',
      quote: 'The invoice management system alone has paid for itself. We\'ve reduced our days sales outstanding by 30%.',
      author: 'Marcus Johnson',
      role: 'Finance Director',
      company: 'GrowthCo',
    },
    {
      id: '3',
      quote: 'Finally, a financial tool that speaks our language. The scenario planning feature helped us navigate a difficult quarter.',
      author: 'Emily Rodriguez',
      role: 'Founder',
      company: 'StartupXYZ',
    },
    {
      id: '4',
      quote: 'The health score feature gives us immediate visibility into our financial position. Game changer.',
      author: 'David Kim',
      role: 'CEO',
      company: 'InnovateLabs',
    },
    {
      id: '5',
      quote: 'We love how easy it is to connect all our tools. The integrations work seamlessly.',
      author: 'Lisa Wang',
      role: 'Operations Manager',
      company: 'ScaleUp',
    },
    {
      id: '6',
      quote: 'The AI CFO chat is like having a financial expert on call 24/7. Amazing support.',
      author: 'James Wilson',
      role: 'Small Business Owner',
      company: 'Local Services Co.',
    },
  ];
}

/**
 * Get feature status (all enabled by default)
 */
export function getFeatureStatus(): FeatureStatus[] {
  if (typeof window === 'undefined') return DEFAULT_FEATURE_STATUS;
  
  const stored = localStorage.getItem(STORAGE_KEYS.FEATURE_STATUS);
  if (!stored) {
    // Initialize with all enabled
    localStorage.setItem(STORAGE_KEYS.FEATURE_STATUS, JSON.stringify(DEFAULT_FEATURE_STATUS));
    return DEFAULT_FEATURE_STATUS;
  }
  
  try {
    return JSON.parse(stored) as FeatureStatus[];
  } catch {
    return DEFAULT_FEATURE_STATUS;
  }
}

/**
 * Enable/disable a feature
 */
export function toggleFeature(featureId: string, enabled: boolean): void {
  if (typeof window === 'undefined') return;
  
  const statuses = getFeatureStatus();
  const index = statuses.findIndex(s => s.featureId === featureId);
  
  if (index >= 0) {
    statuses[index].enabled = enabled;
  } else {
    statuses.push({ featureId, enabled });
  }
  
  localStorage.setItem(STORAGE_KEYS.FEATURE_STATUS, JSON.stringify(statuses));
}

/**
 * Get integration status (all connected by default)
 */
export function getIntegrationStatus(): IntegrationStatusInfo[] {
  if (typeof window === 'undefined') return DEFAULT_INTEGRATION_STATUS;
  
  const stored = localStorage.getItem(STORAGE_KEYS.INTEGRATION_STATUS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.INTEGRATION_STATUS, JSON.stringify(DEFAULT_INTEGRATION_STATUS));
    return DEFAULT_INTEGRATION_STATUS;
  }
  
  try {
    return JSON.parse(stored) as IntegrationStatusInfo[];
  } catch {
    return DEFAULT_INTEGRATION_STATUS;
  }
}

/**
 * Toggle integration
 */
export function toggleIntegration(integrationId: string, enabled: boolean): void {
  if (typeof window === 'undefined') return;
  
  const statuses = getIntegrationStatus();
  const index = statuses.findIndex(s => s.integrationId === integrationId);
  
  if (index >= 0) {
    statuses[index].enabled = enabled;
  } else {
    statuses.push({ integrationId, enabled, mockConnected: enabled });
  }
  
  localStorage.setItem(STORAGE_KEYS.INTEGRATION_STATUS, JSON.stringify(statuses));
}

/**
 * Upload file (stores in localStorage)
 */
export function uploadFile(file: File): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('File upload only available in browser'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const uploadedFile: UploadedFile = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        uploadedAt: new Date().toISOString(),
        dataUrl,
      };

      // Save to localStorage
      const existing = getUploadedFiles();
      existing.push(uploadedFile);
      localStorage.setItem(STORAGE_KEYS.UPLOADED_FILES, JSON.stringify(existing));

      // Log action
      logSessionAction('file-uploaded', { fileName: file.name, fileType: uploadedFile.type });

      resolve(uploadedFile);
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get uploaded files
 */
export function getUploadedFiles(): UploadedFile[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.UPLOADED_FILES);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored) as UploadedFile[];
  } catch {
    return [];
  }
}

/**
 * Delete uploaded file
 */
export function deleteUploadedFile(fileId: string): void {
  if (typeof window === 'undefined') return;
  
  const files = getUploadedFiles();
  const filtered = files.filter(f => f.id !== fileId);
  localStorage.setItem(STORAGE_KEYS.UPLOADED_FILES, JSON.stringify(filtered));
  logSessionAction('file-deleted', { fileId });
}

/**
 * Parse file (mock parsing workflow)
 */
export function parseFile(fileId: string, parseType: 'transactions' | 'forecast' | 'bills'): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    // Simulate parsing delay
    setTimeout(() => {
      logSessionAction('file-parsed', { fileId, parseType });
      resolve({
        success: true,
        message: `Successfully parsed file as ${parseType}. Found 42 records.`,
      });
    }, 1500);
  });
}

/**
 * Seed demo data for all features
 */
export function seedDemoData(): void {
  if (typeof window === 'undefined') return;
  
  // Reset feature status to all enabled
  localStorage.setItem(STORAGE_KEYS.FEATURE_STATUS, JSON.stringify(DEFAULT_FEATURE_STATUS));
  
  // Reset integration status to all connected
  localStorage.setItem(STORAGE_KEYS.INTEGRATION_STATUS, JSON.stringify(DEFAULT_INTEGRATION_STATUS));
  
  logSessionAction('demo-data-seeded', {});
}

/**
 * Log session action
 */
export function logSessionAction(action: string, details?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  
  const logEntry: SessionLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    details,
  };

  const existing = getSessionLog();
  existing.unshift(logEntry);
  
  // Keep only last 100 entries
  const trimmed = existing.slice(0, 100);
  localStorage.setItem(STORAGE_KEYS.SESSION_LOG, JSON.stringify(trimmed));
}

/**
 * Get session log
 */
export function getSessionLog(): SessionLogEntry[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.SESSION_LOG);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored) as SessionLogEntry[];
  } catch {
    return [];
  }
}

/**
 * Clear session log
 */
export function clearSessionLog(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.SESSION_LOG);
}

/**
 * Run feature demo action
 */
export function runFeatureDemo(action: string, featureId?: string): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    // Simulate demo action
    setTimeout(() => {
      logSessionAction(`demo-${action}`, { featureId });
      resolve({
        success: true,
        message: `Demo action "${action}" completed successfully!`,
      });
    }, 800);
  });
}

/**
 * Helper: Get file type from filename
 */
function getFileType(filename: string): FileType {
  const ext = filename.split('.').pop()?.toUpperCase();
  const typeMap: Record<string, FileType> = {
    CSV: 'CSV',
    XLSX: 'XLSX',
    XLS: 'XLSX',
    OFX: 'OFX',
    QFX: 'QFX',
    PDF: 'PDF',
    JSON: 'JSON',
    PNG: 'PNG',
    JPG: 'JPG',
    JPEG: 'JPG',
    ZIP: 'ZIP',
  };
  return typeMap[ext || ''] || 'PDF';
}

export default {
  getOverview,
  getFeatures,
  getFeaturesByCategory,
  getIntegrations,
  getPricing,
  getTestimonials,
  getFeatureStatus,
  toggleFeature,
  getIntegrationStatus,
  toggleIntegration,
  uploadFile,
  getUploadedFiles,
  deleteUploadedFile,
  parseFile,
  seedDemoData,
  logSessionAction,
  getSessionLog,
  clearSessionLog,
  runFeatureDemo,
};

