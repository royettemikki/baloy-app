'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  approveCandidacyFilingAction,
  rejectCandidacyFilingAction,
} from '@/app/actions/candidacyFilings';

export default function CandidacyFilingRow({
  filingId,
  homeownerName,
  statement,
}: {
  filingId: number;
  homeownerName: string;
  statement: string | null;
}) {
  const [mode, setMode] = useState<'idle' | 'approving' | 'rejecting'>('idle');
  const [ballotNumber, setBallotNumber] = useState('1');
  const [isIncumbent, setIsIncumbent] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveCandidacyFilingAction(
        filingId,
        parseInt(ballotNumber, 10),
        isIncumbent,
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      const result = await rejectCandidacyFilingAction(filingId, reason);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl bg-surface-muted p-3">
      <p className="text-sm font-medium">{homeownerName}</p>
      {statement && <p className="mt-1 text-xs text-ink-soft">{statement}</p>}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      {mode === 'approving' ? (
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-[10px] text-ink-muted">Ballot #</label>
            <input
              type="number"
              min={1}
              value={ballotNumber}
              onChange={(e) => setBallotNumber(e.target.value)}
              className="w-16 rounded-lg border border-line bg-surface px-2 py-1.5 text-xs"
            />
          </div>
          <label className="flex items-center gap-1.5 pb-1.5 text-xs text-ink-soft">
            <input
              type="checkbox"
              checked={isIncumbent}
              onChange={(e) => setIsIncumbent(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            Incumbent
          </label>
          <button
            onClick={handleApprove}
            disabled={pending}
            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-on-brand disabled:opacity-60"
          >
            {pending ? 'Approving…' : 'Confirm'}
          </button>
          <button onClick={() => setMode('idle')} className="px-2 py-1.5 text-xs text-ink-soft">
            Cancel
          </button>
        </div>
      ) : mode === 'rejecting' ? (
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this being rejected?"
            rows={2}
            className="w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-xs"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={pending}
              className="rounded-lg bg-danger px-3 py-1.5 text-xs font-medium text-surface disabled:opacity-60"
            >
              {pending ? 'Rejecting…' : 'Confirm rejection'}
            </button>
            <button onClick={() => setMode('idle')} className="px-2 py-1.5 text-xs text-ink-soft">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setMode('approving')}
            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-on-brand"
          >
            Approve
          </button>
          <button
            onClick={() => setMode('rejecting')}
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-danger"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
