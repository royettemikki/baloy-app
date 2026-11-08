'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { IconEye } from '@/components/Icons';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('That email and password combination did not work.');
      return;
    }
    router.push('/home');
  }

  return (
    <form onSubmit={handleSubmit} className="no-scrollbar">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-strong">Login</h1>
        <p className="mt-1 text-xs text-ink-muted">Sign in to your resident account.</p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-danger/20 bg-danger-soft px-3 py-2.5 text-xs text-danger">{error}</p>}

      <label htmlFor="login-email" className="sr-only">Email address</label>
      <div className="relative mb-3">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 fill-none stroke-ink-muted" strokeWidth="1.8">
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
          <path d="m4.5 7 7.5 5.5L19.5 7" />
        </svg>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          placeholder="Email"
          className="ui-input rounded-full border-transparent bg-surface px-10 py-3 text-xs"
        />
      </div>

      <label htmlFor="login-password" className="sr-only">Password</label>
      <div className="relative mb-2">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 fill-none stroke-ink-muted" strokeWidth="1.8">
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        <input
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          placeholder="Password"
          className="ui-input rounded-full border-transparent bg-surface px-10 py-3 pr-11 text-xs"
        />
        <button
          type="button"
          onClick={() => setShowPassword((visible) => !visible)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:bg-surface-muted"
        >
          <IconEye width={16} height={16} />
          {!showPassword && <span aria-hidden="true" className="absolute h-5 w-px rotate-45 bg-ink-muted" />}
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full rounded-full bg-brand-strong py-3 text-sm font-semibold text-on-brand transition hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Signing in...' : 'Login'}
      </button>

      <p className="mt-6 text-center text-[10px] text-ink-muted">
        Don&apos;t have an account? <span className="font-semibold text-brand-strong">Ask your board for an invite.</span>
      </p>
    </form>
  );
}
