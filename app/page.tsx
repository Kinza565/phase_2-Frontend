'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth/signin');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Todo Dashboard</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
