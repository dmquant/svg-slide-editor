import './globals.css';
import type { Metadata } from 'next';
import Navigation from '@/components/layout/Navigation';

export const metadata: Metadata = {
  title: 'SVG Slide Editor',
  description: 'Create and edit SVG slides',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
