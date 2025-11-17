'use client';

import { useState } from 'react';
import { LineChart, BarChart3, PieChart } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen py-12 px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Analytics & Reports</h1>
          <p className="text-gray-400">Comprehensive financial analytics and custom reports</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <LineChart className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Revenue Trends</h3>
            <p className="text-gray-400 text-sm">Track revenue growth over time</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <BarChart3 className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Expense Analysis</h3>
            <p className="text-gray-400 text-sm">Detailed expense breakdowns</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <PieChart className="h-8 w-8 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Category Distribution</h3>
            <p className="text-gray-400 text-sm">Visualize spending by category</p>
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Custom Reports</h2>
          <p className="text-gray-400 mb-4">Create and schedule custom financial reports</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create Report
          </button>
        </div>
      </div>
    </div>
  );
}

