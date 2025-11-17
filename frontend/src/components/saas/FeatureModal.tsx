'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';
import type { Feature } from '@/lib/types';

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: Feature | null;
}

/**
 * FeatureModal component for displaying detailed feature information
 */
export default function FeatureModal({ isOpen, onClose, feature }: FeatureModalProps) {
  if (!feature) return null;

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-background-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="feature-modal-title"
            >
              {/* Header */}
              <div className="sticky top-0 bg-background-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 id="feature-modal-title" className="text-2xl font-bold text-text-dark">
                  {feature.title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-background-main rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {/* Long description */}
                <p className="text-lg text-text-muted mb-6">{feature.long}</p>

                {/* Highlights */}
                {feature.highlights && feature.highlights.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-text-dark mb-3">Key Features</h3>
                    <ul className="space-y-2">
                      {feature.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary-blue mr-2">•</span>
                          <span className="text-text-dark">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Category */}
                <div className="mb-6">
                  <span className="text-sm font-medium text-accent-violet bg-accent-violet/10 px-3 py-1 rounded-full">
                    {feature.category}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/dashboard/${feature.id}`}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-teal to-primary-blue text-white rounded-lg font-medium hover:from-primary-teal/90 hover:to-primary-blue/90 transition-all text-center"
                    onClick={onClose}
                  >
                    Try It Now
                  </Link>
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-text-dark rounded-lg font-medium hover:border-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

