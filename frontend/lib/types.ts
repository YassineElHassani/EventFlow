/* ── Shared TypeScript types matching the backend API ── */

export enum UserRole {
  ADMIN = 'admin',
  PARTICIPANT = 'participant',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELED = 'CANCELED',
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REFUSED = 'REFUSED',
  CANCELED = 'CANCELED',
}

/* ── Entities ── */

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  imageUrl?: string;
  title: string;
  description: string;
  date: string;
  location: string;
  totalCapacity: number;
  status: EventStatus;
  reservedSeats: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  _id: string;
  userId: string | User;
  eventId: string | Event;
  status: ReservationStatus;
  ticketPdfPath?: string;
  createdAt: string;
  updatedAt: string;
}

/* ── API response wrapper ── */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

/* ── Auth payloads ── */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthData {
  access_token: string;
  user: {
    id: string;
    fullName?: string;
    email: string;
    role: UserRole;
  };
}

/* ── Event payloads ── */

export interface CreateEventPayload {
  imageUrl?: string;
  title: string;
  description: string;
  date: string;
  location: string;
  totalCapacity: number;
  status?: EventStatus;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

/* ── Reservation payloads ── */

export interface CreateReservationPayload {
  eventId: string;
}

export interface UpdateReservationStatusPayload {
  status: ReservationStatus;
}

/* ── User payloads ── */

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;
