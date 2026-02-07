'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUsers, createUser, updateUser, deleteUser } from '@/store/slices/usersSlice';
import { useForm } from 'react-hook-form';
import type { CreateUserPayload, UpdateUserPayload, User } from '@/lib/types';
import { UserRole } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const { items: users, loading } = useAppSelector((state) => (state.users as { items: User[]; loading: boolean }));
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserPayload>();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const openCreate = () => {
    setEditing(null);
    reset({ fullName: '', email: '', password: '', role: UserRole.PARTICIPANT });
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    reset({ fullName: u.fullName, email: u.email, password: '', role: u.role });
    setSubmitError(null);
    setModalOpen(true);
  };

  const onSubmit = async (data: CreateUserPayload) => {
    setSubmitError(null);
    try {
      if (editing) {
        const payload: UpdateUserPayload & { id: string } = { id: editing._id, fullName: data.fullName, email: data.email, role: data.role };
        if (data.password) payload.password = data.password;
        await dispatch(updateUser(payload)).unwrap();
      } else {
        await dispatch(createUser(data)).unwrap();
      }
      setModalOpen(false);
      dispatch(fetchUsers());
    } catch (err: unknown) {
      setSubmitError(typeof err === 'string' ? err : 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await dispatch(deleteUser(deleteId));
    setDeleteId(null);
  };

  if (loading && users.length === 0) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Users</h1>
          <p className="text-text-muted mt-1">Manage platform users</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          New User
        </Button>
      </div>

      {/* Users table */}
      <div className="rounded-xl bg-white shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-bg">
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u: User) => (
                <tr key={u._id} className="hover:bg-bg/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium shrink-0">
                        {u.fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium text-text">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-muted">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      u.role === UserRole.ADMIN
                        ? 'bg-primary-50 text-primary'
                        : 'bg-gray-100 text-text-muted'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-muted">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        className="rounded-lg p-2 text-text-muted hover:bg-gray-100 hover:text-primary transition-colors cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(u._id)}
                        className="rounded-lg p-2 text-text-muted hover:bg-accent-red-light hover:text-accent-red transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-text-muted">
                    No users found
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
        title={editing ? 'Edit User' : 'Create User'}
      >
        {submitError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-accent-red-light p-3 text-sm text-accent-red-dark">
            <AlertCircle className="h-4 w-4" />
            <span>{submitError}</span>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="fullName"
            label="Full Name"
            error={errors.fullName?.message}
            {...register('fullName', { required: 'Full name is required' })}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Input
            id="password"
            label={editing ? 'New Password (leave blank to keep)' : 'Password'}
            type="password"
            error={errors.password?.message}
            {...register('password', editing ? {} : {
              required: 'Password is required',
              minLength: { value: 8, message: 'At least 8 characters' },
            })}
          />
          <Select
            id="role"
            label="Role"
            options={[
              { value: UserRole.PARTICIPANT, label: 'Participant' },
              { value: UserRole.ADMIN, label: 'Admin' },
            ]}
            {...register('role')}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editing ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete User">
        <p className="text-sm text-text-muted mb-6">
          Are you sure you want to delete this user? This action cannot be undone.
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
