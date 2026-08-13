'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function claimPaymentAction(
  duesChargeId: number,
  referenceNumber: string,
) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id;
  if (!homeownerId) return { error: 'You must be signed in.' };
  if (!referenceNumber?.trim())
    return { error: 'Reference or transaction number is required.' };

  const charge = await prisma.duesCharge.findFirst({
    where: { id: duesChargeId, homeownerId },
  });
  if (!charge) return { error: 'Charge not found.' };
  if (charge.status !== 'Due' && charge.status !== 'Rejected') {
    return { error: 'This charge is not awaiting payment.' };
  }

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        duesChargeId: charge.id,
        homeownerId,
        amountPaid: charge.amount,
        referenceNumber,
        status: 'Submitted',
      },
    }),
    prisma.duesCharge.update({
      where: { id: charge.id },
      data: { status: 'Pending' },
    }),
  ]);

  return { success: true };
}
