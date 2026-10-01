import { prisma } from '@/lib/prisma';
import ReportTabs from '@/app/admin/reports/ReportTabs';
import ExportCsvButton from '@/app/admin/reports/ExportCsvButton';

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default async function CashFlowReportPage() {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [payments, expenses] = await Promise.all([
    prisma.payment.findMany({
      where: { status: 'Confirmed', confirmedAt: { gte: twelveMonthsAgo } },
      select: { amountPaid: true, confirmedAt: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: twelveMonthsAgo } },
      select: { amount: true, date: true },
    }),
  ]);

  const months: string[] = [];
  const cursor = new Date(twelveMonthsAgo);
  for (let i = 0; i < 12; i++) {
    months.push(monthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const totals: Record<string, { income: number; expenses: number }> = {};
  months.forEach((m) => (totals[m] = { income: 0, expenses: 0 }));

  payments.forEach((p) => {
    if (!p.confirmedAt) return;
    const key = monthKey(p.confirmedAt);
    if (totals[key]) totals[key].income += Number(p.amountPaid);
  });

  expenses.forEach((e) => {
    const key = monthKey(e.date);
    if (totals[key]) totals[key].expenses += Number(e.amount);
  });

  const rows = months.map((m) => ({
    month: monthLabel(m),
    income: totals[m].income,
    expenses: totals[m].expenses,
    net: totals[m].income - totals[m].expenses,
  }));

  const totalIncome = rows.reduce((sum, r) => sum + r.income, 0);
  const totalExpenses = rows.reduce((sum, r) => sum + r.expenses, 0);
  const csvRows = rows.map((r) => [
    r.month,
    r.income.toFixed(2),
    r.expenses.toFixed(2),
    r.net.toFixed(2),
  ]);

  return (
    <div>
      <ReportTabs active="cash-flow" />

      <div className="mb-6 mt-6 flex items-center justify-between">
        <p className="text-sm text-ink-soft">Money collected vs. spent, last 12 months.</p>
        <ExportCsvButton
          filename="cash-flow-report.csv"
          headers={['Month', 'Income', 'Expenses', 'Net']}
          rows={csvRows}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <p className="mb-1 text-xs text-ink-muted">Total collected</p>
          <p className="text-2xl font-medium text-brand-strong">₱{totalIncome.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <p className="mb-1 text-xs text-ink-muted">Total spent</p>
          <p className="text-2xl font-medium text-danger">₱{totalExpenses.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <p className="mb-1 text-xs text-ink-muted">Net</p>
          <p
            className={`text-2xl font-medium ${totalIncome - totalExpenses >= 0 ? 'text-brand-strong' : 'text-danger'}`}
          >
            ₱{(totalIncome - totalExpenses).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3 font-medium">Month</th>
              <th className="px-5 py-3 text-right font-medium">Income</th>
              <th className="px-5 py-3 text-right font-medium">Expenses</th>
              <th className="px-5 py-3 text-right font-medium">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.month}>
                <td className="px-5 py-3">{r.month}</td>
                <td className="px-5 py-3 text-right text-brand-strong">₱{r.income.toFixed(2)}</td>
                <td className="px-5 py-3 text-right text-danger">₱{r.expenses.toFixed(2)}</td>
                <td
                  className={`px-5 py-3 text-right font-medium ${r.net >= 0 ? '' : 'text-danger'}`}
                >
                  ₱{r.net.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
