'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  FileText,
  TrendingUp,
  CreditCard,
  DollarSign,
  Activity,
  PiggyBank,
  BarChart3,
  Bell,
  LineChart,
  MessageSquare,
  FlaskConical,
  Settings,
  FileStack,
  LayoutDashboard,
} from 'lucide-react';
import FeatureModal from '@/components/FeatureModal';

type Feature = {
  id: string;
  name: string;
  description: string;
  icon: any;
  href: string;
  gradient: string;
  category: string;
  details?: string;
  capabilities?: string[];
};

const allFeatures: Feature[] = [
  {
    id: 'invoices',
    name: 'Invoice Management',
    description: 'Automate invoicing, track payments, and manage AR aging',
    icon: FileText,
    href: '/dashboard/invoices',
    gradient: 'from-blue-500 to-cyan-500',
    category: 'Financial Tools',
    details: 'Streamline your accounts receivable with automated invoice creation, payment tracking, and intelligent AR aging reports.',
    capabilities: [
      'Automated invoice generation',
      'Payment tracking and reminders',
      'AR aging analysis',
      'Customer payment history',
      'Stripe integration',
    ],
  },
  {
    id: 'scenario',
    name: 'Scenario Planning',
    description: 'Financial modeling and what-if analysis',
    icon: TrendingUp,
    href: '/dashboard/scenario-planner',
    gradient: 'from-purple-500 to-pink-500',
    category: 'Financial Tools',
    details: 'Build and compare financial scenarios to make informed decisions. Model revenue changes, expense adjustments, and growth trajectories.',
    capabilities: [
      'Multi-scenario modeling',
      'Sensitivity analysis',
      'Budget tracking',
      'Goal setting',
      'Performance comparison',
    ],
  },
  {
    id: 'billpay',
    name: 'Bill Pay Automation',
    description: 'Automated bill processing with OCR and approval workflows',
    icon: CreditCard,
    href: '/dashboard/bill-pay',
    gradient: 'from-indigo-500 to-purple-500',
    category: 'Automation',
    details: 'Automate bill processing with OCR extraction, approval workflows, and scheduled payments.',
    capabilities: [
      'OCR bill capture',
      'Approval workflows',
      'Vendor management',
      'Payment scheduling',
      'Recurring bill detection',
    ],
  },
  {
    id: 'profitability',
    name: 'Profitability Intelligence',
    description: 'Customer, product, and project profitability analysis',
    icon: DollarSign,
    href: '/dashboard/profitability',
    gradient: 'from-green-500 to-teal-500',
    category: 'Analytics',
    details: 'Understand profitability across customers, products, and projects with detailed margin analysis.',
    capabilities: [
      'Customer profitability',
      'Product margin analysis',
      'LTV prediction',
      'Time tracking integration',
      'Profitability insights',
    ],
  },
  {
    id: 'health',
    name: 'Financial Health Score',
    description: 'Real-time financial health monitoring and insights',
    icon: Activity,
    href: '/dashboard/health-score',
    gradient: 'from-red-500 to-orange-500',
    category: 'Dashboards',
    details: 'Get a comprehensive view of your financial health with real-time scoring and recommendations.',
    capabilities: [
      'Health score calculation',
      'Benchmarking',
      'Component analysis',
      'Recommendations',
      'Progress tracking',
    ],
  },
  {
    id: 'reserves',
    name: 'Smart Cash Reserves',
    description: 'Automated cash reserve management and goal tracking',
    icon: PiggyBank,
    href: '/dashboard/cash-reserves',
    gradient: 'from-yellow-500 to-amber-500',
    category: 'Automation',
    details: 'Automatically manage cash reserves with goal-based savings and liquidity protection.',
    capabilities: [
      'Reserve goal calculator',
      'Auto-transfer engine',
      'Bank integration',
      'Liquidity protection',
      'Savings automation',
    ],
  },
  {
    id: 'forecast',
    name: 'Forecasting & Predictions',
    description: 'AI-powered cash flow and revenue forecasting',
    icon: BarChart3,
    href: '/dashboard/forecast',
    gradient: 'from-cyan-500 to-blue-500',
    category: 'AI Models',
    details: 'Predict future cash flow and revenue using machine learning models trained on your financial data.',
    capabilities: [
      'Cash flow forecasting',
      'Revenue predictions',
      'Anomaly detection',
      'Trend analysis',
      'ML-powered insights',
    ],
  },
  {
    id: 'alerts',
    name: 'AI Alerts',
    description: 'Smart notifications for anomalies and important events',
    icon: Bell,
    href: '/dashboard/alerts',
    gradient: 'from-pink-500 to-rose-500',
    category: 'AI Models',
    details: 'Stay informed with intelligent alerts for financial anomalies, overdue payments, and critical events.',
    capabilities: [
      'Anomaly detection',
      'Custom alert rules',
      'Email notifications',
      'Real-time monitoring',
      'Smart prioritization',
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics & Reports',
    description: 'Comprehensive financial analytics and custom reports',
    icon: LineChart,
    href: '/dashboard/analytics',
    gradient: 'from-violet-500 to-purple-500',
    category: 'Dashboards',
    details: 'Deep dive into your financial data with comprehensive analytics and customizable reports.',
    capabilities: [
      'Custom reports',
      'Data visualization',
      'Export capabilities',
      'Scheduled reports',
      'Historical analysis',
    ],
  },
  {
    id: 'chat',
    name: 'AI CFO Chat',
    description: 'Conversational AI assistant for financial questions',
    icon: MessageSquare,
    href: '/dashboard/chat',
    gradient: 'from-emerald-500 to-green-500',
    category: 'AI Models',
    details: 'Ask questions about your finances and get intelligent answers powered by AI.',
    capabilities: [
      'Natural language queries',
      'Financial insights',
      'Instant answers',
      'Context-aware responses',
      'Document understanding',
    ],
  },
  {
    id: 'playground',
    name: 'Model Playground',
    description: 'Test and train custom financial models',
    icon: FlaskConical,
    href: '/dashboard/playground',
    gradient: 'from-orange-500 to-red-500',
    category: 'AI Models',
    details: 'Upload datasets, train custom models, and test predictions in a sandbox environment.',
    capabilities: [
      'Model training',
      'Dataset upload',
      'Prediction testing',
      'Model evaluation',
      'Custom algorithms',
    ],
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configure your FinPilot account and preferences',
    icon: Settings,
    href: '/dashboard/settings',
    gradient: 'from-gray-500 to-slate-500',
    category: 'Utility',
    details: 'Manage your account settings, integrations, and preferences.',
    capabilities: [
      'Account management',
      'Integration settings',
      'Notification preferences',
      'User management',
      'Security settings',
    ],
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Generate and schedule custom financial reports',
    icon: FileStack,
    href: '/dashboard/reports',
    gradient: 'from-teal-500 to-cyan-500',
    category: 'Dashboards',
    details: 'Create, customize, and schedule financial reports for stakeholders.',
    capabilities: [
      'Report builder',
      'Scheduled delivery',
      'Multiple formats',
      'Custom templates',
      'Export options',
    ],
  },
  {
    id: 'dashboard',
    name: 'Dashboard Overview',
    description: 'Comprehensive overview of all financial metrics',
    icon: LayoutDashboard,
    href: '/dashboard',
    gradient: 'from-blue-600 to-indigo-600',
    category: 'Dashboards',
    details: 'Get a high-level view of your financial health and key metrics.',
    capabilities: [
      'Key metrics overview',
      'Quick insights',
      'Trend visualization',
      'Alert summary',
      'Recent activity',
    ],
  },
];

const categories = ['All', 'AI Models', 'Financial Tools', 'Dashboards', 'Automation', 'Analytics', 'Utility'];

export default function WorkSection() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const filteredFeatures =
    selectedCategory === 'All'
      ? allFeatures
      : allFeatures.filter((f) => f.category === selectedCategory);

  return (
    <section
      id="work"
      ref={ref}
      className="min-h-screen py-24 px-8 section-snap"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold uppercase text-white tracking-wider mb-4">
            Work
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore FinPilot's comprehensive feature portfolio
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-mono text-sm uppercase tracking-wider transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <div
                  onClick={() => setSelectedFeature(feature)}
                  className="group relative h-full bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
                >
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="text-xs text-gray-500 font-mono uppercase">
                      {feature.category}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Learn More */}
                  <div className="text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                    Learn more →
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-lg transition-all duration-300" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Feature Modal */}
      {selectedFeature && (
        <FeatureModal
          isOpen={!!selectedFeature}
          onClose={() => setSelectedFeature(null)}
          feature={selectedFeature}
        />
      )}
    </section>
  );
}

