'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { claimInviteAction } from '@/app/actions/invites';

export default function RegisterForm({
  token,
  fullName,
  unit,
  email,
}: {
  token: string;
  fullName: string;
  unit: string;
  email: string;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await claimInviteAction(token, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Account created, but sign in failed. Try signing in manually.');
      return;
    }
    router.push('/home');
  }

  return (
    <form onSubmit={handleSubmit} className="no-scrollbar">
      <div className="mb-5 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-ink">Create account</h1>
        <p className="mt-1 text-xs text-ink-muted">Set a password to activate your resident account.</p>
      </div>

      <div className="mb-4 rounded-xl bg-surface-muted px-3.5 py-3">
        <p className="text-sm font-medium text-ink">{fullName}</p>
        <p className="text-xs text-ink-soft">Unit {unit} / {email}</p>
      </div>

      {error && <p role="alert" className="mb-3 rounded-xl bg-danger-soft px-3 py-2.5 text-xs text-danger">{error}</p>}

      <label htmlFor="register-password" className="mb-1.5 block text-xs font-medium text-ink-soft">
        Create password
      </label>
      <input
        id="register-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        autoComplete="new-password"
        required
        placeholder="At least 8 characters"
        className="ui-input mb-5 rounded-xl border-transparent bg-surface-muted px-3.5 py-3 text-sm"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-on-brand transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Setting up your account...' : 'Create account'}
      </button>
      <p className="mt-5 text-center text-xs text-ink-soft">
        Already have an account? <Link href="/login" className="font-semibold text-brand-strong hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
