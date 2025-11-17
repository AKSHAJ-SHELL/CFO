'use client';

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';

// Dynamically import FinanceSimulationScene to avoid SSR issues
const FinanceSimulationScene = dynamic(
  () => import('@/components/FinanceSimulationScene'),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-900/50" />
  }
);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToNext = () => {
    const nextSection = document.getElementById('expertise');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center section-snap overflow-hidden"
    >
      {/* Background 3D Scene */}
      {mounted && (
        <div className="absolute inset-0 z-0 opacity-30">
          <FinanceSimulationScene />
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f19]/80 via-[#0d1321]/60 to-[#0f1625]/80 z-10" />

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-8"
        >
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold uppercase text-white tracking-wider"
          >
            <span className="block">FinPilot</span>
            <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              AI
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-3xl mx-auto font-light"
          >
            Intelligent financial management for modern businesses.
            <br />
            <span className="text-gray-400">Automate workflows, predict outcomes, optimize profitability.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <a
              href="#expertise"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Explore Features
            </a>
            <a
              href="#work"
              className="px-8 py-4 border-2 border-gray-600 rounded-lg text-gray-300 font-semibold hover:border-gray-400 hover:text-white transition-all duration-300"
            >
              View Portfolio
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        onClick={scrollToNext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors"
        aria-label="Scroll to next section"
      >
        <span className="text-sm uppercase tracking-wider font-mono">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown className="h-6 w-6" />
        </motion.div>
      </motion.button>
    </section>
  );
}

