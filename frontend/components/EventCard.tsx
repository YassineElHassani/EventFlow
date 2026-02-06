import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, MapPin } from 'lucide-react';
import { seatsLeft } from '@/lib/utils';
import type { Event } from '@/lib/types';
import Button from '@/components/ui/Button';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const remaining = seatsLeft(event.totalCapacity, event.reservedSeats);
  const isFull = remaining === 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-soft hover:shadow-soft-lg transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <CalendarDays className="h-16 w-16 text-primary/30" />
          </div>
        )}
        {/* Date badge */}
        <div className="absolute top-3 left-3 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow-sm">
          <p className="text-xs font-bold text-primary">
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
          </p>
          <p className="text-lg font-bold text-text leading-none">
            {new Date(event.date).getDate()}
          </p>
        </div>
        {/* Seats badge */}
        {isFull && (
          <div className="absolute top-3 right-3 rounded-full bg-accent-red px-3 py-1 text-xs font-medium text-white">
            Sold Out
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors line-clamp-1">
          {event.title}
        </h3>
        <p className="mt-1 text-sm text-text-muted line-clamp-2">{event.description}</p>

        <div className="mt-3 flex items-center gap-1.5 text-sm text-text-muted">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className={`text-sm font-medium ${isFull ? 'text-accent-red' : 'text-accent-green'}`}>
            {isFull ? 'No seats left' : `${remaining} seats left`}
          </span>
          <Link href={`/events/${event._id}`}>
            <Button size="sm" variant={isFull ? 'outline' : 'primary'}>
              {isFull ? 'View Details' : 'Book Seat'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
