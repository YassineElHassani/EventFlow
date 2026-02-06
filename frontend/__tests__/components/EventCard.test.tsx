import { render, screen } from '@testing-library/react';
import EventCard from '@/components/EventCard';
import { EventStatus, type Event } from '@/lib/types';

/* Mock next/link */
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

/* Mock next/image */
jest.mock('next/image', () => {
  const MockImage = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ''} />
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const baseEvent: Event = {
  _id: 'evt1',
  title: 'Test Event',
  description: 'A wonderful event description here.',
  date: '2026-03-15T18:00:00Z',
  location: 'Casablanca, Morocco',
  totalCapacity: 100,
  reservedSeats: 30,
  status: EventStatus.PUBLISHED,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('EventCard', () => {
  it('renders event title and location', () => {
    render(<EventCard event={baseEvent} />);
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Casablanca, Morocco')).toBeInTheDocument();
  });

  it('shows seats remaining', () => {
    render(<EventCard event={baseEvent} />);
    expect(screen.getByText('70 seats left')).toBeInTheDocument();
  });

  it('shows "Sold Out" when no seats left', () => {
    const fullEvent = { ...baseEvent, reservedSeats: 100 };
    render(<EventCard event={fullEvent} />);
    expect(screen.getByText('Sold Out')).toBeInTheDocument();
    expect(screen.getByText('No seats left')).toBeInTheDocument();
  });

  it('links to correct event detail page', () => {
    render(<EventCard event={baseEvent} />);
    const link = screen.getByRole('link', { name: /book seat/i });
    expect(link).toHaveAttribute('href', '/events/evt1');
  });

  it('renders the date badge', () => {
    render(<EventCard event={baseEvent} />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('MAR')).toBeInTheDocument();
  });
});
