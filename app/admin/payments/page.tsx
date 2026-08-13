import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { IconCard, IconCheck, IconTrash } from '@/components/Icons';
import PendingPaymentsQueue from '@/components/admin/payments/PendingPaymentsQueue';
import PaymentHistoryRow from '@/components/admin/payments/PaymentHistoryRow';
import AutoRefresh from '@/components/AutoRefresh';
import { PaymentStatus } from '@prisma/client';

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
    status: { in: ['Confirmed', 'Rejected'] as PaymentStatus[] },
    ...(from || to
      ? { submittedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
      : {}),
    ...(q
      ? {
          OR: [
            { homeowner: { fullName: { contains: q, mode: 'insensitive' as const } } },
            { homeowner: { email: { contains: q, mode: 'insensitive' as const } } },
            { homeowner: { unit: { contains: q, mode: 'insensitive' as const } } },
            { duesCharge: { description: { contains: q, mode: 'insensitive' as const } } },
          ],
        }
      : {}),
  };

  const [pending, confirmedThisMonth, rejectedThisMonth, historyTotal, history] = await Promise.all(
    [
      prisma.payment.findMany({
        where: { status: 'Submitted' },
        include: { homeowner: true, duesCharge: true },
        orderBy: { submittedAt: 'asc' },
      }),
      prisma.payment.count({ where: { status: 'Confirmed', confirmedAt: { gte: startOfMonth } } }),
      prisma.payment.count({ where: { status: 'Rejected', submittedAt: { gte: startOfMonth } } }),
      prisma.payment.count({ where: historyWhere }),
      prisma.payment.findMany({
        where: historyWhere,
        include: { homeowner: true, duesCharge: true },
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
    duesCharge: { description: p.duesCharge.description },
  }));

  const serializedHistory = history.map((p) => ({
    id: p.id,
    amountPaid: Number(p.amountPaid),
    status: p.status as 'Confirmed' | 'Rejected',
    rejectionReason: p.rejectionReason,
    submittedAt: p.submittedAt.toISOString(),
    homeowner: { fullName: p.homeowner.fullName, unit: p.homeowner.unit },
    duesCharge: { description: p.duesCharge.description },
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
      <p className="mb-6 text-sm text-ink-soft">
        Confirm or reject payments residents have submitted.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-warning-soft">
            <IconCard width={18} height={18} className="text-warning" />
          </div>
          <p className="mb-0.5 text-3xl font-medium text-warning">{serializedPending.length}</p>
          <p className="text-xs text-ink-muted">Awaiting confirmation</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft">
            <IconCheck width={18} height={18} className="text-brand-strong" />
          </div>
          <p className="mb-0.5 text-3xl font-medium text-brand-strong">{confirmedThisMonth}</p>
          <p className="text-xs text-ink-muted">Confirmed this month</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-danger-soft">
            <IconTrash width={18} height={18} className="text-danger" />
          </div>
          <p className="mb-0.5 text-3xl font-medium text-danger">{rejectedThisMonth}</p>
          <p className="text-xs text-ink-muted">Rejected this month</p>
        </div>
      </div>

      <p className="mb-3 text-sm font-medium text-ink-soft">Awaiting confirmation</p>
      <PendingPaymentsQueue payments={serializedPending} />

      <p className="mb-3 text-sm font-medium text-ink-soft">Payment history</p>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <form method="GET" className="flex flex-wrap items-end gap-3 border-b border-line p-4">
          <div className="min-w-[180px] flex-1">
            <label className="mb-1.5 block text-[11px] text-ink-soft">Search</label>
            <input
              name="q"
              defaultValue={q}
              placeholder="Name, unit, or description…"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] text-ink-soft">From</label>
            <input
              type="date"
              name="from"
              defaultValue={searchParams.from}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] text-ink-soft">To</label>
            <input
              type="date"
              name="to"
              defaultValue={searchParams.to}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white"
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
