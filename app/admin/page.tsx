import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { IconCard, IconBarChart, IconClock, IconUser, IconFileText, IconDots } from '@/components/Icons';
import { formatShortDate } from '@/lib/formatDate';
import StatCard from '@/components/admin/dashboard/StatCard';
import DuesIncomeChart from '@/components/admin/dashboard/DuesIncomeChart';

export default async function AdminDashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Monday-start of the current week, for the weekly income chart.
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Monday
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - dayOfWeek);

  const [
    collectedAgg,
    collectedPrevAgg,
    billedAgg,
    overdueCharges,
    activeResidents,
    pendingPayments,
    pendingExpenses,
    weekPayments,
    expenseStatusCounts,
    recentAnnouncements,
    pendingPaymentsList,
    pendingExpensesList,
  ] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amountPaid: true },
      where: { status: 'Confirmed', confirmedAt: { gte: monthStart, lt: nextMonthStart } },
    }),
    prisma.payment.aggregate({
      _sum: { amountPaid: true },
      where: { status: 'Confirmed', confirmedAt: { gte: prevMonthStart, lt: monthStart } },
    }),
    prisma.duesCharge.aggregate({
      _sum: { amount: true },
      where: { dueDate: { gte: monthStart, lt: nextMonthStart } },
    }),
    prisma.duesCharge.findMany({
      where: { status: 'Overdue' },
      select: { amount: true, amountPaid: true, homeownerId: true },
    }),
    prisma.homeowner.count({ where: { passwordHash: { not: null } } }),
    prisma.payment.count({ where: { status: 'Submitted' } }),
    prisma.expenseRequest.count({ where: { status: 'Pending' } }),
    prisma.payment.findMany({
      where: { status: 'Confirmed', confirmedAt: { gte: weekStart } },
      select: { amountPaid: true, confirmedAt: true },
    }),
    prisma.expenseRequest.groupBy({
      by: ['status'],
      where: { createdAt: { gte: monthStart, lt: nextMonthStart } },
      _count: true,
    }),
    prisma.announcement.findMany({ orderBy: [{ pinned: 'desc' }, { postedAt: 'desc' }], take: 3 }),
    prisma.payment.findMany({
      where: { status: 'Submitted' },
      include: { homeowner: true },
      orderBy: { submittedAt: 'asc' },
      take: 4,
    }),
    prisma.expenseRequest.findMany({
      where: { status: 'Pending' },
      include: { homeowner: true, position: true },
      orderBy: { createdAt: 'asc' },
      take: 4,
    }),
  ]);

  const collected = Number(collectedAgg._sum.amountPaid ?? 0);
  const collectedPrev = Number(collectedPrevAgg._sum.amountPaid ?? 0);
  const billed = Number(billedAgg._sum.amount ?? 0);
  const trendPct = collectedPrev > 0 ? ((collected - collectedPrev) / collectedPrev) * 100 : null;

  const overdueOutstanding = overdueCharges.reduce(
    (sum, c) => sum + (Number(c.amount) - Number(c.amountPaid)),
    0,
  );
  const overdueHomeowners = new Set(overdueCharges.map((c) => c.homeownerId)).size;

  const collectionRate = billed > 0 ? Math.min(100, Math.round((collected / billed) * 100)) : 100;

  // Build Mon..Sun buckets for the chart, filling in zero for days with no payments yet.
  const dayLabels = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
  const chartData = dayLabels.map((day, i) => {
    const bucketStart = new Date(weekStart);
    bucketStart.setDate(bucketStart.getDate() + i);
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setDate(bucketEnd.getDate() + 1);
    const amount = weekPayments
      .filter((p) => p.confirmedAt! >= bucketStart && p.confirmedAt! < bucketEnd)
      .reduce((sum, p) => sum + Number(p.amountPaid), 0);
    return { day, amount };
  });

  const expenseTotalThisMonth = expenseStatusCounts.reduce((sum, g) => sum + g._count, 0);
  const expenseByStatus = (status: string) =>
    expenseStatusCounts.find((g) => g.status === status)?._count ?? 0;
  const pct = (n: number) =>
    expenseTotalThisMonth > 0 ? Math.round((n / expenseTotalThisMonth) * 100) : 0;

  const daysPending = (date: Date) => Math.floor((now.getTime() - date.getTime()) / 86400000);

  return (
    <div className="animate-fadeInUp">
      <div className="mb-6 flex items-end justify-between gap-4 px-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">Dashboard</h1>
        <p className="text-xs text-ink-muted">
          {activeResidents} active resident{activeResidents === 1 ? '' : 's'}
        </p>
      </div>

      <div className="mb-6 px-1">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={<IconCard width={16} height={16} />}
            value={`₱${collected.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            label="Monthly dues collected"
            sublabel={
              trendPct === null
                ? 'No data last month'
                : `${trendPct >= 0 ? '+' : ''}${trendPct.toFixed(1)}% vs last month`
            }
            sublabelClassName={
              trendPct !== null && trendPct < 0 ? 'text-danger' : 'text-brand-strong'
            }
          />
          <StatCard
            icon={<IconBarChart width={16} height={16} />}
            value={`${collectionRate}%`}
            label="Collection rate"
            sublabel={`₱${collected.toLocaleString(undefined, { maximumFractionDigits: 0 })} of ₱${billed.toLocaleString(undefined, { maximumFractionDigits: 0 })} billed`}
          />
          <StatCard
            icon={<IconClock width={16} height={16} />}
            value={`₱${overdueOutstanding.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            label="Overdue dues"
            sublabel={`${overdueHomeowners} homeowner${overdueHomeowners === 1 ? '' : 's'} overdue`}
            sublabelClassName={overdueHomeowners > 0 ? 'text-danger' : 'text-ink-muted'}
          />
          <StatCard
            icon={<IconUser width={16} height={16} />}
            value={`${pendingPayments + pendingExpenses}`}
            label="Needs review"
            sublabel={`${pendingPayments} payment${pendingPayments === 1 ? '' : 's'} · ${pendingExpenses} expense${pendingExpenses === 1 ? '' : 's'}`}
          />
        </div>
      </div>

      {/* Chart row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr_1fr]">
        <div className="ui-card p-5">
          <div className="mb-0.5 flex items-center justify-between">
            <p className="text-base font-semibold text-ink">Dues income</p>
            <IconDots width={16} height={16} className="text-ink-muted" />
          </div>
          <p className="mb-2 text-xs text-ink-muted">Weekly collection overview.</p>
          <DuesIncomeChart data={chartData} />
        </div>

        <div className="ui-card p-5">
          <div className="mb-0.5 flex items-center justify-between">
            <p className="text-base font-semibold text-ink">Report</p>
            <IconDots width={16} height={16} className="text-ink-muted" />
          </div>
          <p className="mb-3 text-xs text-ink-muted">Dues activity this month.</p>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5 rounded-xl bg-surface-muted p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
                <IconCard width={14} height={14} />
              </div>
              <div>
                <p className="text-xs text-ink-muted">Collected</p>
                <p className="text-sm font-semibold text-ink">₱{collected.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-surface-muted p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-soft text-warning">
                <IconClock width={14} height={14} />
              </div>
              <div>
                <p className="text-xs text-ink-muted">Pending review</p>
                <p className="text-sm font-semibold text-ink">{pendingPayments} payments</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-surface-muted p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger-soft text-danger">
                <IconClock width={14} height={14} />
              </div>
              <div>
                <p className="text-xs text-ink-muted">Overdue</p>
                <p className="text-sm font-semibold text-ink">₱{overdueOutstanding.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="ui-card p-5">
          <div className="mb-0.5 flex items-center justify-between">
            <p className="text-base font-semibold text-ink">Approvals</p>
            <IconDots width={16} height={16} className="text-ink-muted" />
          </div>
          <p className="mb-3 text-xs text-ink-muted">Expense requests this month.</p>
          <p className="mb-1 text-3xl font-semibold text-ink">
            {expenseTotalThisMonth}{' '}
            <span className="text-sm font-normal text-ink-muted">requests</span>
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Approved</span>
              <span className="flex items-center gap-1 font-medium text-brand-strong">
                ▲ {pct(expenseByStatus('Approved'))}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Pending</span>
              <span className="font-medium text-ink">{pct(expenseByStatus('Pending'))}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Rejected</span>
              <span className="flex items-center gap-1 font-medium text-danger">
                ▼ {pct(expenseByStatus('Rejected'))}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lists row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="ui-card p-5">
          <div className="mb-1 flex items-center gap-2">
            <IconCard width={16} height={16} className="text-ink-soft" />
            <p className="text-base font-semibold text-ink">Pending payments</p>
          </div>
          <p className="mb-3 text-xs text-ink-muted">Submitted and waiting on verification.</p>

          {pendingPaymentsList.length === 0 && (
            <p className="py-4 text-sm text-ink-muted">Nothing waiting on you — nice.</p>
          )}
          {pendingPaymentsList.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between gap-3 py-3 ${i > 0 ? 'border-t border-line' : ''}`}
            >
              <div>
                <p className="text-sm font-medium text-ink">{p.homeowner.fullName}</p>
                <p className="text-xs text-ink-muted">
                  Unit {p.homeowner.unit} · ₱{Number(p.amountPaid).toFixed(2)}
                </p>
              </div>
              <span className="flex-shrink-0 rounded-md bg-surface-muted px-2 py-1 text-[11px] text-ink-soft">
                {daysPending(p.submittedAt)}d
              </span>
            </div>
          ))}
          <Link href="/admin/payments" className="mt-3 inline-block text-xs font-medium text-brand-strong">
            View all payments →
          </Link>
        </div>

        <div className="ui-card p-5">
          <div className="mb-1 flex items-center gap-2">
            <IconFileText width={16} height={16} className="text-ink-soft" />
            <p className="text-base font-semibold text-ink">Pending expense requests</p>
          </div>
          <p className="mb-3 text-xs text-ink-muted">Awaiting board approval, oldest first.</p>

          {pendingExpensesList.length === 0 && (
            <p className="py-4 text-sm text-ink-muted">Nothing waiting on you — nice.</p>
          )}
          {pendingExpensesList.map((e, i) => {
            const stale = daysPending(e.createdAt) > 7;
            return (
              <div
                key={e.id}
                className={`flex items-center justify-between gap-3 py-3 ${i > 0 ? 'border-t border-line' : ''}`}
              >
                <div>
                  <p className="text-sm font-medium text-ink">{e.description}</p>
                  <p className="text-xs text-ink-muted">
                    {e.position.title} · ₱{Number(e.amount).toFixed(2)}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 rounded-md px-2 py-1 text-[11px] font-medium ${
                    stale ? 'bg-danger-soft text-danger' : 'bg-surface-muted text-ink-soft'
                  }`}
                >
                  {daysPending(e.createdAt)}d
                </span>
              </div>
            );
          })}
          <Link href="/admin/expenses" className="mt-3 inline-block text-xs font-medium text-brand-strong">
            View all expenses →
          </Link>
        </div>
      </div>

      {recentAnnouncements.length > 0 && (
        <div className="mt-5 rounded-2xl border border-line bg-surface p-5">
          <p className="mb-3 text-base font-semibold text-ink">Recent announcements</p>
          {recentAnnouncements.map((a, i) => (
            <div
              key={a.id}
              className={`flex items-center justify-between py-2.5 ${i > 0 ? 'border-t border-line' : ''}`}
            >
              <p className="text-sm text-ink">{a.title}</p>
              <p className="text-xs text-ink-muted">{formatShortDate(a.postedAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
