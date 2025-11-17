'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Plus, Send, DollarSign, Clock, ArrowLeft } from 'lucide-react';
import { mockInvoices, mockCustomers } from '@/lib/mockData';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [customers, setCustomers] = useState(mockCustomers);

  const stats = {
    total: invoices.length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.is_overdue).length,
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      viewed: 'bg-purple-100 text-purple-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      partial: 'bg-yellow-100 text-yellow-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-background-main py-12 px-8">
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-text-muted mb-4">
        <Link href="/dashboard" className="hover:text-primary-blue">Dashboard</Link>
        <span>/</span>
        <Link href="/dashboard/finances" className="hover:text-primary-blue">Finances</Link>
        <span>/</span>
        <span className="text-text-dark">Invoices & Collections</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-text-dark mb-2">Invoices & Collections</h1>
          <p className="text-text-muted">
            Manage your invoices, track payments, and automate collections.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            href="/dashboard/finances"
            className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
          <button className="flex items-center px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90">
            <Plus className="h-5 w-5 mr-2" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Invoices', value: stats.total, icon: FileText, color: 'blue', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' },
          { label: 'Sent', value: stats.sent, icon: Send, color: 'purple', bgColor: 'bg-purple-500/20', textColor: 'text-purple-400' },
          { label: 'Paid', value: stats.paid, icon: DollarSign, color: 'green', bgColor: 'bg-green-500/20', textColor: 'text-green-400' },
          { label: 'Overdue', value: stats.overdue, icon: Clock, color: 'red', bgColor: 'bg-red-500/20', textColor: 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="card-base">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-text-dark">{stat.value}</p>
              </div>
              <div className={`rounded-full ${stat.bgColor} p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="card-base">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-text-dark">Recent Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-text-dark">{invoice.invoice_number}</td>
                  <td className="px-6 py-4 text-sm text-text-dark">{invoice.customer_name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-text-dark">${invoice.total_amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-text-dark">{new Date(invoice.due_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-primary-blue hover:text-primary-blue/80 mr-3">View</button>
                    <button className="text-primary-blue hover:text-primary-blue/80">Send</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AR Aging Report */}
      <div className="card-base">
        <h2 className="text-xl font-bold text-text-dark mb-4">AR Aging Report</h2>
        <div className="grid gap-4 sm:grid-cols-5">
          {[
            { label: 'Current', amount: 12500, color: 'green' },
            { label: '1-30 Days', amount: 3200, color: 'blue' },
            { label: '31-60 Days', amount: 1800, color: 'yellow' },
            { label: '61-90 Days', amount: 800, color: 'orange' },
            { label: '90+ Days', amount: 200, color: 'red' },
          ].map((bucket) => (
            <div key={bucket.label} className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-text-muted mb-2">{bucket.label}</p>
              <p className="text-2xl font-bold text-text-dark">${(bucket.amount / 1000).toFixed(1)}k</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

