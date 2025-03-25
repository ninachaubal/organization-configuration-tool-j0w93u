import React from 'react';
import { Home } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/ui/button';

export const metadata: Metadata = {
  title: 'Page Not Found | Organization Configuration Tool',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4">
      <EmptyState
        title="Page Not Found"
        description="The page you are looking for doesn't exist or has been moved."
        action={
          <Link href="/" aria-label="Navigate to home page">
            <Button variant="outline" size="lg">
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              Go to Home
            </Button>
          </Link>
        }
      />
    </div>
  );
}