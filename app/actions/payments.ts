'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminOrNull } from '@/lib/adminAuth';

export async function confirmPaymentAction(paymentId: number) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return { error: 'Payment not found.' };
  if (payment.status !== 'Submitted') return { error: 'This payment has already been reviewed.' };

  await prisma.$transaction(async (tx) => {
    const homeowner = await tx.homeowner.findUniqueOrThrow({ where: { id: payment.homeownerId } });
    let pool = Number(payment.amountPaid) + Number(homeowner.creditBalance);
    const allocations: string[] = [];

    const openCharges = await tx.duesCharge.findMany({
      where: { homeownerId: payment.homeownerId, status: { in: ['Due', 'Overdue'] } },
      orderBy: { dueDate: 'asc' },
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
          : charge.dueDate < new Date()
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
        status: 'Confirmed',
        confirmedAt: new Date(),
        allocationSummary:
          allocations.length > 0 ? allocations.join(', ') : 'Applied as account credit',
      },
    });

    await tx.homeowner.update({
      where: { id: payment.homeownerId },
      data: { creditBalance: pool },
    });
  });

  revalidatePath('/admin/payments');
  revalidatePath('/home');
  revalidatePath('/dues');
  return { success: true };
}

export async function rejectPaymentAction(paymentId: number, reason: string) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (!reason?.trim()) return { error: 'A reason is required.' };

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return { error: 'Payment not found.' };
  if (payment.status !== 'Submitted') return { error: 'This payment has already been reviewed.' };

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'Rejected', rejectionReason: reason },
  });

  revalidatePath('/admin/payments');
  revalidatePath('/home');
  revalidatePath('/dues');
  return { success: true };
}
