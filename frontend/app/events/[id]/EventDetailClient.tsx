'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { createReservation } from '@/store/slices/reservationsSlice';
import { seatsLeft } from '@/lib/utils';
import type { Event } from '@/lib/types';
import Button from '@/components/ui/Button';
import { Ticket, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  event: Event;
}

export default function EventDetailClient({ event }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = seatsLeft(event.totalCapacity, event.reservedSeats);
  const isFull = remaining === 0;

  const handleBook = async () => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await dispatch(createReservation({ eventId: event._id })).unwrap();
      setSuccess(true);
    } catch (err: unknown) {
      setError(typeof err === 'string' ? err : 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border p-5 space-y-4">
      <h3 className="text-lg font-semibold text-text">Book Your Seat</h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Availability</span>
          <span className={`font-medium ${isFull ? 'text-accent-red' : 'text-accent-green'}`}>
            {isFull ? 'Sold Out' : `${remaining} left`}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(event.reservedSeats / event.totalCapacity) * 100}%` }}
          />
        </div>
      </div>

      {success ? (
        <div className="flex items-center gap-2 rounded-lg bg-accent-green-light p-3 text-sm text-accent-green-dark">
          <CheckCircle2 className="h-5 w-5" />
          <span>Booked successfully! Check your dashboard.</span>
        </div>
      ) : (
        <>
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-accent-red-light p-3 text-sm text-accent-red-dark">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          <Button
            className="w-full"
            size="lg"
            disabled={isFull}
            loading={loading}
            onClick={handleBook}
          >
            <Ticket className="h-4 w-4 mr-2" />
            {!token ? 'Sign in to Book' : isFull ? 'Sold Out' : 'Reserve Now'}
          </Button>
        </>
      )}

      {!token && (
        <p className="text-xs text-text-muted text-center">
          You need an account to make a reservation.
        </p>
      )}
    </div>
  );
}
