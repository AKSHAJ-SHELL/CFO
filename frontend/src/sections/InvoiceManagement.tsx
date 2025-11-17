'use client';

import FeatureSection from '@/components/FeatureSection';
import MetricCard from '@/components/MetricCard';
import { FileText, Users, TrendingUp, Clock, Send, DollarSign } from 'lucide-react';

export default function InvoiceManagement() {
  return (
    <FeatureSection
      id="invoices"
      title="Invoice Management"
      tagline="Automate and analyze your AR lifecycle"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Users}
          title="Customers API"
          description="Manage customer records and payment analytics"
          href="#"
          gradient="from-blue-500 to-cyan-500"
        />
        <MetricCard
          icon={FileText}
          title="Invoices API"
          description="Create, view, and manage invoices"
          href="#"
          gradient="from-indigo-500 to-purple-500"
        />
        <MetricCard
          title="AR Aging Report"
          description="Accounts receivable aging analysis"
          icon={TrendingUp}
          href="#"
          gradient="from-purple-500 to-pink-500"
        />
        <MetricCard
          icon={Send}
          title="Reminders"
          description="Configure automated invoice reminders"
          href="#"
          gradient="from-pink-500 to-rose-500"
        />
      </div>
    </FeatureSection>
  );
}

