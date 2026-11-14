'use client';

import Link from 'next/link';
import { formatFullDate } from '@/lib/formatDate';
import { IconCheck, IconChevronDown, IconClock, IconFileText } from '@/components/Icons';
import PageHeader from '@/components/PageHeader';

type Charge = {
  id: number;
  description: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: 'Due' | 'Paid' | 'Overdue';
};

type DueBreakdownItem = {
  id: number;
  description: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  remaining: number;
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
  dueBreakdown,
  creditBalance,
  receipts,
  hasMoreHistory,
  hasMoreReceipts,
  latestPayment,
}: {
  charges: Charge[];
  balance: number;
  dueBreakdown: DueBreakdownItem[];
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
      <PageHeader
        eyebrow="Resident account"
        title="Dues & payments"
        description="Review your balance, payment history, and receipts."
      />

      {creditBalance > 0 && (
        <div className="bg-brand-soft/60 mb-3 flex items-start gap-2.5 rounded-2xl px-4 py-3 shadow-sm">
          <IconCheck width={16} height={16} className="mt-0.5 shrink-0 text-brand-strong" />
          <p className="text-xs leading-relaxed text-brand-strong">
            {currency(creditBalance)} property credit will automatically apply to the next
            assessment.
          </p>
        </div>
      )}

      {isRejected && latestPayment?.rejectionReason && (
        <div className="mb-3 rounded-2xl bg-danger-soft px-4 py-3 shadow-sm">
          <p className="text-sm font-semibold text-danger">Payment needs attention</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            {latestPayment.rejectionReason}
          </p>
        </div>
      )}

      <section className="relative isolate mb-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-strong via-brand to-brand px-5 py-5 text-on-brand shadow-[0_18px_42px_-20px_var(--brand)] sm:px-7 sm:py-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 -z-10 h-56 w-56 rounded-full border-[30px] border-on-brand-subtle"
        />
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <span
              className={`mb-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${balance > 0 ? 'bg-warning text-white' : 'bg-on-brand-subtle text-on-brand'}`}
            >
              {balance > 0 ? 'Balance due' : 'Account clear'}
            </span>
            <p className="text-xs font-medium text-on-brand-muted">Current balance</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-on-brand sm:text-4xl">
              {currency(balance)}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-on-brand-muted">
              {isPending ? (
                <>
                  <IconClock width={14} height={14} className="text-accentwarm" /> Payment awaiting
                  confirmation
                </>
              ) : balance > 0 ? (
                'Amount due'
              ) : (
                <>
                  <IconCheck width={14} height={14} className="text-on-brand" /> All caught up
                </>
              )}
            </div>
          </div>
          {balance > 0 && !isPending && (
            <Link
              href="/dues/pay"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-on-brand-surface px-5 text-sm font-semibold text-brand-strong shadow-lg transition hover:opacity-90"
            >
              {isRejected ? 'Try payment again' : 'Pay balance'}
            </Link>
          )}
        </div>
      </section>

      {dueBreakdown.length > 0 && (
        <section className="border-line/70 mb-6 overflow-hidden rounded-[24px] border bg-surface shadow-[0_12px_30px_-24px_var(--overlay-strong)]">
          <div className="border-line/60 from-surface-muted/80 flex items-center justify-between gap-3 border-b bg-gradient-to-r to-surface px-4 py-4 sm:px-5">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-brand-strong">
                What makes up your balance
              </p>
              <h2 className="mt-1 text-sm font-semibold text-ink">Outstanding charges</h2>
            </div>
            <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-semibold text-brand-strong">
              {dueBreakdown.length} {dueBreakdown.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="divide-line/60 divide-y">
            {dueBreakdown.map((item) => {
              const isPartial = item.amountPaid > 0;
              return (
                <div key={item.id} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
                  <span
                    className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                      item.status === 'Overdue' ? 'bg-danger' : 'bg-warning'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-relaxed text-ink sm:text-sm">
                      {item.description}
                    </p>
                    <p className="mt-0.5 text-[10px] text-ink-muted sm:text-[11px]">
                      Due {formatFullDate(item.dueDate)}
                      {isPartial &&
                        ` · ${currency(item.amountPaid)} paid of ${currency(item.amount)}`}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold tabular-nums text-ink sm:text-sm">
                      {currency(item.remaining)}
                    </p>
                    <p
                      className={`mt-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                        item.status === 'Overdue' ? 'text-danger' : 'text-warning'
                      }`}
                    >
                      {item.status === 'Overdue' ? 'Overdue' : isPartial ? 'Partially paid' : 'Due'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-surface-muted/60 flex items-center justify-between border-t border-line px-4 py-3.5 sm:px-5">
            <span className="text-xs font-semibold text-ink">Total outstanding</span>
            <span className="text-sm font-bold tabular-nums text-brand-strong">
              {currency(balance)}
            </span>
          </div>
        </section>
      )}

      <section className="border-line/70 mb-6 overflow-hidden rounded-[24px] border bg-surface shadow-[0_12px_30px_-24px_var(--overlay-strong)]">
        <div className="from-brand-soft/70 flex items-center justify-between gap-3 bg-gradient-to-r to-surface px-4 py-3.5 sm:px-5">
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
          <div className="divide-line/50 divide-y">
            {receipts.map((receipt) => (
              <div key={receipt.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
                  <IconCheck width={16} height={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{receipt.description}</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">
                    {formatFullDate(receipt.confirmedAt)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums text-brand-strong">
                    {currency(receipt.amountPaid)}
                  </p>
                  <Link
                    href={`/receipt/${receipt.id}`}
                    className="mt-1 inline-flex items-center rounded-full bg-brand px-2.5 py-1 text-[10px] font-semibold text-on-brand hover:bg-brand-strong"
                  >
                    View receipt
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-5">
            <p className="text-sm font-medium text-ink">No receipts yet</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              A receipt will appear here after a submitted payment is confirmed.
            </p>
          </div>
        )}
        {receipts.length > 0 && hasMoreReceipts && (
          <Link
            href="/dues/receipts"
            className="border-brand/15 bg-brand-soft/60 flex min-h-11 items-center justify-center border-t text-xs font-semibold text-brand-strong transition hover:bg-brand-soft"
          >
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
            <Link
              href="/dues/history"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-strong"
            >
              Full history <IconChevronDown width={13} height={13} className="-rotate-90" />
            </Link>
          )}
        </div>
        {charges.length > 0 ? (
          <div className="border-line/70 overflow-hidden rounded-[24px] border bg-surface shadow-[0_12px_30px_-24px_var(--overlay-strong)]">
            {charges.map((charge, index) => {
              const remaining = charge.amount - charge.amountPaid;
              const isPartial = charge.status !== 'Paid' && charge.amountPaid > 0;
              const statusClass =
                charge.status === 'Paid'
                  ? 'bg-brand-soft text-brand-strong'
                  : charge.status === 'Overdue'
                    ? 'bg-danger-soft text-danger'
                    : 'bg-warning-soft text-warning';

              return (
                <div
                  key={charge.id}
                  className={`px-4 py-3.5 sm:px-5 ${index > 0 ? 'border-line/50 border-t' : ''} ${charge.status === 'Overdue' ? 'bg-danger-soft/40' : ''}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{charge.description}</p>
                      <p className="mt-0.5 text-[11px] text-ink-muted">
                        Due {formatFullDate(charge.dueDate)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-ink">
                        {currency(charge.amount)}
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusClass}`}
                      >
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
