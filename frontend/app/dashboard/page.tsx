'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyReservations } from '@/store/slices/reservationsSlice';
import { ReservationStatus, type Event as IEvent, type Reservation } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import StatusBadge from '@/components/ui/StatusBadge';
import { CalendarDays, Ticket, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ParticipantDashboardPage() {
  const dispatch = useAppDispatch();
  const { items: reservations, loading } = useAppSelector((s) => s.reservations) as { items: Reservation[]; loading: boolean };
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchMyReservations());
  }, [dispatch]);

  const confirmed = reservations.filter((r: Reservation) => r.status === ReservationStatus.CONFIRMED).length;
  const pending = reservations.filter((r: Reservation) => r.status === ReservationStatus.PENDING).length;
  const total = reservations.length;

  const stats = [
    { label: 'Total Bookings', value: total, icon: Ticket, color: 'bg-primary-50 text-primary' },
    { label: 'Confirmed', value: confirmed, icon: CheckCircle, color: 'bg-accent-green-light text-accent-green-dark' },
    { label: 'Pending', value: pending, icon: Clock, color: 'bg-accent-yellow-light text-amber-700' },
  ];

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">
          Welcome back{user?.fullName ? `, ${user.fullName}` : ''}!
        </h1>
        <p className="text-text-muted mt-1">Here&apos;s an overview of your bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-text">{s.value}</p>
              </div>
              <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="rounded-xl bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">Recent Bookings</h2>
          <Link href="/dashboard/reservations" className="text-sm text-primary hover:text-primary-dark font-medium">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {reservations.slice(0, 5).map((r: Reservation) => {
            const event = typeof r.eventId === 'object' ? (r.eventId as IEvent) : null;
            return (
              <div key={r._id} className="flex items-center gap-3 rounded-lg bg-bg p-3">
                <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {event ? event.title : 'Event'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {event ? formatDate(event.date) : formatDate(r.createdAt)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            );
          })}
          {reservations.length === 0 && (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 text-border mx-auto mb-2" />
              <p className="text-text-muted">No bookings yet.</p>
              <Link href="/#events" className="text-sm text-primary hover:text-primary-dark font-medium">
                Browse events
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
