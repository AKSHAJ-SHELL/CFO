import { render, screen } from '@testing-library/react';
import Section from '@/components/saas/Section';

describe('Section', () => {
  it('renders with title and subtitle', () => {
    render(
      <Section id="test" title="Test Title" subtitle="Test Subtitle">
        <p>Test content</p>
      </Section>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('has accessible structure', () => {
    render(
      <Section id="test" title="Test Title">
        <p>Content</p>
      </Section>
    );
    const section = screen.getByRole('region', { name: /test title/i });
    expect(section).toBeInTheDocument();
  });
});

