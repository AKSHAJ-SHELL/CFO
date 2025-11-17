'use client';

import { useState } from 'react';
import { Plug, CheckCircle, ExternalLink, Building2, CreditCard, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const integrations = [
  {
    id: 'plaid',
    name: 'Plaid',
    category: 'Banking',
    description: 'Connect bank accounts and access transaction data',
    status: 'connected',
    icon: Building2,
    color: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Payment',
    description: 'Process payments and manage subscriptions',
    status: 'connected',
    icon: CreditCard,
    color: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'Accounting',
    description: 'Sync accounting data and transactions',
    status: 'connected',
    icon: BarChart3,
    color: 'bg-green-500/10',
    iconColor: 'text-green-500',
  },
  {
    id: 'xero',
    name: 'Xero',
    category: 'Accounting',
    description: 'Cloud-based accounting platform integration',
    status: 'available',
    icon: BarChart3,
    color: 'bg-gray-200',
    iconColor: 'text-gray-500',
  },
  {
    id: 'freshbooks',
    name: 'FreshBooks',
    category: 'Accounting',
    description: 'Invoicing and time tracking integration',
    status: 'available',
    icon: BarChart3,
    color: 'bg-gray-200',
    iconColor: 'text-gray-500',
  },
];

export default function IntegrationsPage() {
  const [filter, setFilter] = useState<string>('all');

  const filteredIntegrations = filter === 'all' 
    ? integrations 
    : integrations.filter(i => i.status === filter);

  return (
    <div className="min-h-screen bg-background-main py-12 px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-text-muted mb-4">
          <Link href="/dashboard" className="hover:text-primary-blue">Dashboard</Link>
          <span>/</span>
          <span className="text-text-dark">Integrations Hub</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-dark mb-2">Integrations Hub</h1>
            <p className="text-text-muted">
              Connect FinPilot with your favorite tools and platforms
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-background-main transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-base">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Connected</p>
                <p className="text-3xl font-bold text-text-dark mt-2">
                  {integrations.filter(i => i.status === 'connected').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary-green" />
            </div>
          </div>
          <div className="card-base">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Available</p>
                <p className="text-3xl font-bold text-text-dark mt-2">
                  {integrations.filter(i => i.status === 'available').length}
                </p>
              </div>
              <Plug className="h-8 w-8 text-primary-blue" />
            </div>
          </div>
          <div className="card-base">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Total</p>
                <p className="text-3xl font-bold text-text-dark mt-2">{integrations.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-accent-violet" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-blue text-white'
                : 'bg-white text-text-dark border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('connected')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'connected'
                ? 'bg-primary-blue text-white'
                : 'bg-white text-text-dark border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Connected
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'available'
                ? 'bg-primary-blue text-white'
                : 'bg-white text-text-dark border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Available
          </button>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <div key={integration.id} className="card-base hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg ${integration.color} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${integration.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-dark">{integration.name}</h3>
                      <span className="text-xs text-text-muted">{integration.category}</span>
                    </div>
                  </div>
                  {integration.status === 'connected' && (
                    <CheckCircle className="h-5 w-5 text-primary-green" />
                  )}
                </div>

                <p className="text-sm text-text-muted mb-4">{integration.description}</p>

                <div className="flex space-x-2">
                  {integration.status === 'connected' ? (
                    <>
                      <button className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                        Manage
                      </button>
                      <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button className="flex-1 px-4 py-2 text-sm bg-primary-blue text-white rounded hover:bg-primary-blue/90 transition-colors">
                      Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Browse More */}
        <div className="card-base text-center">
          <Plug className="h-12 w-12 text-primary-blue mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-dark mb-2">Need More Integrations?</h3>
          <p className="text-text-muted mb-4">
            We're constantly adding new integrations. Request one or build your own.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Request Integration
            </button>
            <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              View API Docs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

