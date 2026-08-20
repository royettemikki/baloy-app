import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function DuesReceiptsPage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string;

  const receipts = await prisma.payment.findMany({
    where: { homeownerId, status: 'Confirmed' },
    orderBy: { confirmedAt: 'desc' },
  });

  return (
    <div>
      <Link href="/dues" className="mb-4 inline-block text-sm font-medium text-brand">
        ← Dues
      </Link>
      <h1 className="mb-4 text-xl font-medium">All receipts</h1>

      {receipts.map((r, i) => (
        <div
          key={r.id}
          className={`flex items-center justify-between py-2.5 ${i > 0 ? 'border-t border-line' : ''}`}
        >
          <div>
            <p className="mb-0.5 text-[13.5px] font-medium">{r.allocationSummary ?? 'Payment'}</p>
            <p className="text-[11.5px] text-ink-muted">₱{Number(r.amountPaid).toFixed(2)}</p>
          </div>
          <Link href={`/receipt/${r.id}`} className="text-xs font-medium text-brand">
            View receipt
          </Link>
        </div>
      ))}
    </div>
  );
}
