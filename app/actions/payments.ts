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

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'Confirmed', confirmedAt: new Date() },
    }),
    prisma.duesCharge.update({ where: { id: payment.duesChargeId }, data: { status: 'Paid' } }),
  ]);

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

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'Rejected', rejectionReason: reason },
    }),
    prisma.duesCharge.update({ where: { id: payment.duesChargeId }, data: { status: 'Rejected' } }),
  ]);

  revalidatePath('/admin/payments');
  revalidatePath('/home');
  revalidatePath('/dues');
  return { success: true };
}
