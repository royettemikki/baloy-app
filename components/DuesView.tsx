'use client';

import Link from 'next/link';
import { formatFullDate } from '@/lib/formatDate';
import { IconCheck, IconChevronDown, IconClock, IconFileText } from '@/components/Icons';

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

function currency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

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
    <div className="mx-auto max-w-3xl animate-fadeInUp">
      <header className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-strong">Resident account</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Dues &amp; payments</h1>
        <p className="mt-1 text-sm text-ink-soft">Review your balance, payment history, and receipts.</p>
      </header>

      {creditBalance > 0 && (
        <div className="mb-3 flex items-start gap-2.5 rounded-2xl bg-brand-soft/60 px-4 py-3 shadow-sm">
          <IconCheck width={16} height={16} className="mt-0.5 shrink-0 text-brand-strong" />
          <p className="text-xs leading-relaxed text-brand-strong">
            {currency(creditBalance)} property credit will automatically apply to the next assessment.
          </p>
        </div>
      )}

      {isRejected && latestPayment?.rejectionReason && (
        <div className="mb-3 rounded-2xl bg-danger-soft px-4 py-3 shadow-sm">
          <p className="text-sm font-semibold text-danger">Payment needs attention</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">{latestPayment.rejectionReason}</p>
        </div>
      )}

      <section className={`mb-5 overflow-hidden rounded-2xl p-4 shadow-sm sm:p-5 ${balance > 0 ? 'bg-warning-soft' : 'bg-brand-soft'}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${balance > 0 ? 'bg-warning text-white' : 'bg-brand text-on-brand'}`}>
              {balance > 0 ? 'Balance due' : 'Account clear'}
            </span>
            <p className="text-xs font-medium text-ink-soft">Current balance</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-ink">{currency(balance)}</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft">
              {isPending ? (
                <><IconClock width={14} height={14} className="text-warning" /> Payment awaiting confirmation</>
              ) : balance > 0 ? (
                'Amount due'
              ) : (
                <><IconCheck width={14} height={14} className="text-brand-strong" /> All caught up</>
              )}
            </div>
          </div>
          {balance > 0 && !isPending && (
            <Link
              href="/dues/pay"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-on-brand transition hover:bg-brand-strong"
            >
              {isRejected ? 'Try payment again' : 'Pay balance'}
            </Link>
          )}
        </div>
      </section>

      <section className="mb-5 overflow-hidden rounded-2xl bg-surface shadow-sm">
        <div className="flex items-center justify-between gap-3 bg-brand-soft/25 px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
              <IconFileText width={16} height={16} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink">Payment receipts</h2>
              <p className="text-[11px] text-ink-muted">Confirmed payments</p>
            </div>
          </div>
        </div>

        {receipts.length > 0 ? (
          <div className="divide-y divide-line/50">
            {receipts.map((receipt) => (
              <div key={receipt.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
                  <IconCheck width={16} height={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{receipt.description}</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">{formatFullDate(receipt.confirmedAt)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums text-brand-strong">{currency(receipt.amountPaid)}</p>
                  <Link href={`/receipt/${receipt.id}`} className="mt-1 inline-flex items-center rounded-full bg-brand px-2.5 py-1 text-[10px] font-semibold text-on-brand hover:bg-brand-strong">
                    View receipt
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-5">
            <p className="text-sm font-medium text-ink">No receipts yet</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">A receipt will appear here after a submitted payment is confirmed.</p>
          </div>
        )}
        {receipts.length > 0 && hasMoreReceipts && (
          <Link href="/dues/receipts" className="flex min-h-11 items-center justify-center border-t border-brand/15 bg-brand-soft/60 text-xs font-semibold text-brand-strong transition hover:bg-brand-soft">
            View all receipts
          </Link>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between gap-3 px-0.5">
          <div>
            <h2 className="text-sm font-semibold text-ink">Charge history</h2>
            <p className="text-[11px] text-ink-muted">Assessments and their payment status</p>
          </div>
          {hasMoreHistory && (
            <Link href="/dues/history" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-strong">
              Full history <IconChevronDown width={13} height={13} className="-rotate-90" />
            </Link>
          )}
        </div>
        {charges.length > 0 ? (
          <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
            {charges.map((charge, index) => {
              const remaining = charge.amount - charge.amountPaid;
              const isPartial = charge.status !== 'Paid' && charge.amountPaid > 0;
              const statusClass = charge.status === 'Paid'
                ? 'bg-brand-soft text-brand-strong'
                : charge.status === 'Overdue'
                  ? 'bg-danger-soft text-danger'
                  : 'bg-warning-soft text-warning';

              return (
                <div key={charge.id} className={`px-4 py-3.5 sm:px-5 ${index > 0 ? 'border-t border-line/50' : ''} ${charge.status === 'Overdue' ? 'bg-danger-soft/40' : ''}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{charge.description}</p>
                      <p className="mt-0.5 text-[11px] text-ink-muted">Due {formatFullDate(charge.dueDate)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-ink">{currency(charge.amount)}</p>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusClass}`}>
                        {isPartial ? 'Partially paid' : charge.status}
                      </span>
                    </div>
                  </div>
                  {isPartial && (
                    <p className="mt-2 text-[11px] text-ink-soft">
                      {currency(charge.amountPaid)} paid · {currency(remaining)} remaining
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-surface-muted px-4 py-6 text-center text-xs text-ink-muted">
            No dues charges yet.
          </div>
        )}
      </section>
    </div>
  );
}
