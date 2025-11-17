'use client';

import FeatureSection from '@/components/FeatureSection';
import MetricCard from '@/components/MetricCard';
import { TrendingUp, Activity, AlertTriangle } from 'lucide-react';

export default function Forecasting() {
  return (
    <FeatureSection
      id="forecasting"
      title="Forecasting & Health"
      tagline="Predict and protect your future performance"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={TrendingUp}
          title="Cash Flow Forecast"
          description="AI-powered future cash predictions"
          href="#"
          gradient="from-violet-500 to-purple-500"
        />
        <MetricCard
          icon={Activity}
          title="Health Score"
          description="Composite financial health scoring"
          href="#"
          gradient="from-purple-500 to-fuchsia-500"
        />
        <MetricCard
          icon={AlertTriangle}
          title="Risk Alerts"
          description="Proactive financial risk detection"
          href="#"
          gradient="from-fuchsia-500 to-pink-500"
        />
      </div>
    </FeatureSection>
  );
}

