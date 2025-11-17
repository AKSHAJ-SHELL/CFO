'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Rocket, Sparkles, Zap, Target, Trophy } from 'lucide-react';
import TimelineItem from '@/components/TimelineItem';

const milestones = [
  {
    year: '2024 Q1',
    title: 'Foundation & Core Infrastructure',
    description: 'Built the foundational architecture with Django REST API, PostgreSQL database, and Next.js frontend. Implemented authentication and basic financial data models.',
    icon: Rocket,
  },
  {
    year: '2024 Q2',
    title: 'Invoice Management & Payment Processing',
    description: 'Launched Feature 1 with complete invoice lifecycle management, Stripe integration, automated reminders, and AR aging reports. Added payment prediction ML models.',
    icon: Sparkles,
  },
  {
    year: '2024 Q3',
    title: 'Financial Planning & Automation',
    description: 'Introduced Scenario Planning (Feature 3) and Bill Pay Automation (Feature 4). Built OCR capabilities, approval workflows, and financial simulation engine.',
    icon: Zap,
  },
  {
    year: '2024 Q4',
    title: 'Intelligence & Health Monitoring',
    description: 'Released Profitability Intelligence (Feature 5), Financial Health Score (Feature 6), and Smart Cash Reserves (Feature 7). Added AI-powered insights and benchmarking.',
    icon: Target,
  },
  {
    year: '2025 Q1',
    title: 'AI & Portfolio UI Launch',
    description: 'Complete dashboard overhaul with TamalSen.dev-inspired portfolio design. Launched AI CFO Chat, Model Playground, and comprehensive analytics. All 14 features now accessible.',
    icon: Trophy,
  },
];

export default function ExperienceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="experience"
      ref={ref}
      className="min-h-screen py-24 px-8 section-snap"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold uppercase text-white tracking-wider mb-4">
            Experience
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            FinPilot's journey from concept to comprehensive AI CFO platform
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {milestones.map((milestone, index) => (
            <TimelineItem
              key={milestone.year}
              year={milestone.year}
              title={milestone.title}
              description={milestone.description}
              icon={milestone.icon}
              isLast={index === milestones.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

