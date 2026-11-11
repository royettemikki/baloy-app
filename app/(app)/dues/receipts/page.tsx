import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatFullDate } from '@/lib/formatDate';
import { IconCheck, IconChevronDown, IconFileText } from '@/components/Icons';
import { getPropertyResidentIds } from '@/lib/propertyAccess';

export default async function DuesReceiptsPage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string | undefined;

  if (!homeownerId) redirect('/login');
  const residentIds = await getPropertyResidentIds(homeownerId);
  if (!residentIds) redirect('/login');

  const receipts = await prisma.payment.findMany({
    where: { homeownerId: { in: residentIds }, status: 'Confirmed' },
    orderBy: { confirmedAt: 'desc' },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dues" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-strong">
        <IconChevronDown width={14} height={14} className="rotate-90" /> Back to dues
      </Link>
      <header className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-strong">Dues &amp; payments</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Payment receipts</h1>
        <p className="mt-1 text-sm text-ink-soft">Open a confirmed payment to view or print its receipt.</p>
      </header>

      {receipts.length > 0 ? (
        <div className="space-y-2.5">
          {receipts.map((receipt) => (
            <Link
              key={receipt.id}
              href={`/receipt/${receipt.id}`}
              className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 transition-colors hover:bg-surface-hover"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
                <IconFileText width={18} height={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">{receipt.allocationSummary ?? 'Payment'}</span>
                <span className="mt-0.5 block text-[11px] text-ink-muted">{formatFullDate(receipt.confirmedAt ?? receipt.submittedAt)}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-sm font-semibold tabular-nums text-ink">
                  {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(receipt.amountPaid))}
                </span>
                <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-brand-strong">
                  <IconCheck width={11} height={11} /> View receipt
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-surface px-5 py-8 text-center">
          <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-surface-muted text-ink-muted">
            <IconFileText width={19} height={19} />
          </span>
          <p className="text-sm font-semibold text-ink">No receipts yet</p>
          <p className="mt-1 text-xs text-ink-muted">Confirmed payments will appear here.</p>
        </div>
      )}
    </div>
  );
}
