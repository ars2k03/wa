'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { StableText } from '@/components/ui/StableText';
import { api } from '@/lib/api';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Cooldown countdown for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      setDigits(nextDigits);
      return;
    }

    // Handle paste of multiple digits
    if (cleanVal.length > 1) {
      const pasteDigits = cleanVal.slice(0, 6).split('');
      const nextDigits = [...digits];
      pasteDigits.forEach((d, i) => {
        if (index + i < 6) {
          nextDigits[index + i] = d;
        }
      });
      setDigits(nextDigits);
      const nextFocus = Math.min(index + pasteDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = cleanVal;
    setDigits(nextDigits);

    // Auto-advance focus to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join('').trim();

    if (!email.trim()) {
      setError('Please provide an email address');
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter all 6 digits of the verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.verifyOtp({
        email: email.trim(),
        otp,
      });

      if (res.success) {
        setSuccess('Email verified successfully! Redirecting to login...');
        setTimeout(() => {
          // Workflow: verify -> login page
          router.push(`/login?verified=true&email=${encodeURIComponent(email.trim())}`);
        }, 1200);
      } else {
        setError(res.message || 'Verification failed');
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending || !email.trim()) return;

    setResending(true);
    setError(null);
    try {
      const res = await api.resendOtp({ email: email.trim() });
      if (res.success) {
        setSuccess('A fresh 6-digit verification code has been sent to your email.');
        setResendCooldown(60);
      } else {
        setError(res.message || 'Failed to resend verification code');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-12 px-4">
      <div className="border-2 border-[#1a1a1a] bg-[#fbf8f1] shadow-[6px_6px_0px_#1a1a1a] p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-[#ede5d3] border-2 border-[#1a1a1a] rounded-full flex items-center justify-center text-xl font-black">
            ✉
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#1a1a1a] tracking-tight">
            Verify Your Email
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#524d43]">
            {email ? (
              <>
                We sent a 6-digit code to{' '}
                <span className="font-bold text-[#1a1a1a]">{email}</span>
              </>
            ) : (
              'Enter your 6-digit verification code to continue.'
            )}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#fae8e8] border border-[#7a2020] text-[#7a2020] text-xs font-medium rounded-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-[#eaf3eb] border border-[#2e6930] text-[#2e6930] text-xs font-medium rounded-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input if not provided via URL */}
          {!emailParam && (
            <div className="space-y-1.5">
              <label
                htmlFor="verify-email"
                className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a]"
              >
                Email Address
              </label>
              <input
                id="verify-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-3.5 py-2.5 bg-[#ffffff] border-2 border-[#1a1a1a] text-[#1a1a1a] placeholder-[#8c8270] text-sm focus:outline-none focus:shadow-[2px_2px_0px_#1a1a1a] transition-all"
              />
            </div>
          )}

          {/* 6 Digit OTP Inputs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-2 text-center">
              Enter 6-Digit Code
            </label>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  autoFocus={index === 0}
                  className="w-11 sm:w-12 h-13 text-center text-xl font-mono font-bold bg-[#ffffff] border-2 border-[#1a1a1a] text-[#1a1a1a] focus:outline-none focus:shadow-[2px_2px_0px_#1a1a1a] focus:bg-[#fefce8] transition-all"
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-[3px_3px_0px_#1a1a1a]"
              isLoading={loading}
            >
              Verify Account
            </Button>
          </div>
        </form>

        {/* Resend Code Action */}
        <div className="mt-6 pt-4 border-t border-[#1a1a1a]/20 flex flex-col items-center gap-2 text-center text-xs text-[#524d43]">
          <div>
            Didn&apos;t receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending}
              className="font-bold text-[#1a1a1a] underline hover:text-[#7a2020] disabled:opacity-50 disabled:no-underline cursor-pointer"
            >
              <StableText reserve={['Sending...', 'Resend in 00s', 'Resend Code']}>
                {resending
                  ? 'Sending...'
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend Code'}
              </StableText>
            </button>
          </div>

          <div>
            <Link
              href="/login"
              className="text-[#524d43] hover:text-[#1a1a1a] underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono">Loading verification...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
