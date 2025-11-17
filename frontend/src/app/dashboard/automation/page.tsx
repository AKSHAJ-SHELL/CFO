'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Receipt, Play, ArrowLeft } from 'lucide-react';
import { getFeaturesByCategory } from '@/lib/mockApi';
import type { Feature } from '@/lib/types';

const iconMap: Record<string, typeof FileText> = {
  invoices: FileText,
  'bill-pay': Receipt,
};

export default function AutomationPage() {
  const features = getFeaturesByCategory('automation');

  return (
    <div className="min-h-screen bg-background-main py-12 px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-text-muted mb-4">
          <Link href="/dashboard" className="hover:text-primary-blue">Dashboard</Link>
          <span>/</span>
          <span className="text-text-dark">Automation</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-text-dark mb-2">Automation</h1>
            <p className="text-text-muted">
              Automate invoices, bill payments, and streamline workflows
            </p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-background-main transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.id] || FileText;
            return (
              <Link
                key={feature.id}
                href={`/dashboard/${feature.id}`}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="card-base hover:shadow-lg transition-all cursor-pointer group h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-primary-green/10 flex items-center justify-center group-hover:bg-primary-green/20 group-hover:scale-110 transition-all">
                        <Icon className="h-6 w-6 text-primary-green" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-dark group-hover:text-primary-green transition-colors">{feature.title}</h3>
                        <span className="text-xs px-2 py-1 rounded bg-status-success/20 text-status-success mt-1 inline-block">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-text-muted mb-4">{feature.short}</p>

                  <div className="w-full px-4 py-2 text-sm bg-primary-green text-white rounded hover:bg-primary-green/90 text-center transition-colors inline-flex items-center justify-center space-x-2 group-hover:shadow-lg">
                    <span>Open</span>
                    <Play className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

