'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import type { Testimonial } from '@/lib/types';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

/**
 * TestimonialCard component for displaying customer testimonials
 */
export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="card-base"
    >
      <Quote className="h-8 w-8 text-primary-blue/30 mb-4" />
      <blockquote className="text-text-dark italic mb-6 text-lg">
        &quot;{testimonial.quote}&quot;
      </blockquote>
      <div className="flex items-center">
        <div>
          <p className="font-semibold text-text-dark">{testimonial.author}</p>
          <p className="text-sm text-text-muted">
            {testimonial.role} at {testimonial.company}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

