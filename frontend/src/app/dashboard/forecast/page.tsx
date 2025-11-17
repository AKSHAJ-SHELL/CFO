'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

export default function ForecastPage() {
  const [forecast] = useState({
    nextMonth: { revenue: 45000, expenses: 32000, cashflow: 13000 },
    nextQuarter: { revenue: 135000, expenses: 96000, cashflow: 39000 },
    nextYear: { revenue: 540000, expenses: 384000, cashflow: 156000 },
  });

  return (
    <div className="min-h-screen py-12 px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Forecasting & Predictions</h1>
          <p className="text-gray-400">AI-powered cash flow and revenue forecasting</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <BarChart3 className="h-8 w-8 text-blue-400 mb-4" />
            <div className="text-2xl font-bold text-white mb-1">Next Month</div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Revenue</span>
                <span className="text-green-400">${forecast.nextMonth.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Expenses</span>
                <span className="text-red-400">${forecast.nextMonth.expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-800">
                <span className="text-white">Cash Flow</span>
                <span className="text-blue-400">${forecast.nextMonth.cashflow.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <TrendingUp className="h-8 w-8 text-green-400 mb-4" />
            <div className="text-2xl font-bold text-white mb-1">Next Quarter</div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Revenue</span>
                <span className="text-green-400">${forecast.nextQuarter.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Expenses</span>
                <span className="text-red-400">${forecast.nextQuarter.expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-800">
                <span className="text-white">Cash Flow</span>
                <span className="text-blue-400">${forecast.nextQuarter.cashflow.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <TrendingDown className="h-8 w-8 text-purple-400 mb-4" />
            <div className="text-2xl font-bold text-white mb-1">Next Year</div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Revenue</span>
                <span className="text-green-400">${forecast.nextYear.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Expenses</span>
                <span className="text-red-400">${forecast.nextYear.expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-800">
                <span className="text-white">Cash Flow</span>
                <span className="text-blue-400">${forecast.nextYear.cashflow.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

