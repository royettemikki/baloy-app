'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { claimInviteAction } from '@/app/actions';

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
    <form onSubmit={handleSubmit} className='flex-1 px-6 py-6 overflow-y-auto'>
      <div className='bg-surface-muted rounded-2xl px-3.5 py-3 mb-4'>
        <p className='text-sm font-medium'>{fullName}</p>
        <p className='text-xs text-ink-soft'>
          Unit {unit} · {email}
        </p>
      </div>

      {error && <p className='text-danger text-xs text-center mb-3'>{error}</p>}

      <label className='block text-[11.5px] text-ink-soft mb-1.5'>
        Set a password
      </label>
      <input
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        className='w-full border border-line rounded-xl px-3.5 py-2.5 text-sm mb-5 bg-surface'
      />

      <button
        type='submit'
        disabled={loading}
        className='w-full bg-brand text-on-brand rounded-xl py-3.5 text-sm font-medium mb-3 disabled:opacity-60'
      >
        {loading ? 'Setting up your account…' : 'Create account'}
      </button>
    </form>
  );
}
