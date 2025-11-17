'use client';

import FeatureSection from '@/components/FeatureSection';
import MetricCard from '@/components/MetricCard';
import { Users, Package, Briefcase, Clock } from 'lucide-react';

export default function Profitability() {
  return (
    <FeatureSection
      id="profitability"
      title="Profitability Intelligence"
      tagline="Discover and optimize profit drivers"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Users}
          title="Customer Analysis"
          description="Customer-level profit analysis"
          href="#"
          gradient="from-orange-500 to-amber-500"
        />
        <MetricCard
          icon={Package}
          title="Product Analysis"
          description="Product margin tracking"
          href="#"
          gradient="from-amber-500 to-yellow-500"
        />
        <MetricCard
          icon={Briefcase}
          title="Projects"
          description="Project profitability tracking"
          href="#"
          gradient="from-yellow-500 to-lime-500"
        />
        <MetricCard
          icon={Clock}
          title="Time Entries"
          description="Time tracking integration"
          href="#"
          gradient="from-lime-500 to-green-500"
        />
      </div>
    </FeatureSection>
  );
}

