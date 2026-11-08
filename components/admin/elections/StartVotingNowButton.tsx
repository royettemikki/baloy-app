'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { startVotingAction } from '@/app/actions/elections';

export default function StartVotingButton({ electionId }: { electionId: number }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await startVotingAction(electionId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setConfirming(false);
      router.refresh();
    });
  }

  if (confirming) {
    return (
      <div className="mb-4 rounded-lg bg-warning-soft p-3">
        <p className="mb-2 text-xs text-ink-soft">
          This ends candidate filing (if still open) and opens voting right now. Are you sure?
        </p>
        {error && <p className="mb-2 text-xs text-danger">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={() => setConfirming(false)}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={pending}
            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-on-brand disabled:opacity-60"
          >
            {pending ? 'Starting…' : 'Yes, start voting'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="mb-4 rounded-lg bg-brand px-3 py-2 text-xs font-medium text-on-brand"
    >
      Start voting
    </button>
  );
}
