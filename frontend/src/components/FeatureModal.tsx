'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    href: string;
    gradient: string;
    category: string;
    details?: string;
    capabilities?: string[];
  };
}

export default function FeatureModal({ isOpen, onClose, feature }: FeatureModalProps) {
  const Icon = feature.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{feature.name}</h3>
                    <p className="text-sm text-gray-400 capitalize">{feature.category}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                <p className="text-gray-300 leading-relaxed">
                  {feature.details || feature.description}
                </p>

                {feature.capabilities && feature.capabilities.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Key Capabilities</h4>
                    <ul className="space-y-2">
                      {feature.capabilities.map((capability, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{capability}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA */}
                <div className="pt-4 border-t border-gray-800">
                  <Link
                    href={feature.href}
                    onClick={onClose}
                    className={`inline-block px-6 py-3 bg-gradient-to-r ${feature.gradient} rounded-lg text-white font-semibold hover:opacity-90 transition-opacity`}
                  >
                    Explore Feature →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

