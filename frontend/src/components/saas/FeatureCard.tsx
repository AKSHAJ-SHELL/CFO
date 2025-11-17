'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, FileText, TrendingUp, Receipt, PieChart, Activity, PiggyBank, TrendingUp as TrendingUpIcon, Bell, BarChart, MessageSquare, Brain, FileBarChart, Settings, Plug } from 'lucide-react';
import type { Feature } from '@/lib/types';

// Icon mapping
const iconMap: Record<string, typeof FileText> = {
  invoices: FileText,
  'scenario-planner': TrendingUp,
  'bill-pay': Receipt,
  profitability: PieChart,
  'health-score': Activity,
  'cash-reserves': PiggyBank,
  forecast: TrendingUpIcon,
  alerts: Bell,
  analytics: BarChart,
  chat: MessageSquare,
  playground: Brain,
  reports: FileBarChart,
  settings: Settings,
  integrations: Plug,
};

interface FeatureCardProps {
  feature: Feature;
  onClick?: () => void;
}

/**
 * FeatureCard component for displaying features in grid
 */
export default function FeatureCard({ feature, onClick }: FeatureCardProps) {
  const Icon = iconMap[feature.id] || FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="card-base hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`View ${feature.title}`}
    >
      <div className="flex flex-col h-full">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-teal to-primary-blue flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-text-dark mb-2 group-hover:text-primary-blue transition-colors">
          {feature.title}
        </h3>

        {/* Short description */}
        <p className="text-text-muted mb-4 flex-grow">{feature.short}</p>

        {/* Category badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-accent-violet bg-accent-violet/10 px-2 py-1 rounded">
            {feature.category}
          </span>
          <ArrowRight className="h-5 w-5 text-text-muted group-hover:text-primary-blue group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </motion.div>
  );
}

