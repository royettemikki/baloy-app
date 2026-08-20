import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatFullDate } from '@/lib/formatDate';

export default async function DuesHistoryPage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string;

  const charges = await prisma.duesCharge.findMany({
    where: { homeownerId },
    orderBy: { dueDate: 'desc' },
  });

  return (
    <div>
      <Link href="/dues" className="mb-4 inline-block text-sm font-medium text-brand">
        ← Dues
      </Link>
      <h1 className="mb-4 text-xl font-medium">Full history</h1>

      {charges.map((c) => {
        const amount = Number(c.amount);
        const amountPaid = Number(c.amountPaid);
        const remaining = amount - amountPaid;
        const isPartial = c.status !== 'Paid' && amountPaid > 0;
        return (
          <div key={c.id} className="border-t border-line py-2.5 first:border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-0.5 text-[13.5px] font-medium">{c.description}</p>
                <p className="text-[11.5px] text-ink-muted">{formatFullDate(c.dueDate)}</p>
              </div>
              <div className="text-right">
                <p className="mb-0.5 text-[13.5px]">₱{amount.toFixed(2)}</p>
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
                ₱{amountPaid.toFixed(2)} paid so far · ₱{remaining.toFixed(2)} remaining
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
