import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { organization } from '@/data/mock';
import { formatLongDate } from '@/lib/formatDate';
import ReceiptPrintButton from '@/components/ReceiptPrintButton';
import BackLink from '@/components/BackLink';
import { IconCheck, IconFileText } from '@/components/Icons';

function parseAllocationSummary(summary: string | null) {
  if (!summary) return [];

  const allocations: { description: string; amount: number }[] = [];
  const pattern = /(?:^|,\s*)(.+?):\s*₱([\d,]+\.\d{2})(?=,\s*.+?:\s*₱|$)/g;
  for (const match of summary.matchAll(pattern)) {
    allocations.push({
      description: match[1],
      amount: Number(match[2].replaceAll(',', '')),
    });
  }
  return allocations;
}

function currency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string | undefined;
  if (!homeownerId) redirect('/login');

  const account = await prisma.homeowner.findUnique({
    where: { id: homeownerId },
    select: { propertyId: true },
  });
  if (!account) notFound();

  const paymentId = Number(params.id);
  const payment = paymentId
    ? await prisma.payment.findFirst({
        where: {
          id: paymentId,
          status: 'Confirmed',
          homeowner: { propertyId: account.propertyId },
        },
        include: { homeowner: true },
      })
    : null;

  if (!payment) notFound();

  const allocations = parseAllocationSummary(payment.allocationSummary);

  return (
    <div className="flex min-h-screen justify-center bg-surface-muted px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg">
        <div className="print:hidden">
          <BackLink href="/dues/receipts">Back to receipts</BackLink>
        </div>
        <div className="mb-4 overflow-hidden rounded-[26px] border border-line bg-surface shadow-[0_20px_50px_-28px_var(--overlay-strong)] print:border-0 print:shadow-none">
          <div className="h-1.5 bg-brand" />
          <div className="p-5 sm:p-8">
            <header className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-strong">
                  Official receipt
                </p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  {organization.name}
                </h1>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
                <IconFileText width={19} height={19} />
              </span>
            </header>

            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-3.5 py-3">
              <span className="text-xs text-ink-muted">Receipt number</span>
              <span className="font-mono text-xs font-semibold tracking-wide text-ink">
                RCPT-{String(payment.id).padStart(6, '0')}
              </span>
            </div>

            <div className="space-y-3 border-b border-line pb-5">
              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="text-ink-muted">Received from</span>
                <span className="text-right font-medium text-ink">
                  {payment.homeowner.fullName}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="text-ink-muted">Property / unit</span>
                <span className="text-right font-medium text-ink">{payment.homeowner.unit}</span>
              </div>
              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="text-ink-muted">Reference number</span>
                <span className="text-right font-medium text-ink">
                  {payment.referenceNumber || '—'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="text-ink-muted">Date confirmed</span>
                <span className="text-right font-medium text-ink">
                  {formatLongDate(payment.confirmedAt ?? payment.submittedAt)}
                </span>
              </div>
            </div>

            <section className="py-5" aria-labelledby="allocation-title">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 id="allocation-title" className="text-sm font-semibold text-ink">
                    Payment breakdown
                  </h2>
                  <p className="mt-0.5 text-[11px] text-ink-muted">How this payment was applied</p>
                </div>
                <IconCheck width={16} height={16} className="text-brand-strong" />
              </div>
              {allocations.length > 0 ? (
                <div className="space-y-2.5">
                  {allocations.map((allocation, index) => (
                    <div
                      key={`${allocation.description}-${index}`}
                      className="flex items-start justify-between gap-4 text-xs"
                    >
                      <span className="leading-relaxed text-ink-soft">
                        {allocation.description}
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums text-ink">
                        {currency(allocation.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs leading-relaxed text-ink-soft">
                  {payment.allocationSummary ?? 'Payment allocation details are unavailable.'}
                </p>
              )}
            </section>

            <div className="flex items-end justify-between gap-3 border-t border-dashed border-line pt-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Amount paid
                </p>
                <p className="mt-1 text-xs text-ink-soft">Payment confirmed</p>
              </div>
              <span className="text-2xl font-bold tabular-nums tracking-tight text-brand-strong sm:text-3xl">
                {currency(Number(payment.amountPaid))}
              </span>
            </div>
          </div>
        </div>

        <ReceiptPrintButton />
      </div>
    </div>
  );
}
