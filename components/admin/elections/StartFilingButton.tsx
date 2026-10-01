'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { startFilingAction } from '@/app/actions/elections';

export default function StartFilingButton({
  electionId,
  hasPositions,
}: {
  electionId: number;
  hasPositions: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await startFilingAction(electionId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setConfirming(false);
      router.refresh();
    });
  }

  if (!hasPositions) {
    return (
      <p className="mb-4 text-xs text-ink-muted">
        Add at least one position below before opening this election for filing.
      </p>
    );
  }

  if (confirming) {
    return (
      <div className="mb-4 rounded-lg bg-warning-soft p-3">
        <p className="mb-2 text-xs text-ink-soft">
          This makes the election visible to residents and opens candidate filing immediately. Are
          you sure?
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
            {pending ? 'Opening…' : 'Yes, open for filing'}
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
      Open for filing
    </button>
  );
}
