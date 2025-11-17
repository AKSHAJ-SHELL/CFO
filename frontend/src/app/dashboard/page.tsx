'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  DollarSign, Zap, Brain, Sparkles, CheckCircle, ArrowRight, Settings, Plug,
  FileText, Receipt, PieChart, Activity, PiggyBank, BarChart, FileBarChart,
  TrendingUp, Bell, MessageSquare
} from 'lucide-react';
import SaaSNavbar from '@/components/saas/Navbar';
import Section from '@/components/saas/Section';
import BetaToolbar from '@/components/saas/BetaToolbar';
import FileUpload from '@/components/saas/FileUpload';
import { getFeatures, getFeatureStatus, seedDemoData, FEATURE_CATEGORIES } from '@/lib/mockApi';
import type { Feature } from '@/lib/types';

/**
 * Enhanced Beta Dashboard with category-based navigation
 */
export default function BetaDashboardPage() {
  const [features] = useState<Feature[]>(getFeatures());
  const [featureStatuses, setFeatureStatuses] = useState(getFeatureStatus());

  useEffect(() => {
    // Ensure all features are enabled
    const statuses = getFeatureStatus();
    const allEnabled = statuses.every(s => s.enabled);
    if (!allEnabled) {
      // Seed demo data to enable all features
      if (typeof window !== 'undefined') {
        seedDemoData();
        setFeatureStatuses(getFeatureStatus());
      }
    }
  }, []);

  const categories = [
    {
      id: 'finances',
      title: 'Finances',
      description: 'Invoices, bills, profitability, health scores, cash reserves, analytics',
      icon: DollarSign,
      count: FEATURE_CATEGORIES.finances.length,
      color: 'primary-blue',
      bgColor: 'bg-primary-blue/10',
      textColor: 'text-primary-blue',
      buttonColor: 'bg-primary-blue hover:bg-primary-blue/90',
    },
    {
      id: 'automation',
      title: 'Automation',
      description: 'Automated invoicing and bill payment workflows',
      icon: Zap,
      count: FEATURE_CATEGORIES.automation.length,
      color: 'primary-green',
      bgColor: 'bg-primary-green/10',
      textColor: 'text-primary-green',
      buttonColor: 'bg-primary-green hover:bg-primary-green/90',
    },
    {
      id: 'models',
      title: 'Models',
      description: 'Scenario planning, budget simulation, and model training',
      icon: Brain,
      count: FEATURE_CATEGORIES.models.length,
      color: 'accent-violet',
      bgColor: 'bg-accent-violet/10',
      textColor: 'text-accent-violet',
      buttonColor: 'bg-accent-violet hover:bg-accent-violet/90',
    },
    {
      id: 'ai',
      title: 'AI',
      description: 'AI-powered forecasting, alerts, and CFO chat',
      icon: Sparkles,
      count: FEATURE_CATEGORIES.ai.length,
      color: 'primary-teal',
      bgColor: 'bg-primary-teal/10',
      textColor: 'text-primary-teal',
      buttonColor: 'bg-primary-teal hover:bg-primary-teal/90',
    },
  ];

  return (
    <div className="min-h-screen bg-background-main">
      <SaaSNavbar />
      <BetaToolbar />
      
      <Section id="dashboard-hero" title="Beta Testing Dashboard" subtitle="All features enabled - Test everything!">
        {/* Category Cards */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-text-dark mb-6">Browse by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  href={`/dashboard/${category.id}`}
                  className="block"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-base hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 rounded-lg ${category.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className={`h-8 w-8 ${category.textColor}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-2xl font-bold text-text-dark group-hover:text-primary-blue transition-colors">{category.title}</h4>
                            <span className="text-sm px-2 py-1 rounded bg-status-success/20 text-status-success">
                              {category.count} features
                            </span>
                          </div>
                          <p className="text-sm text-text-muted">{category.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`w-full px-6 py-3 text-white rounded-lg ${category.buttonColor} transition-colors inline-flex items-center justify-center space-x-2 group-hover:shadow-lg`}>
                      <span>Explore {category.title}</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Access - All Features */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-text-dark">Quick Access - All Features</h3>
            <span className="text-sm text-text-muted">{features.length} features available</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {features.map((feature) => {
              const featureIcons: Record<string, typeof FileText> = {
                invoices: FileText,
                'scenario-planner': TrendingUp,
                'bill-pay': Receipt,
                profitability: PieChart,
                'health-score': Activity,
                'cash-reserves': PiggyBank,
                forecast: TrendingUp,
                alerts: Bell,
                analytics: BarChart,
                chat: MessageSquare,
                playground: Brain,
                reports: FileBarChart,
                settings: Settings,
                integrations: Plug,
              };
              const FeatureIcon = featureIcons[feature.id] || FileText;
              
              return (
                <Link
                  key={feature.id}
                  href={`/dashboard/${feature.id}`}
                  className="group"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="card-base hover:shadow-lg transition-all cursor-pointer p-4 text-center"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary-blue/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-blue/20 transition-colors">
                      <FeatureIcon className="h-6 w-6 text-primary-blue" />
                    </div>
                    <h4 className="text-sm font-semibold text-text-dark mb-1 group-hover:text-primary-blue transition-colors line-clamp-2">
                      {feature.title.split('&')[0].trim()}
                    </h4>
                    <span className="text-xs text-text-muted">Click to open</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Access to Settings & Integrations */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-text-dark mb-4">More Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/settings"
              className="group card-base hover:shadow-lg transition-all flex items-center space-x-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-primary-blue/10 transition-colors">
                <Settings className="h-6 w-6 text-gray-600 group-hover:text-primary-blue transition-colors" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-text-dark group-hover:text-primary-blue transition-colors">Settings & Configuration</h4>
                <p className="text-sm text-text-muted">Configure your FinPilot account</p>
              </div>
              <ArrowRight className="h-5 w-5 text-text-muted ml-auto group-hover:translate-x-1 group-hover:text-primary-blue transition-all" />
            </Link>
            <Link
              href="/dashboard/integrations"
              className="group card-base hover:shadow-lg transition-all flex items-center space-x-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-primary-blue/10 transition-colors">
                <Plug className="h-6 w-6 text-gray-600 group-hover:text-primary-blue transition-colors" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-text-dark group-hover:text-primary-blue transition-colors">Integrations Hub</h4>
                <p className="text-sm text-text-muted">Connect with your favorite tools</p>
              </div>
              <ArrowRight className="h-5 w-5 text-text-muted ml-auto group-hover:translate-x-1 group-hover:text-primary-blue transition-all" />
            </Link>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-text-dark mb-4">Upload Financial Records</h3>
          <div className="card-base">
            <FileUpload />
          </div>
        </div>

        {/* All Features Enabled Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 p-6 bg-gradient-to-r from-primary-teal to-primary-blue rounded-lg text-white"
        >
          <div className="flex items-center space-x-4">
            <CheckCircle className="h-8 w-8" />
            <div>
              <h4 className="text-lg font-semibold mb-1">All Features Enabled</h4>
              <p className="text-sm text-white/90">
                All {features.length} features are active and ready for testing. Click on any category above to explore features.
              </p>
            </div>
          </div>
        </motion.div>
      </Section>
    </div>
  );
}
