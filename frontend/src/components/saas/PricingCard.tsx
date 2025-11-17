'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { PricingPlan } from '@/lib/types';

interface PricingCardProps {
  plan: PricingPlan;
}

/**
 * PricingCard component for displaying pricing tiers
 */
export default function PricingCard({ plan }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`card-base relative ${plan.highlighted ? 'ring-2 ring-primary-blue scale-105' : ''}`}
    >
      {plan.highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary-blue text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-text-dark mb-2">{plan.name}</h3>
        <p className="text-text-muted mb-4">{plan.description}</p>
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold text-text-dark">
            ${plan.price}
          </span>
          {plan.priceUnit && (
            <span className="text-text-muted ml-2">/{plan.priceUnit}</span>
          )}
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-primary-blue mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-text-dark">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full py-3 rounded-lg font-medium transition-all ${
          plan.highlighted
            ? 'bg-gradient-to-r from-primary-teal to-primary-blue text-white hover:from-primary-teal/90 hover:to-primary-blue/90'
            : 'bg-background-main text-text-dark hover:bg-gray-200 border-2 border-gray-300'
        }`}
      >
        {plan.ctaText}
      </button>
    </motion.div>
  );
}

