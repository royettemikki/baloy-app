import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatFullDate } from '@/lib/formatDate';
import BackLink from '@/components/BackLink';
import { getPropertyResidentIds } from '@/lib/propertyAccess';

const currency = (amount: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

export default async function DuesHistoryPage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string | undefined;

  if (!homeownerId) redirect('/login');
  const residentIds = await getPropertyResidentIds(homeownerId);
  if (!residentIds) redirect('/login');

  const charges = await prisma.duesCharge.findMany({
    where: { homeownerId: { in: residentIds } },
    orderBy: { dueDate: 'desc' },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/dues">Back to dues</BackLink>
      <header className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-strong">
          Dues &amp; payments
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Charge history</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Assessments and payment status for your property.
        </p>
      </header>

      {charges.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {charges.map((charge, index) => {
            const amount = Number(charge.amount);
            const amountPaid = Number(charge.amountPaid);
            const remaining = amount - amountPaid;
            const isPartial = charge.status !== 'Paid' && amountPaid > 0;
            const statusClass =
              charge.status === 'Paid'
                ? 'bg-brand-soft text-brand-strong'
                : charge.status === 'Overdue'
                  ? 'bg-danger-soft text-danger'
                  : 'bg-surface-muted text-ink-soft';

            return (
              <div
                key={charge.id}
                className={`px-4 py-3.5 sm:px-5 ${index > 0 ? 'border-t border-line' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{charge.description}</p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                      Due {formatFullDate(charge.dueDate)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-ink">
                      {currency(amount)}
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
                    {currency(amountPaid)} paid · {currency(remaining)} remaining
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line px-4 py-7 text-center text-sm text-ink-muted">
          No dues charges yet.
        </div>
      )}
    </div>
  );
}
