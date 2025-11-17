'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  gradient: string;
}

export default function MetricCard({ icon: Icon, title, description, href, gradient }: MetricCardProps) {
  return (
    <motion.a
      href={href}
      whileHover={{ y: -4 }}
      className="block bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 group cursor-pointer"
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex items-center text-indigo-600 font-medium group-hover:translate-x-1 transition-transform">
        <span className="text-sm">Explore</span>
        <ArrowRight className="h-4 w-4 ml-2" />
      </div>
    </motion.a>
  );
}

