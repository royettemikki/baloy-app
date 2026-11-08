import { prisma } from '@/lib/prisma';
import ExpensesList from '@/app/admin/expenses/ExpensesList';
import NewExpenseButton from '@/app/admin/expenses/NewExpenseButton';
import ExpenseRequestRow from '@/components/admin/expenses/ExpenseRequestRow';
import AutoRefresh from '@/components/AutoRefresh';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default async function AdminExpensesPage() {
  const session = await getServerSession(authOptions);
  const currentAdminId = (session?.user as any)?.id as string;

  const pendingRequests = await prisma.expenseRequest.findMany({
    where: { status: 'Pending', homeownerId: { not: currentAdminId } },
    include: { homeowner: true, position: true },
    orderBy: { createdAt: 'asc' },
  });

  const serializedRequests = pendingRequests.map((r) => ({
    id: r.id,
    homeownerName: r.homeowner.fullName,
    positionTitle: r.position.title,
    category: r.category,
    description: r.description,
    amount: Number(r.amount),
    justification: r.justification,
  }));

  const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } });

  const serialized = expenses.map((e) => ({
    id: e.id,
    category: e.category,
    description: e.description,
    amount: Number(e.amount),
    paidTo: e.paidTo,
    date: e.date.toISOString(),
  }));

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalThisMonth = serialized
    .filter((e) => new Date(e.date) >= startOfMonth)
    .reduce((sum, e) => sum + e.amount, 0);
  const totalAllTime = serialized.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <AutoRefresh />
      <AdminPageHeader
        title="Expenses"
        description="Review committee requests and track HOA spending."
        action={<NewExpenseButton />}
        eyebrow="Finance"
      />

      {serializedRequests.length > 0 && (
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium text-ink-soft">Pending requests</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serializedRequests.map((r) => (
              <ExpenseRequestRow key={r.id} request={r} />
            ))}
          </div>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 overflow-hidden rounded-2xl bg-surface shadow-sm sm:grid-cols-2">
        <div className="p-5">
          <p className="mb-1 text-xs font-medium text-ink-muted">Spent this month</p>
          <p className="text-3xl font-medium">₱{totalThisMonth.toFixed(2)}</p>
        </div>
        <div className="border-t border-line/50 p-5 sm:border-l sm:border-t-0">
          <p className="mb-1 text-xs font-medium text-ink-muted">Total recorded spending</p>
          <p className="text-3xl font-medium">₱{totalAllTime.toFixed(2)}</p>
        </div>
      </div>

      <ExpensesList expenses={serialized} />
    </div>
  );
}
