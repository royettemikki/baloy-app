import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DuesView from '@/components/DuesView';
import AutoRefresh from '@/components/AutoRefresh';

export default async function DuesPage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string;

  const charges = await prisma.duesCharge.findMany({
    where: { homeownerId },
    orderBy: { dueDate: 'desc' },
    include: { payments: { orderBy: { submittedAt: 'desc' }, take: 1 } },
  });

  const serialized = charges.map((c) => ({
    id: c.id,
    description: c.description,
    amount: Number(c.amount),
    dueDate: c.dueDate.toISOString(),
    status: c.status,
    rejectionReason: c.status === 'Rejected' ? (c.payments[0]?.rejectionReason ?? null) : null,
  }));

  const balance = serialized
    .filter((c) => c.status !== 'Paid')
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <>
      <AutoRefresh />
      <DuesView charges={serialized} balance={balance} />
    </>
  );
}
