'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllEvents } from '@/store/slices/eventsSlice';
import { fetchUsers } from '@/store/slices/usersSlice';
import { CalendarDays, Ticket, Users, TrendingUp } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const { items: events, loading: eventsLoading } = useAppSelector((s) => s.events);
  const { items: users, loading: usersLoading } = useAppSelector((s) => s.users);

  useEffect(() => {
    dispatch(fetchAllEvents());
    dispatch(fetchUsers());
  }, [dispatch]);

  const totalEvents = events.length;
  const totalTickets = events.reduce((sum, e) => sum + e.reservedSeats, 0);
  const totalCapacity = events.reduce((sum, e) => sum + e.totalCapacity, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalTickets / totalCapacity) * 100) : 0;

  const stats = [
    {
      label: 'Total Events',
      value: totalEvents,
      icon: CalendarDays,
      color: 'bg-primary-50 text-primary',
      iconColor: 'text-primary',
    },
    {
      label: 'Tickets Sold',
      value: totalTickets,
      icon: Ticket,
      color: 'bg-accent-green-light text-accent-green-dark',
      iconColor: 'text-accent-green',
    },
    {
      label: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'bg-blue-50 text-blue-700',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      icon: TrendingUp,
      color: 'bg-accent-yellow-light text-amber-700',
      iconColor: 'text-amber-600',
    },
  ];

  if (eventsLoading || usersLoading) return <Spinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-text-muted mt-1">Overview of your event management platform</p>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-text">{s.value}</p>
              </div>
              <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent events + Users quick view */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="rounded-xl bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Recent Events</h2>
            <Link href="/admin/events" className="text-sm text-primary hover:text-primary-dark font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {events.slice(0, 5).map((event) => (
              <div key={event._id} className="flex items-center gap-3 rounded-lg bg-bg p-3">
                <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{event.title}</p>
                  <p className="text-xs text-text-muted">{formatDate(event.date)}</p>
                </div>
                <StatusBadge status={event.status} />
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">No events yet</p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-xl bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Recent Users</h2>
            <Link href="/admin/users" className="text-sm text-primary hover:text-primary-dark font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {users.slice(0, 5).map((u) => (
              <div key={u._id} className="flex items-center gap-3 rounded-lg bg-bg p-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium shrink-0">
                  {u.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{u.fullName}</p>
                  <p className="text-xs text-text-muted">{u.email}</p>
                </div>
                <span className="text-xs font-medium capitalize text-text-muted bg-gray-100 px-2 py-1 rounded-full">
                  {u.role}
                </span>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">No users yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
