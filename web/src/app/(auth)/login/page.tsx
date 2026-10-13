'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/Button';

function EyeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function EyeOffIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justVerified = searchParams.get('verified') === 'true';
  const emailParam = searchParams.get('email') || '';

  const { login, isLoading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide an email address');
      return;
    }

    setError(null);
    setInfoMessage(null);

    try {
      const res: any = await login(email.trim(), password);
      // If user verified successfully -> go to dashboard
      if (res?.data?.token) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      // Workflow: login -> if verified false -> verify page
      const isUnverified =
        err?.status === 403 ||
        err?.isVerified === false ||
        err?.data?.isVerified === false ||
        err?.message?.includes('not verified');

      if (isUnverified) {
        setInfoMessage('Account not verified yet. Redirecting to verification...');
        setTimeout(() => {
          router.push(`/verify?email=${encodeURIComponent(email.trim())}`);
        }, 1200);
        return;
      }

      setError(err?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-12 px-4">
      <div className="border-2 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#1a1a1a] tracking-tight">
            Sign In
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#524d43]">
            Welcome back! Please enter your details.
          </p>
        </div>

        {justVerified && !infoMessage && (
          <div className="mb-4 p-3 bg-[#eaf3eb] border border-[#2e6930] text-[#2e6930] text-xs font-medium rounded-sm">
            Email verified successfully! You can now log in.
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3 bg-[#fefce8] border border-[#b45309] text-[#b45309] text-xs font-medium rounded-sm">
            {infoMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-[#fae8e8] border border-[#7a2020] text-[#7a2020] text-xs font-medium rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a]"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-3.5 py-2.5 bg-[#ffffff] border-2 border-[#1a1a1a] text-[#1a1a1a] placeholder-[#8c8270] text-sm focus:outline-none focus:shadow-[2px_2px_0px_#1a1a1a] transition-all"
            />
          </div>

          {/* Password with Eye Icon */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a]"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-3.5 py-2.5 pr-11 bg-[#ffffff] border-2 border-[#1a1a1a] text-[#1a1a1a] placeholder-[#8c8270] text-sm focus:outline-none focus:shadow-[2px_2px_0px_#1a1a1a] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#524d43] hover:text-[#1a1a1a] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-[3px_3px_0px_#1a1a1a]"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-4 border-t border-[#1a1a1a]/20 text-center text-xs text-[#524d43]">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-bold text-[#1a1a1a] underline hover:text-[#7a2020] transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f1] text-[#1a1a1a]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={<div className="p-12 text-center font-mono">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
