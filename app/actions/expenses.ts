'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminOrNull } from '@/lib/adminAuth';
import { ExpenseCategory } from '@/constants/expenseCategories';

type ExpenseInput = {
  category: ExpenseCategory;
  description: string;
  amount: number;
  paidTo: string;
  date: string;
};

function revalidateExpensePages() {
  revalidatePath('/admin/expenses');
  revalidatePath('/admin/reports/cash-flow');
}

export async function createExpenseAction(data: ExpenseInput) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (!data.amount || data.amount <= 0) return { error: 'Enter a valid amount.' };

  await prisma.expense.create({
    data: {
      category: data.category,
      description: data.description,
      amount: data.amount,
      paidTo: data.paidTo,
      date: new Date(data.date),
    },
  });

  revalidateExpensePages();
  return { success: true };
}

export async function updateExpenseAction(id: number, data: ExpenseInput) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };
  if (!data.amount || data.amount <= 0) return { error: 'Enter a valid amount.' };

  await prisma.expense.update({
    where: { id },
    data: {
      category: data.category,
      description: data.description,
      amount: data.amount,
      paidTo: data.paidTo,
      date: new Date(data.date),
    },
  });

  revalidateExpensePages();
  return { success: true };
}

export async function deleteExpenseAction(id: number) {
  const admin = await getAdminOrNull();
  if (!admin) return { error: 'You do not have permission to do this.' };

  await prisma.expense.delete({ where: { id } });
  revalidateExpensePages();
  return { success: true };
}
