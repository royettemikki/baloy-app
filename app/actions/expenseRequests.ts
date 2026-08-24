'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCommitteeMemberships } from '@/lib/electionWinners';
import { ExpenseCategory } from '@/constants/expenseCategories';
import { hasApprovalAuthority } from '@/lib/electionWinners';

export async function createExpenseRequestAction(data: {
  positionId: number;
  category: ExpenseCategory;
  description: string;
  amount: number;
  justification: string;
}) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id;
  if (!homeownerId) return { error: 'You must be signed in.' };
  if (!data.amount || data.amount <= 0) return { error: 'Enter a valid amount.' };
  if (!data.justification?.trim()) return { error: 'Please explain why this expense is needed.' };

  const memberships = await getCommitteeMemberships(homeownerId);
  const authorized = memberships.some((m) => m.positionId === data.positionId);
  if (!authorized) return { error: 'You are not currently an elected member of that committee.' };

  await prisma.expenseRequest.create({
    data: {
      homeownerId,
      positionId: data.positionId,
      category: data.category,
      description: data.description,
      amount: data.amount,
      justification: data.justification,
    },
  });

  revalidatePath('/expense-requests');
  return { success: true };
}

export async function approveExpenseRequestAction(requestId: number) {
  const session = await getServerSession(authOptions);
  const reviewerId = (session?.user as any)?.id;
  if (!reviewerId) return { error: 'You must be signed in.' };

  const authorized = await hasApprovalAuthority(reviewerId);
  if (!authorized) return { error: 'You do not have permission to do this.' };

  const request = await prisma.expenseRequest.findUnique({ where: { id: requestId } });
  if (!request) return { error: 'Request not found.' };
  if (request.status !== 'Pending') return { error: 'This request has already been reviewed.' };
  if (request.homeownerId === reviewerId) {
    return {
      error: 'You cannot review your own request — another approver needs to handle this one.',
    };
  }

  await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        category: request.category,
        description: request.description,
        amount: request.amount,
        paidTo: '',
        date: new Date(),
      },
    });

    await tx.expenseRequest.update({
      where: { id: requestId },
      data: { status: 'Approved', resultingExpenseId: expense.id, reviewedAt: new Date() },
    });
  });

  revalidatePath('/admin/expenses');
  revalidatePath('/admin/reports/cash-flow');
  return { success: true };
}

export async function rejectExpenseRequestAction(requestId: number, reason: string) {
  const session = await getServerSession(authOptions);
  const reviewerId = (session?.user as any)?.id;
  if (!reviewerId) return { error: 'You must be signed in.' };

  const authorized = await hasApprovalAuthority(reviewerId);
  if (!authorized) return { error: 'You do not have permission to do this.' };

  if (!reason?.trim()) return { error: 'A reason is required.' };

  const request = await prisma.expenseRequest.findUnique({ where: { id: requestId } });
  if (!request) return { error: 'Request not found.' };
  if (request.status !== 'Pending') return { error: 'This request has already been reviewed.' };
  if (request.homeownerId === reviewerId) {
    return {
      error: 'You cannot review your own request — another approver needs to handle this one.',
    };
  }

  await prisma.expenseRequest.update({
    where: { id: requestId },
    data: { status: 'Rejected', rejectionReason: reason, reviewedAt: new Date() },
  });

  revalidatePath('/admin/expenses');
  return { success: true };
}
