import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import PendingPaymentsQueue from '@/components/admin/payments/PendingPaymentsQueue';
import PaymentHistoryRow from '@/components/admin/payments/PaymentHistoryRow';
import AutoRefresh from '@/components/AutoRefresh';
import { IconCard, IconCheck, IconTrash } from '@/components/Icons';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

const PAGE_SIZE = 8;

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: { q?: string; from?: string; to?: string; page?: string };
}) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const page = Math.max(1, Number(searchParams.page) || 1);
  const q = searchParams.q?.trim() ?? '';
  const from = searchParams.from ? new Date(searchParams.from) : null;
  const to = searchParams.to ? new Date(searchParams.to + 'T23:59:59') : null;

  const historyWhere = {
    status: { in: ['Confirmed', 'Rejected'] as PaymentStatusArray },
    ...(from || to
      ? { submittedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
      : {}),
    ...(q
      ? {
          OR: [
            { homeowner: { fullName: { contains: q, mode: 'insensitive' as const } } },
            { homeowner: { email: { contains: q, mode: 'insensitive' as const } } },
            { homeowner: { unit: { contains: q, mode: 'insensitive' as const } } },
          ],
        }
      : {}),
  };

  const [pending, confirmedThisMonth, rejectedThisMonth, historyTotal, history] = await Promise.all(
    [
      prisma.payment.findMany({
        where: { status: 'Submitted' },
        include: { homeowner: true },
        orderBy: { submittedAt: 'asc' },
      }),
      prisma.payment.count({ where: { status: 'Confirmed', confirmedAt: { gte: startOfMonth } } }),
      prisma.payment.count({ where: { status: 'Rejected', submittedAt: { gte: startOfMonth } } }),
      prisma.payment.count({ where: historyWhere }),
      prisma.payment.findMany({
        where: historyWhere,
        include: { homeowner: true },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ],
  );

  const totalPages = Math.max(1, Math.ceil(historyTotal / PAGE_SIZE));

  const serializedPending = pending.map((p) => ({
    id: p.id,
    amountPaid: Number(p.amountPaid),
    referenceNumber: p.referenceNumber,
    submittedAt: p.submittedAt.toISOString(),
    homeowner: { fullName: p.homeowner.fullName, unit: p.homeowner.unit, email: p.homeowner.email },
  }));

  const serializedHistory = history.map((p) => ({
    id: p.id,
    amountPaid: Number(p.amountPaid),
    status: p.status as 'Confirmed' | 'Rejected',
    rejectionReason: p.rejectionReason,
    allocationSummary: p.allocationSummary,
    submittedAt: p.submittedAt.toISOString(),
    homeowner: { fullName: p.homeowner.fullName, unit: p.homeowner.unit },
  }));

  function pageLink(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (searchParams.from) params.set('from', searchParams.from);
    if (searchParams.to) params.set('to', searchParams.to);
    params.set('page', String(targetPage));
    return `/admin/payments?${params.toString()}`;
  }

  return (
    <div>
      <AutoRefresh />
      <AdminPageHeader
        title="Payments"
        description="Review resident submissions and track payment history."
        eyebrow="Finance"
      />

      <div className="mb-8 grid grid-cols-1 overflow-hidden rounded-2xl bg-surface shadow-sm sm:grid-cols-3">
        <div className="p-4 sm:p-5">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-warning-soft">
            <IconCard width={18} height={18} className="text-warning" />
          </div>
          <p className="mb-0.5 text-2xl font-semibold tracking-tight text-warning">{serializedPending.length}</p>
          <p className="text-xs text-ink-muted">Awaiting confirmation</p>
        </div>
        <div className="border-t border-line/50 p-4 sm:border-l sm:border-t-0 sm:p-5">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft">
            <IconCheck width={18} height={18} className="text-brand-strong" />
          </div>
          <p className="mb-0.5 text-2xl font-semibold tracking-tight text-brand-strong">{confirmedThisMonth}</p>
          <p className="text-xs text-ink-muted">Confirmed this month</p>
        </div>
        <div className="border-t border-line/50 p-4 sm:border-l sm:border-t-0 sm:p-5">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-danger-soft">
            <IconTrash width={18} height={18} className="text-danger" />
          </div>
          <p className="mb-0.5 text-2xl font-semibold tracking-tight text-danger">{rejectedThisMonth}</p>
          <p className="text-xs text-ink-muted">Rejected this month</p>
        </div>
      </div>

      <div className="mb-3">
        <h2 className="text-base font-semibold text-ink">Awaiting confirmation</h2>
        <p className="mt-0.5 text-xs text-ink-muted">Review the submitted payment details below.</p>
      </div>
      <PendingPaymentsQueue payments={serializedPending} />

      <div className="mb-3 mt-8">
        <h2 className="text-base font-semibold text-ink">Payment history</h2>
        <p className="mt-0.5 text-xs text-ink-muted">Search and filter confirmed or rejected payments.</p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
        <form method="GET" className="flex flex-wrap items-end gap-3 border-b border-line/50 bg-surface-muted/50 p-4">
          <div className="min-w-[180px] flex-1">
            <label className="mb-1.5 block text-[11px] text-ink-soft">Search</label>
            <input
              name="q"
              defaultValue={q}
              placeholder="Name, email, or unit…"
              className="w-full rounded-lg bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] text-ink-soft">From</label>
            <input
              type="date"
              name="from"
              defaultValue={searchParams.from}
              className="rounded-lg bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] text-ink-soft">To</label>
            <input
              type="date"
              name="to"
              defaultValue={searchParams.to}
              className="rounded-lg bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand"
          >
            Filter
          </button>
          {(q || searchParams.from || searchParams.to) && (
            <Link href="/admin/payments" className="px-2 py-2 text-sm text-ink-soft">
              Clear
            </Link>
          )}
        </form>

        <div className="px-5">
          {serializedHistory.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-muted">No matching payments.</p>
          ) : (
            serializedHistory.map((p) => <PaymentHistoryRow key={p.id} payment={p} />)
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col gap-2 border-t border-line bg-surface-muted px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-ink-muted">
              Page {page} of {totalPages} · {historyTotal} total
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={pageLink(page - 1)}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-ink-soft"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={pageLink(page + 1)}
                  className="rounded-lg border border-line bg-surface px-3 py-1.5 text-ink-soft"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type PaymentStatusArray = ('Confirmed' | 'Rejected')[];
