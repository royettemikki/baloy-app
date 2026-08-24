import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCommitteeMemberships } from '@/lib/electionWinners';
import ExpenseRequestForm from '@/components/ExpenseRequestForm';
import AutoRefresh from '@/components/AutoRefresh';

export default async function ExpenseRequestsPage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string;

  const [memberships, myRequests] = await Promise.all([
    getCommitteeMemberships(homeownerId),
    prisma.expenseRequest.findMany({
      where: { homeownerId },
      include: { position: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const serializedRequests = myRequests.map((r) => ({
    id: r.id,
    positionTitle: r.position.title,
    description: r.description,
    amount: Number(r.amount),
    status: r.status,
    rejectionReason: r.rejectionReason,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div>
      <Link href="/home" className="mb-4 inline-block text-sm font-medium text-brand">
        ← Home
      </Link>
      <h1 className="mb-1 text-xl font-medium">Request an expense</h1>

      {memberships.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">
          You're not currently an elected member of any committee, so you can't submit expense
          requests.
        </p>
      ) : (
        <>
          <p className="mb-5 text-sm text-ink-soft">
            Submitting on behalf of: {memberships.map((m) => m.positionTitle).join(', ')}
          </p>
          <ExpenseRequestForm memberships={memberships} />
        </>
      )}
      <AutoRefresh />
      {serializedRequests.length > 0 && (
        <>
          <p className="mb-2 mt-6 text-sm font-medium text-ink-soft">Your requests</p>
          {serializedRequests.map((r, i) => (
            <div key={r.id} className={`py-2.5 ${i > 0 ? 'border-t border-line' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-0.5 text-[13.5px] font-medium">{r.description}</p>
                  <p className="text-[11.5px] text-ink-muted">{r.positionTitle}</p>
                </div>
                <div className="text-right">
                  <p className="mb-0.5 text-[13.5px]">₱{r.amount.toFixed(2)}</p>
                  <span
                    className={`rounded-pill px-2 py-0.5 text-[10.5px] font-medium ${
                      r.status === 'Approved'
                        ? 'bg-brand-soft text-brand-strong'
                        : r.status === 'Rejected'
                          ? 'bg-danger-soft text-danger'
                          : 'bg-warning-soft text-warning'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              </div>
              {r.status === 'Rejected' && r.rejectionReason && (
                <p className="mt-1.5 text-xs text-danger">{r.rejectionReason}</p>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
