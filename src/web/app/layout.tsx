import React from 'react';
import { Inter } from 'next/font/google'; // v14.0.0
import ToastProvider from '../../providers/ToastProvider';
import { Toaster } from '../../components/ui/toaster';
import Header from '../../components/Header';
import './globals.css';

// Configure the Inter font with latin subset and swap display strategy
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

// Define metadata for the application used by NextJS for SEO
export const metadata = {
  title: 'Organization Configuration Management Tool',
  description: 'Internal tool for managing organization configurations in a multi-tenant system',
};

/**
 * Root layout component that wraps all pages in the application.
 * Provides global providers, styling, and common UI elements.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container py-6 md:py-8">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}