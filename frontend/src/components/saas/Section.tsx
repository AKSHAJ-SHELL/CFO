'use client';

import { motion } from 'framer-motion';
import { ReactNode, useEffect, useRef, useState } from 'react';

interface SectionProps {
  id: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  enableAnimation?: boolean;
}

/**
 * Reusable Section wrapper component with animations and accessibility
 */
export default function Section({
  id,
  title,
  subtitle,
  children,
  className = '',
  enableAnimation = true,
}: SectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const animationProps = enableAnimation
    ? {
        initial: { opacity: 0, y: 30 },
        animate: isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
        transition: { duration: 0.6, ease: 'easeOut' },
      }
    : {};

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`section-wrapper scroll-offset ${className}`}
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <motion.div
            className="text-center mb-12 md:mb-16"
            {...animationProps}
          >
            {title && (
              <h2
                id={`${id}-title`}
                className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-text-dark mb-4"
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl text-text-muted max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}
        <motion.div {...animationProps}>{children}</motion.div>
      </div>
    </section>
  );
}

