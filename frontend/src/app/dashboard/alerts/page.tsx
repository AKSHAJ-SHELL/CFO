'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, AlertTriangle, CheckCircle, Info, ArrowLeft } from 'lucide-react';
import Breadcrumb from '@/components/saas/Breadcrumb';

export default function AlertsPage() {
  const [alerts] = useState([
    { id: '1', type: 'warning', title: 'Overdue Invoice', message: 'Invoice INV-1001 is overdue by 5 days', time: '2 hours ago' },
    { id: '2', type: 'info', title: 'Low Cash Reserve', message: 'Cash reserves are below recommended threshold', time: '5 hours ago' },
    { id: '3', type: 'success', title: 'Payment Received', message: 'Payment of $5,000 received from Acme Corp', time: '1 day ago' },
    { id: '4', type: 'error', title: 'Anomaly Detected', message: 'Unusual expense spike detected in Utilities category', time: '2 days ago' },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'error': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'success': return 'text-green-400 bg-green-400/20 border-green-400/30';
      default: return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-background-main py-12 px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb items={[
          { label: 'AI', href: '/dashboard/ai' },
          { label: 'AI Alerts' },
        ]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-dark mb-2">AI Alerts</h1>
            <p className="text-text-muted">Smart notifications for anomalies and important events</p>
          </div>
          <Link
            href="/dashboard/ai"
            className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        </div>

        <div className="space-y-4">
          {alerts.map((alert) => {
            const Icon = getIcon(alert.type);
            return (
              <div
                key={alert.id}
                className={`card-base border ${getColor(alert.type)}`}
              >
                <div className="flex items-start gap-4">
                  <Icon className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-text-dark">{alert.title}</h3>
                      <span className="text-text-muted text-sm">{alert.time}</span>
                    </div>
                    <p className="text-text-muted">{alert.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

