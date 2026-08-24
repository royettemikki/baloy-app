'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  approveExpenseRequestAction,
  rejectExpenseRequestAction,
} from '@/app/actions/expenseRequests';
import { EXPENSE_CATEGORY_LABELS, ExpenseCategory } from '@/constants/expenseCategories';

type Request = {
  id: number;
  homeownerName: string;
  positionTitle: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  justification: string;
};

export default function ExpenseRequestRow({ request }: { request: Request }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveExpenseRequestAction(request.id);
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
      const result = await rejectExpenseRequestAction(request.id, reason);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <p className="mb-1 text-xs text-ink-muted">
        {request.homeownerName} · {request.positionTitle} ·{' '}
        {EXPENSE_CATEGORY_LABELS[request.category]}
      </p>
      <p className="mb-1 text-sm font-medium">{request.description}</p>
      <p className="mb-2 text-lg font-medium text-brand-strong">₱{request.amount.toFixed(2)}</p>
      <p className="mb-3 text-xs text-ink-soft">{request.justification}</p>

      {error && <p className="mb-2 text-xs text-danger">{error}</p>}

      {rejecting ? (
        <div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this being rejected?"
            rows={2}
            className="mb-2 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setRejecting(false)}
              className="flex-1 rounded-lg border border-line py-2 text-xs font-medium text-ink-soft"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={pending}
              className="flex-1 rounded-lg bg-danger py-2 text-xs font-medium text-white disabled:opacity-60"
            >
              {pending ? 'Rejecting…' : 'Confirm rejection'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setRejecting(true)}
            className="flex-1 rounded-lg border border-line py-2 text-xs font-medium text-danger"
          >
            Reject
          </button>
          <button
            onClick={handleApprove}
            disabled={pending}
            className="flex-1 rounded-lg bg-brand py-2 text-xs font-medium text-white disabled:opacity-60"
          >
            {pending ? 'Approving…' : 'Approve'}
          </button>
        </div>
      )}
    </div>
  );
}
