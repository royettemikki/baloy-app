'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInviteAction } from '@/app/actions/admin';
import CopyInviteLink from './CopyInviteLink';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function InviteForm() {
  const [fullName, setFullName] = useState('');
  const [unit, setUnit] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createInviteAction(fullName, unit, email);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setCreatedToken(result.token!);
    setFullName('');
    setUnit('');
    setEmail('');
    router.refresh();
  }

  if (createdToken) {
    return (
      <div className="rounded-xl border border-brand bg-brand-soft p-4">
        <p className="mb-3 text-sm text-brand-strong">
          Invite created — share this link with the resident.
        </p>
        <div className="flex items-center justify-between">
          <CopyInviteLink token={createdToken} />
          <button onClick={() => setCreatedToken(null)} className="text-xs text-ink-soft">
            Create another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Input
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div>
        <Input label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} required />
      </div>
      <div>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? 'Creating…' : 'Create invite'}
      </Button>
    </form>
  );
}
