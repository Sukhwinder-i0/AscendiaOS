'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { logoSrc } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex items-center space-x-3 mb-4">
        <img src={logoSrc} alt="Exam COMPETII" className="h-10 w-auto object-contain" />
      </div>
      <p className="text-xs text-secondary">Loading your focused study workspace...</p>
    </div>
  );
}
