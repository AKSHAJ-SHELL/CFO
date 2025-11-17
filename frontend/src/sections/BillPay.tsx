'use client';

import FeatureSection from '@/components/FeatureSection';
import MetricCard from '@/components/MetricCard';
import { Building2, FileText, Workflow } from 'lucide-react';

export default function BillPay() {
  return (
    <FeatureSection
      id="billpay"
      title="Bill Pay Automation"
      tagline="Smart approvals and automated bill handling"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={Building2}
          title="Vendors"
          description="Vendor management and payment history"
          href="#"
          gradient="from-green-500 to-emerald-500"
        />
        <MetricCard
          icon={FileText}
          title="Bills"
          description="Bill tracking with OCR and approvals"
          href="#"
          gradient="from-emerald-500 to-teal-500"
        />
        <MetricCard
          icon={Workflow}
          title="Workflows"
          description="Customizable approval routing"
          href="#"
          gradient="from-teal-500 to-cyan-500"
        />
      </div>
    </FeatureSection>
  );
}

