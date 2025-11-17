'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
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

const features = [
  {
    id: 'invoices',
    name: 'Invoice Management',
    description: 'Automate invoicing, track payments, and manage AR aging',
    icon: FileText,
    href: '/dashboard/invoices',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'scenario',
    name: 'Scenario Planning',
    description: 'Financial modeling and what-if analysis',
    icon: TrendingUp,
    href: '/dashboard/scenario-planner',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'billpay',
    name: 'Bill Pay Automation',
    description: 'Automated bill processing with OCR and approval workflows',
    icon: CreditCard,
    href: '/dashboard/bill-pay',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'profitability',
    name: 'Profitability Intelligence',
    description: 'Customer, product, and project profitability analysis',
    icon: DollarSign,
    href: '/dashboard/profitability',
    gradient: 'from-green-500 to-teal-500',
  },
  {
    id: 'health',
    name: 'Financial Health Score',
    description: 'Real-time financial health monitoring and insights',
    icon: Activity,
    href: '/dashboard/health-score',
    gradient: 'from-red-500 to-orange-500',
  },
  {
    id: 'reserves',
    name: 'Smart Cash Reserves',
    description: 'Automated cash reserve management and goal tracking',
    icon: PiggyBank,
    href: '/dashboard/cash-reserves',
    gradient: 'from-yellow-500 to-amber-500',
  },
  {
    id: 'forecast',
    name: 'Forecasting & Predictions',
    description: 'AI-powered cash flow and revenue forecasting',
    icon: BarChart3,
    href: '/dashboard/forecast',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'alerts',
    name: 'AI Alerts',
    description: 'Smart notifications for anomalies and important events',
    icon: Bell,
    href: '/dashboard/alerts',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    id: 'analytics',
    name: 'Analytics & Reports',
    description: 'Comprehensive financial analytics and custom reports',
    icon: LineChart,
    href: '/dashboard/analytics',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    id: 'chat',
    name: 'AI CFO Chat',
    description: 'Conversational AI assistant for financial questions',
    icon: MessageSquare,
    href: '/dashboard/chat',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    id: 'playground',
    name: 'Model Playground',
    description: 'Test and train custom financial models',
    icon: FlaskConical,
    href: '/dashboard/playground',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configure your FinPilot account and preferences',
    icon: Settings,
    href: '/dashboard/settings',
    gradient: 'from-gray-500 to-slate-500',
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Generate and schedule custom financial reports',
    icon: FileStack,
    href: '/dashboard/reports',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'dashboard',
    name: 'Dashboard Overview',
    description: 'Comprehensive overview of all financial metrics',
    icon: LayoutDashboard,
    href: '/dashboard',
    gradient: 'from-blue-600 to-indigo-600',
  },
];

export default function ExpertiseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="expertise"
      ref={ref}
      className="min-h-screen py-24 px-8 section-snap"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold uppercase text-white tracking-wider mb-4">
            Expertise
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Comprehensive financial management tools powered by AI
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={feature.href}>
                  <div className="group relative h-full bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {feature.name}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-lg transition-all duration-300" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

