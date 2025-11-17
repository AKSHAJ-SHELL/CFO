import { render, screen } from '@testing-library/react';
import FeatureCard from '@/components/saas/FeatureCard';
import { getFeatures } from '@/lib/mockApi';

describe('FeatureCard', () => {
  const feature = getFeatures()[0];

  it('renders feature information', () => {
    render(<FeatureCard feature={feature} />);
    expect(screen.getByText(feature.title)).toBeInTheDocument();
    expect(screen.getByText(feature.short)).toBeInTheDocument();
  });

  it('is accessible', () => {
    render(<FeatureCard feature={feature} />);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', `View ${feature.title}`);
  });
});

