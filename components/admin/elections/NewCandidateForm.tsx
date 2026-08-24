'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCandidateFromAccountAction } from '@/app/actions/elections';

type Resident = { id: string; fullName: string; unit: string };

export default function NewCandidateForm({
  positionId,
  residents,
}: {
  positionId: number;
  residents: Resident[];
}) {
  const [open, setOpen] = useState(false);
  const [homeownerId, setHomeownerId] = useState('');
  const [ballotNumber, setBallotNumber] = useState('1');
  const [isIncumbent, setIsIncumbent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!homeownerId) {
      setError('Select a resident.');
      return;
    }
    setError(null);
    setLoading(true);
    const result = await createCandidateFromAccountAction(
      positionId,
      homeownerId,
      parseInt(ballotNumber, 10),
      isIncumbent,
    );
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setHomeownerId('');
    setBallotNumber('1');
    setIsIncumbent(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="py-1.5 text-xs font-medium text-brand">
        + Add candidate
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 flex flex-col gap-3 rounded-xl bg-surface-muted p-4"
    >
      <div>
        <label className="mb-1.5 block text-[11px] text-ink-soft">
          Candidate (must already have a resident account)
        </label>
        <select
          value={homeownerId}
          onChange={(e) => setHomeownerId(e.target.value)}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
        >
          <option value="">Select a resident…</option>
          {residents.map((r) => (
            <option key={r.id} value={r.id}>
              {r.fullName} (Unit {r.unit})
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end gap-4">
        <div>
          <label className="mb-1.5 block text-[11px] text-ink-soft">Ballot number</label>
          <input
            type="number"
            min={1}
            value={ballotNumber}
            onChange={(e) => setBallotNumber(e.target.value)}
            className="w-20 rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-1.5 pb-2.5 text-xs text-ink-soft">
          <input
            type="checkbox"
            checked={isIncumbent}
            onChange={(e) => setIsIncumbent(e.target.checked)}
            className="h-4 w-4"
          />
          Currently holds this role (incumbent)
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
        >
          {loading ? 'Adding…' : 'Add candidate'}
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
