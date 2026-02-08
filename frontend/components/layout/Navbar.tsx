'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { UserRole } from '@/lib/types';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((s) => s.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/');
  };

  const dashboardPath = user?.role === UserRole.ADMIN ? '/admin' : '/dashboard';

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/#events', label: 'Events' },
  ];

  return (
    <nav className="sticky top-0 z-40 glass-card shadow-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/icon.png"
              alt="EventFlow"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-text group-hover:text-primary transition-colors">
              EventFlow
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {token && user ? (
              <>
                <Link href={dashboardPath}>
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="h-4 w-4 mr-1.5" />
                    Dashboard
                  </Button>
                </Link>
                <span className="text-sm text-text-muted">{user.fullName || user.email}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden rounded-lg p-2 text-text-muted hover:bg-gray-100 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 pb-4 pt-2 animate-slide-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-text-muted hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <hr className="my-2 border-border" />
          {token && user ? (
            <>
              <Link
                href={dashboardPath}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm font-medium text-text-muted hover:text-primary"
              >
                Dashboard
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="block w-full text-left py-2 text-sm font-medium text-accent-red cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/auth/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Sign In</Button>
              </Link>
              <Link href="/auth/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
