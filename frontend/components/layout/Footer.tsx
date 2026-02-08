import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/icon.png"
                alt="EventFlow"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-lg font-bold text-text">EventFlow</span>
            </Link>
            <p className="mt-3 text-sm text-text-muted">
              Premium event management platform. Discover, book, and manage events with ease.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-text">Product</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/#events" className="text-sm text-text-muted hover:text-primary transition-colors">Browse Events</Link></li>
              <li><Link href="/auth/register" className="text-sm text-text-muted hover:text-primary transition-colors">Create Account</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">Support</h3>
            <ul className="mt-3 space-y-2">
              <li><span className="text-sm text-text-muted">help@eventflow.com</span></li>
              <li><span className="text-sm text-text-muted">Documentation</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">Legal</h3>
            <ul className="mt-3 space-y-2">
              <li><span className="text-sm text-text-muted">Privacy Policy</span></li>
              <li><span className="text-sm text-text-muted">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} EventFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
