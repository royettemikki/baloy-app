'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { confirmPaymentAction, rejectPaymentAction } from '@/app/actions/payments';

type PendingPayment = {
  id: number;
  amountPaid: number;
  referenceNumber: string | null;
  submittedAt: string;
  homeowner: { fullName: string; unit: string; email: string };
  duesCharge: { description: string };
};

export default function PaymentRow({ payment }: { payment: PendingPayment }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await confirmPaymentAction(payment.id);
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
      const result = await rejectPaymentAction(payment.id, reason);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl bg-surface-muted p-4">
      <div className="mb-2 flex items-start justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{payment.homeowner.fullName}</p>
          <p className="truncate text-xs text-ink-muted">
            Unit {payment.homeowner.unit} · {payment.homeowner.email}
          </p>
        </div>
        <p className="ml-2 flex-shrink-0 text-lg font-medium text-brand-strong">
          ₱{payment.amountPaid.toFixed(2)}
        </p>
      </div>

      <p className="mb-2 text-sm text-ink-soft">{payment.duesCharge.description}</p>

      <div className="mb-3 flex items-center justify-between text-xs text-ink-muted">
        <span>Ref: {payment.referenceNumber || '—'}</span>
        <span>
          {new Date(payment.submittedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      {error && <p className="mb-2 text-xs text-danger">{error}</p>}

      {rejecting ? (
        <div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why couldn't this be verified?"
            rows={2}
            className="mb-2 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setRejecting(false);
                setReason('');
                setError(null);
              }}
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
            onClick={handleConfirm}
            disabled={pending}
            className="flex-1 rounded-lg bg-brand py-2 text-xs font-medium text-white disabled:opacity-60"
          >
            {pending ? 'Confirming…' : 'Confirm payment'}
          </button>
        </div>
      )}
    </div>
  );
}
