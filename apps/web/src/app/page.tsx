'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { BrainCircuit } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 animate-bounce">
          <BrainCircuit className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100">StudyOS</h1>
      </div>
      <p className="text-xs text-slate-400">Loading your personal study workspace...</p>
    </div>
  );
}
