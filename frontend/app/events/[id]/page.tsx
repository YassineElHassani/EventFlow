import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EventDetailClient from './EventDetailClient';
import Image from 'next/image';
import { CalendarDays, MapPin, Users, Clock } from 'lucide-react';
import { formatDate, formatTime, seatsLeft } from '@/lib/utils';
import type { Event, ApiResponse } from '@/lib/types';
import { notFound } from 'next/navigation';

async function getEvent(id: string): Promise<Event | null> {
  try {
    const baseUrl = process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(
      `${baseUrl}/events/${id}`,
      { next: { revalidate: 30 } },
    );
    if (!res.ok) return null;
    const json: ApiResponse<Event> = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const remaining = seatsLeft(event.totalCapacity, event.reservedSeats);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary-50 to-primary-100">
          {event.imageUrl ? (
            <Image src={event.imageUrl} alt={event.title} fill className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <CalendarDays className="h-24 w-24 text-primary/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-20">
          <div className="rounded-xl bg-white p-6 md:p-8 shadow-soft-lg">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Left: Details */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-text">{event.title}</h1>
                  <p className="mt-4 text-text-muted leading-relaxed">{event.description}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 rounded-lg bg-bg p-4">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-text">{formatDate(event.date)}</p>
                      <p className="text-xs text-text-muted">Date</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-bg p-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-text">{formatTime(event.date)}</p>
                      <p className="text-xs text-text-muted">Time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-bg p-4">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-text">{event.location}</p>
                      <p className="text-xs text-text-muted">Location</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-bg p-4">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-text">
                        {remaining} / {event.totalCapacity}
                      </p>
                      <p className="text-xs text-text-muted">Seats Available</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Booking card */}
              <div>
                <EventDetailClient event={event} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
