'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminOrNull } from '@/lib/adminAuth';

export async function confirmPaymentAction(paymentId: number) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  let confirmed: boolean;
  try {
    confirmed = await prisma.$transaction(
      async (tx) => {
        // Claim the submitted payment before applying its funds. The conditional update
        // prevents two admins from applying the same payment concurrently.
        const claim = await tx.payment.updateMany({
          where: { id: paymentId, status: 'Submitted' },
          data: { status: 'Confirmed', confirmedAt: new Date() },
        });
        if (claim.count !== 1) return false;

        const payment = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });
        const homeowner = await tx.homeowner.findUniqueOrThrow({
          where: { id: payment.homeownerId },
          select: {
            propertyId: true,
            property: {
              select: { creditBalance: true, homeowners: { select: { id: true } } },
            },
          },
        });
        const now = new Date();
        const startOfToday = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
        );
        let pool = Number(payment.amountPaid) + Number(homeowner.property.creditBalance);
        const allocations: string[] = [];

        const openCharges = await tx.duesCharge.findMany({
          where: {
            homeownerId: { in: homeowner.property.homeowners.map((resident) => resident.id) },
            status: { in: ['Due', 'Overdue'] },
          },
          orderBy: [{ dueDate: 'asc' }, { id: 'asc' }],
        });

        for (const charge of openCharges) {
          if (pool <= 0) break;
          const owed = Number(charge.amount) - Number(charge.amountPaid);
          if (owed <= 0) continue;

          const applied = Math.min(pool, owed);
          const newAmountPaid = Number(charge.amountPaid) + applied;
          const newStatus =
            newAmountPaid >= Number(charge.amount)
              ? 'Paid'
              : charge.dueDate < startOfToday
                ? 'Overdue'
                : 'Due';

          await tx.duesCharge.update({
            where: { id: charge.id },
            data: { amountPaid: newAmountPaid, status: newStatus },
          });
          allocations.push(`${charge.description}: ₱${applied.toFixed(2)}`);
          pool -= applied;
        }

        await tx.payment.update({
          where: { id: paymentId },
          data: {
            allocationSummary:
              allocations.length > 0 ? allocations.join(', ') : 'Applied as account credit',
          },
        });

        await tx.property.update({
          where: { id: homeowner.propertyId },
          data: { creditBalance: pool },
        });
        return true;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return {
        error: 'Another payment for this property was processed at the same time. Please retry.',
      };
    }
    throw error;
  }

  if (!confirmed) return { error: 'Payment not found or already reviewed.' };

  revalidatePath('/admin/payments');
  revalidatePath('/home');
  revalidatePath('/dues');
  return { success: true };
}

export async function rejectPaymentAction(paymentId: number, reason: string) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (!reason?.trim()) return { error: 'A reason is required.' };

  const result = await prisma.payment.updateMany({
    where: { id: paymentId, status: 'Submitted' },
    data: { status: 'Rejected', rejectionReason: reason },
  });
  if (result.count !== 1) return { error: 'Payment not found or already reviewed.' };

  revalidatePath('/admin/payments');
  revalidatePath('/home');
  revalidatePath('/dues');
  return { success: true };
}
