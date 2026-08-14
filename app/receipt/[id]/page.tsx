import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { organization } from '@/data/mock';
import { formatLongDate } from '@/lib/formatDate';
import ReceiptPrintButton from '@/components/ReceiptPrintButton';

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string | undefined;
  if (!homeownerId) redirect('/login');

  const paymentId = Number(params.id);
  const payment = paymentId
    ? await prisma.payment.findFirst({
        where: { id: paymentId, homeownerId, status: 'Confirmed' },
        include: { homeowner: true },
      })
    : null;

  if (!payment) notFound();

  return (
    <div className="flex min-h-screen justify-center bg-surface-muted px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-4 rounded-2xl border border-line bg-surface p-8 print:border-0 print:shadow-none">
          <div className="mb-6 text-center">
            <p className="mb-1 text-xs uppercase tracking-wide text-ink-muted">Official Receipt</p>
            <p className="text-lg font-medium">{organization.name}</p>
          </div>

          <div className="mb-4 flex items-center justify-between border-b border-line pb-4 text-sm">
            <span className="text-ink-muted">Receipt No.</span>
            <span className="font-medium">RCPT-{String(payment.id).padStart(6, '0')}</span>
          </div>

          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-ink-muted">Received from</span>
            <span className="font-medium">{payment.homeowner.fullName}</span>
          </div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-ink-muted">Unit</span>
            <span className="font-medium">{payment.homeowner.unit}</span>
          </div>
          <div className="mb-2 flex items-start justify-between gap-4 text-sm">
            <span className="flex-shrink-0 text-ink-muted">Applied to</span>
            <span className="text-right font-medium">{payment.allocationSummary ?? 'Payment'}</span>
          </div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-ink-muted">Reference no.</span>
            <span className="font-medium">{payment.referenceNumber || '—'}</span>
          </div>
          <div className="mb-6 flex items-center justify-between text-sm">
            <span className="text-ink-muted">Date confirmed</span>
            <span className="font-medium">
              {formatLongDate(payment.confirmedAt ?? payment.submittedAt)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-line pt-4">
            <span className="text-sm font-medium">Amount paid</span>
            <span className="text-2xl font-medium text-brand-strong">
              ₱{Number(payment.amountPaid).toFixed(2)}
            </span>
          </div>
        </div>

        <ReceiptPrintButton />
      </div>
    </div>
  );
}
