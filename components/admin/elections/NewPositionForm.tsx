'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPositionAction } from '@/app/actions/elections';

export default function NewPositionForm({ electionId }: { electionId: number }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [seats, setSeats] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await createPositionAction(electionId, title, parseInt(seats, 10));
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setTitle('');
    setSeats('1');
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-brand-strong"
      >
        + Add position
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl bg-surface-muted p-4">
      <div>
        <label className="mb-1.5 block text-[11px] text-ink-soft">Position title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Treasurer, President, Maintenance Committee"
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[11px] text-ink-soft">Number of seats</label>
        <input
          type="number"
          min={1}
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          className="w-24 rounded-lg border border-line bg-surface px-3 py-2 text-sm"
        />
        <p className="mt-1 text-[11px] text-ink-muted">
          Most officer roles (President, Treasurer) are 1. Committees can have several.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand px-3 py-2 text-xs font-medium text-on-brand disabled:opacity-60"
        >
          {loading ? 'Adding…' : 'Add position'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-2 py-2 text-xs font-medium text-ink-soft"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  );
}
