'use client';

import { motion } from 'framer-motion';
import type { FeatureCategory } from '@/lib/types';

interface FilterBarProps {
  categories: FeatureCategory[];
  activeCategory: FeatureCategory | 'All';
  onCategoryChange: (category: FeatureCategory | 'All') => void;
}

/**
 * FilterBar component for filtering features by category
 */
export default function FilterBar({ categories, activeCategory, onCategoryChange }: FilterBarProps) {
  const allCategories: (FeatureCategory | 'All')[] = ['All', ...categories];

  return (
    <div className="flex flex-wrap gap-2 justify-center mb-8" role="tablist" aria-label="Filter features by category">
      {allCategories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary-blue text-white shadow-md'
                : 'bg-background-main text-text-dark hover:bg-gray-200'
            }`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`features-${category.toLowerCase()}`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

