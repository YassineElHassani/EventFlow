import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(dateStr: string) {
  return `${formatDate(dateStr)} at ${formatTime(dateStr)}`;
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'CONFIRMED':
    case 'PUBLISHED':
      return 'bg-accent-green-light text-accent-green-dark';
    case 'PENDING':
    case 'DRAFT':
      return 'bg-accent-yellow-light text-amber-700';
    case 'CANCELED':
    case 'REFUSED':
      return 'bg-accent-red-light text-accent-red-dark';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function seatsLeft(totalCapacity: number, reservedSeats: number) {
  return Math.max(0, totalCapacity - reservedSeats);
}

/** Extract a human-readable message from an unknown caught error (e.g. Axios). */
export function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const resp = (err as { response?: { data?: { message?: string } } }).response;
    if (resp?.data?.message) return resp.data.message;
  }
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}
