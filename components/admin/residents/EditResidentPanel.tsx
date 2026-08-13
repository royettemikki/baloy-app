'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateResidentAction } from '@/app/actions/admin';
import { IconX } from '@/components/Icons';

export default function EditResidentPanel({
  homeowner,
  onClose,
}: {
  homeowner: { id: string; fullName: string; unit: string; email: string };
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState(homeowner.fullName);
  const [unit, setUnit] = useState(homeowner.unit);
  const [email, setEmail] = useState(homeowner.email);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await updateResidentAction(homeowner.id, {
      fullName,
      unit,
      email,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div
      className='fixed inset-0 z-50 flex justify-end bg-black/30 animate-fadeIn'
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className='w-full max-w-sm bg-surface h-full p-6 overflow-y-auto no-scrollbar animate-slideInRight'
      >
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-lg font-medium'>Edit resident</h2>
          <button
            onClick={onClose}
            className='w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center'
          >
            <IconX width={14} height={14} className='text-ink-soft' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div>
            <label className='block text-[11px] text-ink-soft mb-1.5'>
              Full name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className='w-full border border-line rounded-lg px-3 py-2.5 text-sm'
            />
          </div>
          <div>
            <label className='block text-[11px] text-ink-soft mb-1.5'>
              Unit
            </label>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
              className='w-full border border-line rounded-lg px-3 py-2.5 text-sm'
            />
          </div>
          <div>
            <label className='block text-[11px] text-ink-soft mb-1.5'>
              Email
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full border border-line rounded-lg px-3 py-2.5 text-sm'
            />
          </div>
          {error && <p className='text-danger text-xs'>{error}</p>}
          <button
            type='submit'
            disabled={loading}
            className='bg-brand text-on-brand text-sm font-medium px-4 py-2.5 rounded-lg disabled:opacity-60'
          >
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
