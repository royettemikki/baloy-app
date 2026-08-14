import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DuesView from '@/components/DuesView';

export default async function DuesPage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string;

  const [charges, homeowner, receipts, latestPayment] = await Promise.all([
    prisma.duesCharge.findMany({ where: { homeownerId }, orderBy: { dueDate: 'desc' } }),
    prisma.homeowner.findUnique({ where: { id: homeownerId } }),
    prisma.payment.findMany({
      where: { homeownerId, status: 'Confirmed' },
      orderBy: { confirmedAt: 'desc' },
    }),
    prisma.payment.findFirst({ where: { homeownerId }, orderBy: { submittedAt: 'desc' } }),
  ]);

  const serialized = charges.map((c) => ({
    id: c.id,
    description: c.description,
    amount: Number(c.amount),
    amountPaid: Number(c.amountPaid),
    dueDate: c.dueDate.toISOString(),
    status: c.status as 'Due' | 'Paid' | 'Overdue',
  }));

  const serializedReceipts = receipts.map((r) => ({
    id: r.id,
    description: r.allocationSummary ?? 'Payment',
    amountPaid: Number(r.amountPaid),
    confirmedAt: (r.confirmedAt ?? r.submittedAt).toISOString(),
  }));

  const balance = serialized
    .filter((c) => c.status !== 'Paid')
    .reduce((sum, c) => sum + (c.amount - c.amountPaid), 0);
  const creditBalance = Number(homeowner?.creditBalance ?? 0);

  return (
    <DuesView
      charges={serialized}
      balance={balance}
      creditBalance={creditBalance}
      receipts={serializedReceipts}
      latestPayment={
        latestPayment
          ? { status: latestPayment.status, rejectionReason: latestPayment.rejectionReason }
          : null
      }
    />
  );
}
