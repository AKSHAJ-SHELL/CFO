import { render, screen } from '@testing-library/react';
import PricingCard from '@/components/saas/PricingCard';
import { getPricing } from '@/lib/mockApi';

describe('PricingCard', () => {
  const plan = getPricing()[0];

  it('renders pricing information', () => {
    render(<PricingCard plan={plan} />);
    expect(screen.getByText(plan.name)).toBeInTheDocument();
    expect(screen.getByText(plan.description)).toBeInTheDocument();
  });

  it('displays features list', () => {
    render(<PricingCard plan={plan} />);
    plan.features.forEach((feature) => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });
  });
});

