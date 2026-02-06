import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-accent-red mx-auto" />
        <h1 className="text-2xl font-bold text-text">Access Denied</h1>
        <p className="text-text-muted">You don&apos;t have permission to view this page.</p>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
