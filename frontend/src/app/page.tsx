'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only redirect once
    if (hasRedirected) return;

    // Wait for authentication to be determined
    if (isLoading) return;

    // Check localStorage directly for more reliable auth check
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const storedAuth = localStorage.getItem('isAuthenticated');
      
      if (storedUser && storedAuth === 'true') {
        try {
          JSON.parse(storedUser); // Validate JSON
          router.push('/dashboard');
          setHasRedirected(true);
          return;
        } catch (error) {
          // Invalid JSON, clear storage
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
        }
      }
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      setHasRedirected(true);
    }
  }, [isAuthenticated, isLoading, router, hasRedirected]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">UDISE Dashboard</h1>
        <p className="text-gray-600">
          {isLoading ? 'Checking authentication...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}
