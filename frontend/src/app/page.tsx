'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Users, Clock, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';
import SaaSNavbar from '@/components/saas/Navbar';
import Section from '@/components/saas/Section';
import FeatureCard from '@/components/saas/FeatureCard';
import FeatureModal from '@/components/saas/FeatureModal';
import FileUpload from '@/components/saas/FileUpload';
import { getOverview, getFeatures } from '@/lib/mockApi';
import type { Feature } from '@/lib/types';

// Dynamically import FinanceSimulationScene to avoid SSR issues
const FinanceSimulationScene = dynamic(
  () => import('@/components/FinanceSimulationScene'),
  { ssr: false, loading: () => <div className="w-full h-[500px] bg-background-hero/50" /> }
);

/**
 * Overview page - Main landing page for FinPilot SaaS
 */
export default function OverviewPage() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const metrics = getOverview();
  const features = getFeatures().slice(0, 6); // Show first 6 features

  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <SaaSNavbar />
      
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Hero Section */}
      <section id="overview" className="relative min-h-screen flex items-center justify-center hero-overlay">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0 opacity-30">
          <FinanceSimulationScene />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center" id="main-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-text-light">
              Intelligent Financial Management
              <span className="block mt-2 gradient-text">for Modern Businesses</span>
            </h1>
            <p className="text-xl md:text-2xl text-text-light/80 max-w-3xl mx-auto">
              Automate workflows, predict outcomes, optimize profitability.
              Your AI-powered CFO assistant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-gradient-to-r from-primary-teal to-primary-blue text-white rounded-lg font-semibold hover:from-primary-teal/90 hover:to-primary-blue/90 transition-all"
              >
                Start Free Trial
              </Link>
              <Link
                href="/features"
                className="px-8 py-4 border-2 border-text-light text-text-light rounded-lg font-semibold hover:bg-text-light/10 transition-all"
              >
                Explore Features
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Metrics Section */}
      <Section id="metrics" title="Key Metrics" subtitle="See how FinPilot helps businesses succeed">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Monthly Recurring Revenue', value: `$${(metrics.mrr / 1000).toFixed(0)}k`, icon: TrendingUp, color: 'primary-blue', bgColor: 'bg-primary-blue/10', textColor: 'text-primary-blue' },
            { label: 'Active Customers', value: metrics.customers.toLocaleString(), icon: Users, color: 'primary-green', bgColor: 'bg-primary-green/10', textColor: 'text-primary-green' },
            { label: 'Runway Days', value: metrics.runwayDays.toString(), icon: Clock, color: 'accent-violet', bgColor: 'bg-accent-violet/10', textColor: 'text-accent-violet' },
            { label: 'Health Score', value: `${metrics.healthScore}/100`, icon: Activity, color: 'primary-teal', bgColor: 'bg-primary-teal/10', textColor: 'text-primary-teal' },
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-base text-center"
            >
              <div className={`w-12 h-12 rounded-lg ${metric.bgColor} flex items-center justify-center mx-auto mb-4`}>
                <metric.icon className={`h-6 w-6 ${metric.textColor}`} />
              </div>
              <p className="text-3xl font-bold text-text-dark mb-2">{metric.value}</p>
              <p className="text-text-muted">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* File Upload Section */}
      <Section id="upload" title="Upload Financial Records" subtitle="Test our file upload with any financial document">
        <div className="max-w-3xl mx-auto">
          <FileUpload />
        </div>
      </Section>

      {/* Feature Highlights */}
      <Section id="features" title="Featured Tools" subtitle="Discover what FinPilot can do for your business">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onClick={() => handleFeatureClick(feature)}
            />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/features"
            className="inline-flex items-center px-6 py-3 bg-primary-blue text-white rounded-lg font-medium hover:bg-primary-blue/90 transition-all"
          >
            View All Features
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </Section>

      {/* CTA Section */}
      <Section id="cta" className="bg-gradient-to-r from-primary-teal to-primary-blue text-white">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Finances?</h2>
          <p className="text-xl mb-8 text-white/90">Join hundreds of businesses using FinPilot AI</p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-white text-primary-blue rounded-lg font-semibold hover:bg-white/90 transition-all"
          >
            Start Free Trial
          </Link>
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-background-main border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-text-dark mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="text-text-muted hover:text-text-dark">Features</Link></li>
                <li><Link href="/pricing" className="text-text-muted hover:text-text-dark">Pricing</Link></li>
                <li><Link href="/integrations" className="text-text-muted hover:text-text-dark">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-text-dark mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/testimonials" className="text-text-muted hover:text-text-dark">Testimonials</Link></li>
                <li><Link href="/support" className="text-text-muted hover:text-text-dark">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-text-dark mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard" className="text-text-muted hover:text-text-dark">Dashboard</Link></li>
                <li><a href="#" className="text-text-muted hover:text-text-dark">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-text-dark mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-text-muted hover:text-text-dark">Privacy</a></li>
                <li><a href="#" className="text-text-muted hover:text-text-dark">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-text-muted">
            <p>&copy; {new Date().getFullYear()} FinPilot AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Feature Modal */}
      <FeatureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feature={selectedFeature}
      />
    </div>
  );
}
