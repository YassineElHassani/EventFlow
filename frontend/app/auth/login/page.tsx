'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, clearError } from '@/store/slices/authSlice';
import { UserRole } from '@/lib/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Zap, AlertCircle } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token, loading, error } = useAppSelector((s) => s.auth);

  const {
    register: reg,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (token && user) {
      router.push(user.role === UserRole.ADMIN ? '/admin' : '/dashboard');
    }
  }, [token, user, router]);

  const onSubmit = (data: LoginForm) => {
    dispatch(login(data));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary text-white flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold text-text">EventFlow</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-text">Welcome back</h1>
          <p className="mt-1 text-sm text-text-muted">Sign in to your account</p>
        </div>

        {/* Form card */}
        <div className="rounded-xl bg-white p-6 shadow-soft">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-accent-red-light p-3 text-sm text-accent-red-dark">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{Array.isArray(error) ? error.join(', ') : error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...reg('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              })}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...reg('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
            />
            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-medium text-primary hover:text-primary-dark">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
