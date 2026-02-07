'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllEvents, createEvent, updateEvent, deleteEvent } from '@/store/slices/eventsSlice';
import { useForm } from 'react-hook-form';
import type { CreateEventPayload, Event } from '@/lib/types';
import { EventStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import Spinner from '@/components/ui/Spinner';
import { Plus, Pencil, Trash2, CalendarDays, AlertCircle } from 'lucide-react';

export default function AdminEventsPage() {
  const dispatch = useAppDispatch();
  const { items: events, loading } = useAppSelector((s) => s.events);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateEventPayload>();

  useEffect(() => {
    dispatch(fetchAllEvents());
  }, [dispatch]);

  const openCreate = () => {
    setEditing(null);
    reset({ title: '', description: '', date: '', location: '', totalCapacity: 1, status: EventStatus.DRAFT, imageUrl: '' });
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (ev: Event) => {
    setEditing(ev);
    reset({
      title: ev.title,
      description: ev.description,
      date: ev.date.slice(0, 16),
      location: ev.location,
      totalCapacity: ev.totalCapacity,
      status: ev.status,
      imageUrl: ev.imageUrl || '',
    });
    setSubmitError(null);
    setModalOpen(true);
  };

  const onSubmit = async (data: CreateEventPayload) => {
    setSubmitError(null);
    try {
      if (editing) {
        await dispatch(updateEvent({ id: editing._id, ...data })).unwrap();
      } else {
        await dispatch(createEvent(data)).unwrap();
      }
      setModalOpen(false);
      dispatch(fetchAllEvents());
    } catch (err: unknown) {
      setSubmitError(typeof err === 'string' ? err : 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await dispatch(deleteEvent(deleteId));
    setDeleteId(null);
  };

  if (loading && events.length === 0) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Events</h1>
          <p className="text-text-muted mt-1">Manage all events on the platform</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Event
        </Button>
      </div>

      {/* Events table */}
      <div className="rounded-xl bg-white shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-bg">
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Event</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Location</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Seats</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((ev) => (
                <tr key={ev._id} className="hover:bg-bg/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <CalendarDays className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-text truncate max-w-[200px]">{ev.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-muted">{formatDate(ev.date)}</td>
                  <td className="px-5 py-4 text-sm text-text-muted">{ev.location}</td>
                  <td className="px-5 py-4 text-sm text-text-muted">
                    {ev.reservedSeats}/{ev.totalCapacity}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={ev.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(ev)}
                        className="rounded-lg p-2 text-text-muted hover:bg-gray-100 hover:text-primary transition-colors cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(ev._id)}
                        className="rounded-lg p-2 text-text-muted hover:bg-accent-red-light hover:text-accent-red transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-text-muted">
                    No events yet. Create your first event!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Event' : 'Create Event'}
        className="max-w-lg"
      >
        {submitError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-accent-red-light p-3 text-sm text-accent-red-dark">
            <AlertCircle className="h-4 w-4" />
            <span>{submitError}</span>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="title"
            label="Title"
            error={errors.title?.message}
            {...register('title', { required: 'Title is required' })}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text">Description</label>
            <textarea
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && <p className="text-xs text-accent-red">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="date"
              label="Date & Time"
              type="datetime-local"
              error={errors.date?.message}
              {...register('date', { required: 'Date is required' })}
            />
            <Input
              id="location"
              label="Location"
              error={errors.location?.message}
              {...register('location', { required: 'Location is required' })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="totalCapacity"
              label="Capacity"
              type="number"
              error={errors.totalCapacity?.message}
              {...register('totalCapacity', { required: 'Required', valueAsNumber: true, min: { value: 1, message: 'Min 1' } })}
            />
            <Select
              id="status"
              label="Status"
              options={[
                { value: EventStatus.DRAFT, label: 'Draft' },
                { value: EventStatus.PUBLISHED, label: 'Published' },
                { value: EventStatus.CANCELED, label: 'Canceled' },
              ]}
              {...register('status')}
            />
          </div>
          <Input
            id="imageUrl"
            label="Image URL (optional)"
            {...register('imageUrl')}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editing ? 'Save Changes' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Event">
        <p className="text-sm text-text-muted mb-6">
          Are you sure you want to delete this event? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} className="flex-1">
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
