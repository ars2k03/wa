'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide an email address');
      return;
    }

    setError(null);
    try {
      await login(email.trim(), password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    }
  };

  const handleQuickDemo = () => {
    setEmail('operator@telegraph.internal');
    setPassword('demopass123');
  };

  return (
    <div className="w-full max-w-md mx-auto my-12 px-4">
      <div className="border-3 border-[#1a1a1a] bg-[#fbf8f1] shadow-[8px_8px_0px_#1a1a1a]">
        {/* Header Strip */}
        <div className="border-b-2 border-[#1a1a1a] bg-[#ede5d3] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif font-black text-2xl text-[#1a1a1a] tracking-tight uppercase">
              OPERATOR SIGN IN
            </h2>
            <p className="font-mono text-xs text-[#524d43] uppercase tracking-wider">
              TELEGRAPH DISPATCH TERMINAL
            </p>
          </div>
          <Badge variant="burgundy" rotate="right">
            AUTH
          </Badge>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <p className="font-serif text-sm text-[#524d43] leading-relaxed">
            Enter registered press credentials to access the central device connection console and API key ledger.
          </p>

          {error && (
            <div className="p-3 bg-[#fae8e8] border-2 border-[#7a2020] text-[#7a2020] font-mono text-xs font-bold">
              ! {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="OPERATOR EMAIL"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@domain.com"
              isMono
              required
            />

            <Input
              label="ACCESS CIPHER / PASSWORD"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              isMono
            />

            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full shadow-[4px_4px_0px_#1a1a1a]"
                isLoading={isLoading}
              >
                AUTHORIZE & ENTER CONSOLE →
              </Button>

              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-1 text-center font-mono text-xs text-[#7a2020] font-bold hover:underline cursor-pointer"
              >
                [AUTO-FILL DEMO OPERATOR CREDENTIALS]
              </button>
            </div>
          </form>

          <div className="border-t-2 border-[#1a1a1a] pt-4 text-center text-xs font-mono text-[#524d43]">
            Do not have a registered press card?{' '}
            <Link
              href="/register"
              className="font-bold text-[#1a1a1a] underline hover:text-[#7a2020]"
            >
              REGISTER ACCOUNT
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#fbf8f1] text-[#1a1a1a]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <LoginForm />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
