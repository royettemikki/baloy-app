'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { endVotingAction } from '@/app/actions/elections';

export default function EndVotingNowButton({ electionId }: { electionId: number }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await endVotingAction(electionId);
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
      <div className="mt-3 rounded-xl bg-on-brand-subtle p-3">
        <p className="text-xs text-on-brand">
          This immediately closes voting and publishes the results. Are you sure?
        </p>
        {error && <p className="mt-2 text-xs text-on-brand">{error}</p>}
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="border-on-brand/30 rounded-lg border px-3 py-1.5 text-xs font-medium text-on-brand"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className="rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-surface disabled:opacity-60"
          >
            {pending ? 'Ending…' : 'Confirm end voting'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setError(null);
        setConfirming(true);
      }}
      className="border-on-brand/35 rounded-xl border px-3.5 py-2 text-xs font-semibold text-on-brand transition-colors hover:bg-on-brand-subtle"
    >
      End voting now
    </button>
  );
}
