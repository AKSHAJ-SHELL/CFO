'use client';

import FeatureSection from '@/components/FeatureSection';
import MetricCard from '@/components/MetricCard';
import { TrendingUp, Target, BarChart3 } from 'lucide-react';

export default function ScenarioPlanning() {
  return (
    <FeatureSection
      id="scenarios"
      title="Scenario Planning & Budgets"
      tagline="Model outcomes and stay ahead of your targets"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={TrendingUp}
          title="Scenarios"
          description="Financial what-if scenario modeling"
          href="#"
          gradient="from-indigo-500 to-sky-500"
        />
        <MetricCard
          icon={BarChart3}
          title="Budgets"
          description="Budget management with variance tracking"
          href="#"
          gradient="from-sky-500 to-cyan-500"
        />
        <MetricCard
          icon={Target}
          title="Goals"
          description="Financial goal tracking and progress"
          href="#"
          gradient="from-cyan-500 to-teal-500"
        />
      </div>
    </FeatureSection>
  );
}

