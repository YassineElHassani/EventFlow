import { render, screen } from '@testing-library/react';
import StatusBadge from '@/components/ui/StatusBadge';

describe('StatusBadge', () => {
  it('renders the status text', () => {
    render(<StatusBadge status="CONFIRMED" />);
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
  });

  it('applies green styles for CONFIRMED status', () => {
    render(<StatusBadge status="CONFIRMED" />);
    const el = screen.getByText('CONFIRMED');
    expect(el.className).toContain('bg-accent-green-light');
  });

  it('applies red styles for CANCELED status', () => {
    render(<StatusBadge status="CANCELED" />);
    const el = screen.getByText('CANCELED');
    expect(el.className).toContain('bg-accent-red-light');
  });

  it('applies yellow styles for PENDING status', () => {
    render(<StatusBadge status="PENDING" />);
    const el = screen.getByText('PENDING');
    expect(el.className).toContain('bg-accent-yellow-light');
  });
});
