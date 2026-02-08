import type { Metadata } from 'next';
import './global.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'EventFlow — Manage Events with Flow',
  description: 'Premium event management and reservation platform. Discover, book, and manage events effortlessly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
