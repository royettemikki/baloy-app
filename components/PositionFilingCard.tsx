'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { fileCandidacyAction } from '@/app/actions/candidacyFilings';
import { IconBallot } from '@/components/Icons';

type Status = 'Pending' | 'Approved' | 'Rejected' | null;

function StatusBadge({ label, tone }: { label: string; tone: 'brand' | 'warning' | 'danger' }) {
  const styles = {
    brand: 'text-brand-strong bg-brand-soft',
    warning: 'text-warning bg-warning-soft',
    danger: 'text-danger bg-danger-soft',
  };
  return (
    <span className={`rounded-pill px-2.5 py-1 text-[11px] font-medium ${styles[tone]}`}>
      {label}
    </span>
  );
}

export default function PositionFilingCard({
  positionId,
  positionTitle,
  electionTitle,
  status,
  rejectionReason,
}: {
  positionId: number;
  positionTitle: string;
  electionTitle: string;
  status: Status;
  rejectionReason: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [statement, setStatement] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await fileCandidacyAction(positionId, statement);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl bg-surface-muted p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-soft">
          <IconBallot width={18} height={18} className="text-purple" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{positionTitle}</p>
          <p className="mb-1.5 text-xs text-ink-muted">{electionTitle}</p>

          {submitted || status === 'Pending' ? (
            <StatusBadge label="Filed — awaiting review" tone="warning" />
          ) : status === 'Approved' ? (
            <StatusBadge label="On the ballot" tone="brand" />
          ) : status === 'Rejected' ? (
            <div>
              <StatusBadge label="Not approved" tone="danger" />
              {rejectionReason && <p className="mt-1.5 text-xs text-danger">{rejectionReason}</p>}
            </div>
          ) : !expanded ? (
            <button onClick={() => setExpanded(true)} className="text-xs font-medium text-brand">
              File to run →
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-2">
              <textarea
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder={`Why do you want to run for ${positionTitle}? (optional)`}
                rows={3}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs"
              />
              {error && <p className="text-xs text-danger">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-brand px-3 py-2 text-xs font-medium text-on-brand disabled:opacity-60"
                >
                  {pending ? 'Filing…' : 'Submit filing'}
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="px-2 py-2 text-xs text-ink-soft"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
