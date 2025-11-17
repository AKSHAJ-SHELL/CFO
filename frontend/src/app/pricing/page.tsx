'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import SaaSNavbar from '@/components/saas/Navbar';
import Section from '@/components/saas/Section';
import PricingCard from '@/components/saas/PricingCard';
import { getPricing } from '@/lib/mockApi';

/**
 * Pricing page
 */
export default function PricingPage() {
  const plans = getPricing();

  return (
    <div className="min-h-screen bg-background-main">
      <SaaSNavbar />
      
      <Section id="pricing-hero" title="Simple, Transparent Pricing" subtitle="Choose the plan that works for you">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PricingCard key={plan.tier} plan={plan} />
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-16 max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-text-dark mb-8 text-center">Feature Comparison</h3>
          <div className="card-base overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-text-dark">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.tier} className="text-center py-4 px-6 font-semibold text-text-dark">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  'Unlimited invoices',
                  'Advanced reporting',
                  'API access',
                  'Custom integrations',
                  'AI-powered insights',
                  'Priority support',
                  'Dedicated support',
                ].map((feature) => (
                  <tr key={feature} className="border-b border-gray-100">
                    <td className="py-4 px-6 text-text-dark">{feature}</td>
                    {plans.map((plan) => (
                      <td key={plan.tier} className="text-center py-4 px-6">
                        {plan.features.includes(feature) ? (
                          <Check className="h-5 w-5 text-primary-blue mx-auto" />
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
    </div>
  );
}

