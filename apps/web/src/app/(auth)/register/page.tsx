'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { logoSrc } = useTheme();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ fullName, email, password });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative transition-colors">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <img src={logoSrc} alt="AscendiaOS" className="h-12 w-auto object-contain" />
        </div>
        <h2 className="text-xl font-bold text-primary tracking-tight">
          Create your Account
        </h2>
        <p className="mt-1 text-xs text-zinc-400">
          Start structuring your personal exam & study preparation
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-6 border border-zinc-800 rounded-sm sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-sm text-xs text-red-400">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full bg-background border border-zinc-800 rounded-sm px-3.5 py-2 text-xs text-primary placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full bg-background border border-zinc-800 rounded-sm px-3.5 py-2 text-xs text-primary placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                className="w-full bg-background border border-zinc-800 rounded-sm px-3.5 py-2 text-xs text-primary placeholder-zinc-600 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 rounded-sm text-xs font-semibold text-zinc-950 bg-orange-500 hover:bg-orange-600 focus:outline-none transition-all duration-150 active:scale-[0.98]"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <p className="text-xs text-zinc-400">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-orange-400 hover:text-orange-300">
                Sign in <ArrowRight className="w-3 h-3 inline ml-0.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
