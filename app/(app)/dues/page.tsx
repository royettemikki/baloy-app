import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AutoRefresh from '@/components/AutoRefresh';
import DuesView from '@/components/DuesView';
import { ensureCurrentMonthDues } from '@/lib/monthlyDues';

const PREVIEW_COUNT = 4;

export default async function DuesPage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string;

  // Keep the current month's assessment visible even if a scheduled job was delayed.
  await ensureCurrentMonthDues();

  const homeowner = await prisma.homeowner.findUnique({
    where: { id: homeownerId },
    select: { property: { select: { id: true, creditBalance: true, homeowners: { select: { id: true } } } } },
  });
  if (!homeowner) redirect('/login');
  const residentIds = homeowner.property.homeowners.map((resident) => resident.id);

  const [charges, receipts, latestPayment, chargesTotal, receiptsTotal] =
    await Promise.all([
      prisma.duesCharge.findMany({
        where: { homeownerId: { in: residentIds } },
        orderBy: { dueDate: 'desc' },
        take: PREVIEW_COUNT,
      }),
      prisma.payment.findMany({
        where: { homeownerId: { in: residentIds }, status: 'Confirmed' },
        orderBy: { confirmedAt: 'desc' },
        take: PREVIEW_COUNT,
      }),
      prisma.payment.findFirst({ where: { homeownerId: { in: residentIds } }, orderBy: { submittedAt: 'desc' } }),
      prisma.duesCharge.count({ where: { homeownerId: { in: residentIds } } }),
      prisma.payment.count({ where: { homeownerId: { in: residentIds }, status: 'Confirmed' } }),
    ]);

  const allOpenCharges = await prisma.duesCharge.findMany({
    where: { homeownerId: { in: residentIds }, status: { not: 'Paid' } },
  });

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

  const balance = allOpenCharges.reduce(
    (sum, c) => sum + (Number(c.amount) - Number(c.amountPaid)),
    0,
  );
  const creditBalance = Number(homeowner.property.creditBalance);

  return (
    <>
      <AutoRefresh />
      <DuesView
        charges={serialized}
        balance={balance}
        creditBalance={creditBalance}
        receipts={serializedReceipts}
        hasMoreHistory={chargesTotal > PREVIEW_COUNT}
        hasMoreReceipts={receiptsTotal > PREVIEW_COUNT}
        latestPayment={
          latestPayment
            ? { status: latestPayment.status, rejectionReason: latestPayment.rejectionReason }
            : null
        }
      />
    </>
  );
}
