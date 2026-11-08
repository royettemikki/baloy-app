import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasApprovalAuthority } from '@/lib/electionWinners';
import AutoRefresh from '@/components/AutoRefresh';
import ExpenseRequestRow from '@/components/admin/expenses/ExpenseRequestRow';

export default async function BoardApprovalsPage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string | undefined;
  if (!homeownerId) redirect('/login');

  const authorized = await hasApprovalAuthority(homeownerId);
  if (!authorized) redirect('/home');

  const pending = await prisma.expenseRequest.findMany({
    where: { status: 'Pending', homeownerId: { not: homeownerId } },
    include: { homeowner: true, position: true },
    orderBy: { createdAt: 'asc' },
  });

  const requests = pending.map((request) => ({
    id: request.id,
    homeownerName: request.homeowner.fullName,
    positionTitle: request.position.title,
    category: request.category,
    description: request.description,
    amount: Number(request.amount),
    justification: request.justification,
  }));

  return (
    <div className="animate-fadeInUp space-y-5 pb-4">
      <AutoRefresh />
      <div>
        <Link href="/home" className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition hover:text-brand-strong">
          <span aria-hidden="true">←</span> Dashboard
        </Link>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Board duties</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Expense approvals</h1>
            <p className="mt-1 text-sm text-ink-soft">Review committee expense requests assigned to your board role.</p>
          </div>
          <span className="shrink-0 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-semibold text-ink-soft">
            {requests.length} pending
          </span>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand-strong">✓</div>
          <h2 className="text-sm font-semibold">You’re all caught up</h2>
          <p className="mt-1 text-xs text-ink-muted">New requests that need your review will appear here.</p>
        </div>
      ) : (
        <section aria-label="Pending expense requests" className="flex flex-col gap-3">
          {requests.map((request) => <ExpenseRequestRow key={request.id} request={request} />)}
        </section>
      )}
    </div>
  );
}
