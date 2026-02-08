'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register as registerAction, clearError } from '@/store/slices/authSlice';
import { UserRole } from '@/lib/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token, loading, error } = useAppSelector((s) => s.auth);

  const {
    register: reg,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (token && user) {
      router.push(user.role === UserRole.ADMIN ? '/admin' : '/dashboard');
    }
  }, [token, user, router]);

  const onSubmit = (data: RegisterForm) => {
    dispatch(
      registerAction({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      }),
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/icon.png" alt="EventFlow" width={40} height={40} className="rounded-lg" />
            <span className="text-2xl font-bold text-text">EventFlow</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-text">Create your account</h1>
          <p className="mt-1 text-sm text-text-muted">Join EventFlow and start booking events</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-soft">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-accent-red-light p-3 text-sm text-accent-red-dark">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{Array.isArray(error) ? error.join(', ') : error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="fullName"
              label="Full Name"
              placeholder="John Doe"
              error={errors.fullName?.message}
              {...reg('fullName', { required: 'Full name is required' })}
            />
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
            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...reg('confirmPassword', {
                required: 'Please confirm your password',
                // eslint-disable-next-line react-hooks/incompatible-library
                validate: (val) => val === watch('password') || 'Passwords do not match',
              })}
            />
            <Button type="submit" className="w-full" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-primary hover:text-primary-dark">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
