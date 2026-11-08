import { ExpenseCategory } from '@/constants/expenseCategories';

export type Expense = {
  id: number;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paidTo: string;
  date: string;
};
