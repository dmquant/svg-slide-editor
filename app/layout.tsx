import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

// Use Inter font instead of Geist Mono to avoid connection issues
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
