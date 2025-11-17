'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, Sparkles } from 'lucide-react';
import SaaSNavbar from '@/components/saas/Navbar';
import Section from '@/components/saas/Section';
import { getIntegrations } from '@/lib/mockApi';
import type { Integration } from '@/lib/types';

/**
 * Integrations page
 */
export default function IntegrationsPage() {
  const integrations = getIntegrations();
  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Connected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-status-success/20 text-status-success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </span>
        );
      case 'Available':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-blue/20 text-primary-blue">
            <Clock className="h-3 w-3 mr-1" />
            Available
          </span>
        );
      case 'Coming Soon':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-violet/20 text-accent-violet">
            <Sparkles className="h-3 w-3 mr-1" />
            Coming Soon
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background-main">
      <SaaSNavbar />
      
      <Section id="integrations-hero" title="Integrations" subtitle="Connect FinPilot with your favorite tools">
        <div className="space-y-12">
          {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
            <div key={category}>
              <h3 className="text-2xl font-bold text-text-dark mb-6">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryIntegrations.map((integration) => (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="card-base hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-background-main rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-blue">
                          {integration.name.charAt(0)}
                        </span>
                      </div>
                      {getStatusBadge(integration.status)}
                    </div>
                    <h4 className="text-lg font-semibold text-text-dark mb-2">{integration.name}</h4>
                    <p className="text-text-muted text-sm mb-4">{integration.description}</p>
                    {integration.connectedSince && (
                      <p className="text-xs text-text-muted">
                        Connected since {new Date(integration.connectedSince).toLocaleDateString()}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

