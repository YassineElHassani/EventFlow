import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EventCard from '@/components/EventCard';
import { CalendarDays, Users, Shield, ArrowRight } from 'lucide-react';
import type { Event, ApiResponse } from '@/lib/types';

async function getPublicEvents(): Promise<Event[]> {
  try {
    const baseUrl = process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/events`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json: ApiResponse<Event[]> = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const events = await getPublicEvents();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/60 via-white to-primary-100/40" />
        <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-60 w-60 rounded-full bg-primary-light/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-text leading-tight">
                Manage Events{' '}
                <span className="text-primary">with Flow</span>
              </h1>
              <p className="text-lg text-text-muted max-w-lg leading-relaxed">
                Discover amazing events, book your seats instantly, and manage everything from one beautiful dashboard. Built for organizers and attendees alike.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/#events"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-white shadow-soft hover:bg-primary-dark transition-all"
                >
                  Book Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-base font-medium text-text hover:bg-gray-50 transition-all"
                >
                  Create Account
                </Link>
              </div>
            </div>

            {/* Right — floating card */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-4 -right-4 h-full w-full rounded-2xl bg-primary/5 rotate-3" />
              <div className="relative glass-card rounded-2xl p-8 shadow-soft-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-text">Upcoming Events</p>
                      <p className="text-sm text-text-muted">{events.length} events available</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-primary-50 p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{events.length}</p>
                      <p className="text-xs text-text-muted">Events</p>
                    </div>
                    <div className="rounded-lg bg-accent-green-light p-3 text-center">
                      <p className="text-2xl font-bold text-accent-green-dark">
                        {events.reduce((sum, e) => sum + e.reservedSeats, 0)}
                      </p>
                      <p className="text-xs text-text-muted">Booked</p>
                    </div>
                    <div className="rounded-lg bg-accent-yellow-light p-3 text-center">
                      <p className="text-2xl font-bold text-amber-700">
                        {events.reduce((sum, e) => sum + (e.totalCapacity - e.reservedSeats), 0)}
                      </p>
                      <p className="text-xs text-text-muted">Available</p>
                    </div>
                  </div>
                  {/* Mini event list */}
                  <div className="space-y-2">
                    {events.slice(0, 3).map((ev) => (
                      <div key={ev._id} className="flex items-center gap-3 rounded-lg bg-bg p-2.5">
                        <div className="h-8 w-8 rounded bg-primary-50 flex items-center justify-center text-xs font-bold text-primary">
                          {new Date(ev.date).getDate()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text truncate">{ev.title}</p>
                          <p className="text-xs text-text-muted">{ev.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-bg py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-text">Why EventFlow?</h2>
            <p className="mt-3 text-text-muted max-w-xl mx-auto">
              Everything you need to discover, book, and manage events in one intuitive platform.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: CalendarDays,
                title: 'Easy Discovery',
                desc: 'Browse a curated catalog of events. Filter by date, location, and availability.',
              },
              {
                icon: Users,
                title: 'Instant Booking',
                desc: 'Reserve your seat in seconds. Get a digital ticket delivered to your dashboard.',
              },
              {
                icon: Shield,
                title: 'Secure & Reliable',
                desc: 'Your bookings and personal information are protected. Only authorized users can access sensitive features.',
              },
            ].map((f) => (
              <div key={f.title} className="rounded-xl bg-white p-6 shadow-soft hover:shadow-soft-lg transition-all">
                <div className="h-12 w-12 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text">{f.title}</h3>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Catalog */}
      <section id="events" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-text">Upcoming Events</h2>
              <p className="mt-2 text-text-muted">Discover and book your next experience</p>
            </div>
            {events.length > 6 && (
              <Link
                href="/events"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                View All Events
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          {events.length === 0 ? (
            <div className="text-center py-20">
              <CalendarDays className="h-16 w-16 text-border mx-auto mb-4" />
              <p className="text-lg text-text-muted">No events available right now.</p>
              <p className="text-sm text-text-muted mt-1">Check back soon for upcoming events!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.slice(0, 6).map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
