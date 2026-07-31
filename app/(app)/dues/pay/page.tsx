import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PaymentInstructions from '@/components/PaymentInstructions';

export default async function PayPage({
  searchParams,
}: {
  searchParams: { charge?: string };
}) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string;

  const chargeId = Number(searchParams.charge);
  const charge = chargeId
    ? await prisma.duesCharge.findFirst({
        where: { id: chargeId, homeownerId },
      })
    : null;

  if (!charge || (charge.status !== 'Due' && charge.status !== 'Rejected')) {
    redirect('/dues');
  }

  return (
    <PaymentInstructions
      chargeId={charge.id}
      description={charge.description}
      amount={Number(charge.amount)}
    />
  );
}
