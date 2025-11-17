'use client';

import FeatureSection from '@/components/FeatureSection';
import MetricCard from '@/components/MetricCard';
import { MessageSquare, FlaskConical } from 'lucide-react';

export default function AIChat() {
  return (
    <FeatureSection
      id="aichat"
      title="AI CFO Chat & Model Playground"
      tagline="Intelligent insights and experimentation"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI CFO Chat</h3>
              <p className="text-gray-600">Chat interface placeholder</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 italic">
              Ask questions about your financial data and get instant AI-powered insights.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FlaskConical className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Model Playground</h3>
              <p className="text-gray-600">Upload & inference panel</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 italic">
              Experiment with ML models, upload data, and visualize predictions.
            </p>
          </div>
        </div>
      </div>
    </FeatureSection>
  );
}

