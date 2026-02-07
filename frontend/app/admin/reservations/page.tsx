'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllEvents } from '@/store/slices/eventsSlice';
import { fetchEventReservations, updateReservationStatus } from '@/store/slices/reservationsSlice';
import { ReservationStatus, type Reservation, type User } from '@/lib/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Spinner from '@/components/ui/Spinner';
import { Ticket, Filter } from 'lucide-react';

export default function AdminReservationsPage() {
  const dispatch = useAppDispatch();
  const { items: events } = useAppSelector((s) => s.events);
  const { items: reservations, loading } = useAppSelector((s) => s.reservations);
  const [selectedEvent, setSelectedEvent] = useState<string>('');

  useEffect(() => {
    dispatch(fetchAllEvents());
  }, [dispatch]);

  useEffect(() => {
    if (selectedEvent) {
      dispatch(fetchEventReservations(selectedEvent));
    }
  }, [selectedEvent, dispatch]);

  const handleStatusChange = async (id: string, status: ReservationStatus) => {
    await dispatch(updateReservationStatus({ id, status }));
  };

  const getUserName = (r: Reservation) => {
    if (typeof r.userId === 'object' && r.userId !== null) {
      return (r.userId as User).fullName || (r.userId as User).email;
    }
    return String(r.userId);
  };

  const getUserEmail = (r: Reservation) => {
    if (typeof r.userId === 'object' && r.userId !== null) {
      return (r.userId as User).email;
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Reservations</h1>
        <p className="text-text-muted mt-1">Manage reservations for all events</p>
      </div>

      {/* Event filter */}
      <div className="rounded-xl bg-white p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-text-muted" />
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select an event to view reservations</option>
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title} — {formatDate(ev.date)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reservations table */}
      {selectedEvent ? (
        loading ? (
          <Spinner />
        ) : (
          <div className="rounded-xl bg-white shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-bg">
                    <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Participant</th>
                    <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>
                    <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Booked At</th>
                    <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reservations.map((r: Reservation) => (
                    <tr key={r._id} className="hover:bg-bg/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium">
                            {getUserName(r).charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-text">{getUserName(r)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-text-muted">{getUserEmail(r)}</td>
                      <td className="px-5 py-4 text-sm text-text-muted">{formatDateTime(r.createdAt)}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {r.status === ReservationStatus.PENDING && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-accent-green hover:bg-accent-green-light"
                                onClick={() => handleStatusChange(r._id, ReservationStatus.CONFIRMED)}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-accent-red hover:bg-accent-red-light"
                                onClick={() => handleStatusChange(r._id, ReservationStatus.REFUSED)}
                              >
                                Refuse
                              </Button>
                            </>
                          )}
                          {r.status === ReservationStatus.CONFIRMED && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-accent-red hover:bg-accent-red-light"
                              onClick={() => handleStatusChange(r._id, ReservationStatus.CANCELED)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reservations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-text-muted">
                        <Ticket className="h-12 w-12 text-border mx-auto mb-2" />
                        No reservations for this event
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="rounded-xl bg-white p-12 shadow-soft text-center">
          <Ticket className="h-16 w-16 text-border mx-auto mb-4" />
          <p className="text-text-muted">Select an event above to view its reservations</p>
        </div>
      )}
    </div>
  );
}
