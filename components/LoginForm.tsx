'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('dana@example.com');
  const [password, setPassword] = useState('');
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
    <form onSubmit={handleSubmit} className='flex-1 px-6 py-6 overflow-y-auto'>
      <p className='text-xs text-ink-muted text-center mb-4'>
        Sign in to your account
      </p>

      {error && <p className='text-danger text-xs text-center mb-3'>{error}</p>}

      <label className='block text-[11.5px] text-ink-soft mb-1.5'>Email</label>
      <input
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className='w-full border border-line rounded-xl px-3.5 py-2.5 text-sm mb-3 bg-surface'
      />

      <label className='block text-[11.5px] text-ink-soft mb-1.5'>
        Password
      </label>
      <input
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className='w-full border border-line rounded-xl px-3.5 py-2.5 text-sm mb-5 bg-surface'
      />

      <button
        type='submit'
        disabled={loading}
        className='w-full bg-brand text-on-brand rounded-xl py-3.5 text-sm font-medium mb-3 disabled:opacity-60'
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <p className='text-center text-xs text-ink-soft mb-5'>
        New resident?{' '}
        <span className='text-brand font-medium'>Create an account</span>
      </p>
      <p className='text-center text-[10.5px] text-ink-muted'>
        Powered by Baloy
      </p>
    </form>
  );
}
