'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface TimelineItemProps {
  year: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  isLast?: boolean;
}

export default function TimelineItem({
  year,
  title,
  description,
  icon: Icon,
  isLast = false,
}: TimelineItemProps) {
  return (
    <div className="relative flex gap-8 pb-12">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-800" />
      )}

      {/* Year Badge */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-gray-900">
          {Icon ? (
            <Icon className="h-6 w-6 text-white" />
          ) : (
            <span className="text-white font-bold text-xs">{year.slice(-2)}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex-1 pt-1"
      >
        <div className="text-blue-400 font-mono text-sm uppercase tracking-wider mb-1">
          {year}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </motion.div>
    </div>
  );
}

