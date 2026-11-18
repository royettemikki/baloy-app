'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isFeatureEnabled } from '@/lib/featureVisibility';

export async function claimPaymentAction(referenceNumber: string, amountPaid: number) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id;
  if (!homeownerId) return { error: 'You must be signed in.' };
  if (!(await isFeatureEnabled('payments', 'resident'))) {
    return { error: 'Dues and payments are currently unavailable.' };
  }
  if (!referenceNumber?.trim()) return { error: 'Reference or transaction number is required.' };
  if (!amountPaid || amountPaid <= 0) return { error: 'Enter the amount you actually sent.' };

  await prisma.payment.create({
    data: { homeownerId, amountPaid, referenceNumber, status: 'Submitted' },
  });

  revalidatePath('/dues');
  return { success: true };
}
