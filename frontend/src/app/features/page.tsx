'use client';

import { useState, useMemo } from 'react';
import SaaSNavbar from '@/components/saas/Navbar';
import Section from '@/components/saas/Section';
import FeatureCard from '@/components/saas/FeatureCard';
import FeatureModal from '@/components/saas/FeatureModal';
import FilterBar from '@/components/saas/FilterBar';
import { getFeatures } from '@/lib/mockApi';
import type { Feature, FeatureCategory } from '@/lib/types';

/**
 * Features page with filterable grid
 */
export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState<FeatureCategory | 'All'>('All');
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allFeatures = getFeatures();
  const categories = Array.from(new Set(allFeatures.map(f => f.category))) as FeatureCategory[];

  const filteredFeatures = useMemo(() => {
    if (activeCategory === 'All') return allFeatures;
    return allFeatures.filter(f => f.category === activeCategory);
  }, [activeCategory, allFeatures]);

  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background-main">
      <SaaSNavbar />
      
      <Section id="features-hero" title="All Features" subtitle="Discover everything FinPilot can do for your business">
        <FilterBar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onClick={() => handleFeatureClick(feature)}
            />
          ))}
        </div>
      </Section>

      <FeatureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feature={selectedFeature}
      />
    </div>
  );
}

