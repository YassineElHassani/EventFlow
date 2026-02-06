'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import type { Reservation, Event as IEvent, User, ApiResponse } from '@/lib/types';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { CalendarDays, MapPin, Clock, User as UserIcon, QrCode, ArrowLeft, Download, Zap } from 'lucide-react';
import Link from 'next/link';

export default function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReservation() {
      try {
        // Fetch my reservations and find the one matching
        const { data } = await api.get<ApiResponse<Reservation[]>>('/reservations/my');
        const found = data.data?.find((r) => r._id === id);
        if (found) {
          setReservation(found);
        } else {
          setError('Reservation not found');
        }
      } catch {
        setError('Failed to load reservation');
      } finally {
        setLoading(false);
      }
    }
    fetchReservation();
  }, [id]);

  const handleDownload = () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/reservations/${id}/ticket`;
    window.open(url, '_blank');
  };

  if (loading) return <Spinner />;
  if (error || !reservation) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">{error || 'Reservation not found'}</p>
        <Link href="/dashboard/reservations" className="text-primary text-sm font-medium mt-2 inline-block">
          Back to bookings
        </Link>
      </div>
    );
  }

  const event = typeof reservation.eventId === 'object' ? (reservation.eventId as IEvent) : null;
  const user = typeof reservation.userId === 'object' ? (reservation.userId as User) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 text-text-muted hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-text">Your Ticket</h1>
      </div>

      {/* Boarding Pass Style Ticket */}
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl bg-white shadow-soft-lg overflow-hidden">
          {/* Top: Event header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-medium opacity-80">EventFlow Ticket</span>
            </div>
            <h2 className="text-2xl font-bold">{event?.title || 'Event'}</h2>
            <p className="text-sm opacity-80 mt-1">Reservation #{reservation._id.slice(-8).toUpperCase()}</p>
          </div>

          {/* Middle: Details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Date</span>
                </div>
                <p className="text-sm font-semibold text-text">
                  {event ? formatDate(event.date) : '—'}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Time</span>
                </div>
                <p className="text-sm font-semibold text-text">
                  {event ? formatTime(event.date) : '—'}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Location</span>
                </div>
                <p className="text-sm font-semibold text-text">
                  {event?.location || '—'}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <UserIcon className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Attendee</span>
                </div>
                <p className="text-sm font-semibold text-text">
                  {user?.fullName || '—'}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between rounded-lg bg-accent-green-light px-4 py-3">
              <span className="text-sm font-medium text-accent-green-dark">Status</span>
              <span className="text-sm font-bold text-accent-green-dark uppercase">{reservation.status}</span>
            </div>
          </div>

          {/* Perforated line */}
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-bg" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-8 w-8 rounded-full bg-bg" />
            <div className="border-t-2 border-dashed border-border mx-8" />
          </div>

          {/* Bottom: QR Code placeholder */}
          <div className="p-6 flex flex-col items-center gap-4">
            <div className="h-32 w-32 rounded-xl bg-bg flex items-center justify-center border-2 border-dashed border-border">
              <QrCode className="h-16 w-16 text-text-muted" />
            </div>
            <p className="text-xs text-text-muted">Scan this code at the venue entrance</p>

            <Button onClick={handleDownload} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download PDF Ticket
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
