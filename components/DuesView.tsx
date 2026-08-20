'use client';

import Link from 'next/link';
import { formatFullDate } from '@/lib/formatDate';

type Charge = {
  id: number;
  description: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: 'Due' | 'Paid' | 'Overdue';
};

type Receipt = { id: number; description: string; amountPaid: number; confirmedAt: string };
type LatestPayment = {
  status: 'Submitted' | 'Confirmed' | 'Rejected';
  rejectionReason: string | null;
} | null;

export default function DuesView({
  charges,
  balance,
  creditBalance,
  receipts,
  hasMoreHistory,
  hasMoreReceipts,
  latestPayment,
}: {
  charges: Charge[];
  balance: number;
  creditBalance: number;
  receipts: Receipt[];
  hasMoreHistory: boolean;
  hasMoreReceipts: boolean;
  latestPayment: LatestPayment;
}) {
  const isPending = latestPayment?.status === 'Submitted';
  const isRejected = latestPayment?.status === 'Rejected';

  return (
    <div>
      <h1 className="mb-3.5 text-xl font-medium">Dues</h1>

      {creditBalance > 0 && (
        <div className="border-brand/20 mb-3.5 rounded-2xl border bg-brand-soft p-4">
          <p className="text-sm font-medium text-brand-strong">
            You have ₱{creditBalance.toFixed(2)} in account credit — this'll automatically apply to
            your next charge.
          </p>
        </div>
      )}

      {isRejected && latestPayment?.rejectionReason && (
        <div className="border-danger/20 mb-3.5 rounded-2xl border bg-danger-soft p-4">
          <p className="mb-1 text-sm font-medium text-danger">
            Your last payment couldn't be verified
          </p>
          <p className="text-xs text-ink-soft">{latestPayment.rejectionReason}</p>
        </div>
      )}

      <div className="mb-3.5 rounded-2xl bg-brand p-[18px]">
        <p className="mb-1 text-[12.5px] text-brand-soft">Current balance</p>
        <p className="mb-3.5 text-3xl font-medium text-white">₱{balance.toFixed(2)}</p>
        <div className="flex items-center justify-between">
          {isPending ? (
            <p className="text-[13px] text-white">Payment pending confirmation</p>
          ) : balance > 0 ? (
            <p className="text-[13px] text-white">Amount due</p>
          ) : (
            <p className="text-[13px] text-white">All caught up</p>
          )}
          {balance > 0 && !isPending && (
            <Link href="/dues/pay">
              <button className="rounded-xl bg-white px-4 py-2 text-[13px] font-medium text-brand-strong">
                {isRejected ? 'Try again' : 'Pay now'}
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-ink-soft">History</p>
        {hasMoreHistory && (
          <Link href="/dues/history" className="text-xs font-medium text-brand">
            View all →
          </Link>
        )}
      </div>

      {charges.map((c) => {
        const remaining = c.amount - c.amountPaid;
        const isPartial = c.status !== 'Paid' && c.amountPaid > 0;
        return (
          <div key={c.id} className="border-t border-line py-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-0.5 text-[13.5px] font-medium">{c.description}</p>
                <p className="text-[11.5px] text-ink-muted">{formatFullDate(c.dueDate)}</p>
              </div>
              <div className="text-right">
                <p className="mb-0.5 text-[13.5px]">₱{c.amount.toFixed(2)}</p>
                <span
                  className={`rounded-pill px-2 py-0.5 text-[10.5px] font-medium ${
                    c.status === 'Paid'
                      ? 'bg-brand-soft text-brand-strong'
                      : c.status === 'Overdue'
                        ? 'bg-danger-soft text-danger'
                        : 'bg-warning-soft text-warning'
                  }`}
                >
                  {isPartial ? 'Partially paid' : c.status}
                </span>
              </div>
            </div>
            {isPartial && (
              <p className="mt-1.5 text-xs text-warning">
                ₱{c.amountPaid.toFixed(2)} paid so far · ₱{remaining.toFixed(2)} remaining
              </p>
            )}
          </div>
        );
      })}

      {receipts.length > 0 && (
        <>
          <div className="mb-2 mt-5 flex items-center justify-between">
            <p className="text-sm font-medium text-ink-soft">Receipts</p>
            {hasMoreReceipts && (
              <Link href="/dues/receipts" className="text-xs font-medium text-brand">
                View all →
              </Link>
            )}
          </div>
          {receipts.map((r, i) => (
            <div
              key={r.id}
              className={`flex items-center justify-between py-2.5 ${i > 0 ? 'border-t border-line' : ''}`}
            >
              <div>
                <p className="mb-0.5 text-[13.5px] font-medium">{r.description}</p>
                <p className="text-[11.5px] text-ink-muted">₱{r.amountPaid.toFixed(2)}</p>
              </div>
              <Link href={`/receipt/${r.id}`} className="text-xs font-medium text-brand">
                View receipt
              </Link>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
