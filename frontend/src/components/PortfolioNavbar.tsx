'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { id: 'home', label: 'home', href: '#home' },
  { id: 'expertise', label: 'expertise', href: '#expertise' },
  { id: 'work', label: 'work', href: '#work' },
  { id: 'experience', label: 'experience', href: '#experience' },
  { id: 'testimonials', label: 'testimonials', href: '#testimonials' },
  { id: 'contact', label: 'contact', href: '#contact' },
];

export default function PortfolioNavbar() {
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Determine active section based on scroll position
      const sections = navItems.map((item) => ({
        id: item.id,
        element: document.getElementById(item.id),
      }));

      const currentSection = sections
        .reverse()
        .find(({ element }) => {
          if (!element) return false;
          const rect = element.getBoundingClientRect();
          return rect.top <= 100;
        });

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0b0f19]/95 backdrop-blur-md border-b border-gray-800/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-24">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#home');
            }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              FinPilot
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                  className={`font-mono text-sm uppercase tracking-wider transition-colors duration-300 ${
                    isActive
                      ? 'text-blue-400'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className="text-gray-500">//</span> {item.label}
                </a>
              );
            })}
          </div>

          {/* Mobile Menu Button - will be simple dropdown later */}
          <div className="md:hidden">
            <span className="text-gray-400 font-mono text-xs">// menu</span>
          </div>
        </div>
      </div>

      {/* Active Section Indicator */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ width: 0 }}
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
            style={{
              width: `${((navItems.findIndex((item) => item.id === activeSection) + 1) / navItems.length) * 100}%`,
            }}
          />
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

