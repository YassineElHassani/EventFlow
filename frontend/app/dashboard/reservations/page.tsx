'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyReservations, cancelReservation } from '@/store/slices/reservationsSlice';
import { ReservationStatus, type Event as IEvent } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import Spinner from '@/components/ui/Spinner';
import { Ticket, XCircle, CalendarDays } from 'lucide-react';
import Link from 'next/link';

export default function MyReservationsPage() {
  const dispatch = useAppDispatch();
  const { items: reservations, loading } = useAppSelector((s) => s.reservations);
  const [cancelId, setCancelId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMyReservations());
  }, [dispatch]);

  const handleCancel = async () => {
    if (!cancelId) return;
    await dispatch(cancelReservation(cancelId));
    setCancelId(null);
  };

  if (loading && reservations.length === 0) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">My Bookings</h1>
        <p className="text-text-muted mt-1">View and manage all your reservations</p>
      </div>

      {reservations.length === 0 ? (
        <div className="rounded-xl bg-white p-12 shadow-soft text-center">
          <Ticket className="h-16 w-16 text-border mx-auto mb-4" />
          <p className="text-lg text-text-muted">No bookings yet</p>
          <p className="text-sm text-text-muted mt-1 mb-4">Browse events and make your first reservation!</p>
          <Link href="/#events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservations.map((r) => {
            const event = typeof r.eventId === 'object' ? (r.eventId as IEvent) : null;
            const canCancel = r.status === ReservationStatus.PENDING || r.status === ReservationStatus.CONFIRMED;
            const isConfirmed = r.status === ReservationStatus.CONFIRMED;

            return (
              <div key={r._id} className="rounded-xl bg-white p-5 shadow-soft">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Event info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <CalendarDays className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-text truncate">
                        {event ? event.title : 'Event'}
                      </p>
                      <p className="text-sm text-text-muted">
                        {event ? `${formatDate(event.date)} · ${event.location}` : formatDate(r.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Status + actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={r.status} />
                    {isConfirmed && (
                      <Link href={`/dashboard/reservations/${r._id}/ticket`}>
                        <Button size="sm" variant="outline">
                          <Ticket className="h-3.5 w-3.5 mr-1" />
                          View Ticket
                        </Button>
                      </Link>
                    )}
                    {canCancel && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-accent-red hover:bg-accent-red-light"
                        onClick={() => setCancelId(r._id)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel confirm */}
      <Modal open={!!cancelId} onClose={() => setCancelId(null)} title="Cancel Reservation">
        <p className="text-sm text-text-muted mb-6">
          Are you sure you want to cancel this reservation? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCancelId(null)} className="flex-1">
            Keep Booking
          </Button>
          <Button variant="danger" onClick={handleCancel} className="flex-1">
            Cancel Reservation
          </Button>
        </div>
      </Modal>
    </div>
  );
}
