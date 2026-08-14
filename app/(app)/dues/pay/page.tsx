import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PaymentInstructions from '@/components/PaymentInstructions';

export default async function PayPage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string;

  const charges = await prisma.duesCharge.findMany({
    where: { homeownerId, status: { in: ['Due', 'Overdue'] } },
  });

  const remainingAmount = charges.reduce(
    (sum, c) => sum + (Number(c.amount) - Number(c.amountPaid)),
    0,
  );
  if (remainingAmount <= 0) redirect('/dues');

  return <PaymentInstructions remainingAmount={remainingAmount} />;
}
