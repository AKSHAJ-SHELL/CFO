'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    quote: 'FinPilot transformed how we manage our finances. The AI insights helped us identify cost savings we never knew existed.',
    author: 'Sarah Chen',
    role: 'CFO, TechStart Inc',
    company: 'TechStart Inc',
  },
  {
    id: 2,
    quote: 'The scenario planning feature is a game-changer. We can now model different business strategies before making major decisions.',
    author: 'Michael Rodriguez',
    role: 'Founder, GrowthCo',
    company: 'GrowthCo',
  },
  {
    id: 3,
    quote: 'Automated bill pay saved us hours every week. The OCR works flawlessly and the approval workflows are intuitive.',
    author: 'Emily Thompson',
    role: 'Operations Manager, ScaleUp',
    company: 'ScaleUp',
  },
  {
    id: 4,
    quote: 'The financial health score gives us a clear view of where we stand. The recommendations are spot-on and actionable.',
    author: 'David Kim',
    role: 'CEO, InnovateLabs',
    company: 'InnovateLabs',
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section
      id="testimonials"
      ref={ref}
      className="min-h-screen py-24 px-8 section-snap flex items-center"
    >
      <div className="max-w-4xl mx-auto w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold uppercase text-white tracking-wider mb-4">
            Testimonials
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            What our users say about FinPilot
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 md:p-12">
            {/* Quote Icon */}
            <div className="flex items-start gap-4 mb-6">
              <Quote className="h-8 w-8 text-blue-400 flex-shrink-0 mt-1" />
              <p className="text-xl md:text-2xl text-gray-200 leading-relaxed italic">
                {currentTestimonial.quote}
              </p>
            </div>

            {/* Author */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {currentTestimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-white font-semibold">
                    {currentTestimonial.author}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {currentTestimonial.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-blue-500'
                  : 'w-2 bg-gray-700 hover:bg-gray-600'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

