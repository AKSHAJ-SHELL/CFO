import { render, screen } from '@testing-library/react';
import SaaSNavbar from '@/components/saas/Navbar';

describe('SaaSNavbar', () => {
  it('renders navigation links', () => {
    render(<SaaSNavbar />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });

  it('has accessible navigation', () => {
    render(<SaaSNavbar />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });
});

