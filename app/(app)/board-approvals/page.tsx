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

  const serialized = pending.map((r) => ({
    id: r.id,
    homeownerName: r.homeowner.fullName,
    positionTitle: r.position.title,
    category: r.category,
    description: r.description,
    amount: Number(r.amount),
    justification: r.justification,
  }));

  return (
    <div>
      <AutoRefresh />
      <Link href="/home" className="mb-4 inline-block text-sm font-medium text-brand">
        ← Home
      </Link>
      <h1 className="mb-1 text-xl font-medium">Expense approvals</h1>
      <p className="mb-5 text-sm text-ink-soft">
        Requests waiting on your review as President/Treasurer.
      </p>

      {serialized.length === 0 ? (
        <p className="text-sm text-ink-muted">Nothing waiting right now.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {serialized.map((r) => (
            <ExpenseRequestRow key={r.id} request={r} />
          ))}
        </div>
      )}
    </div>
  );
}
