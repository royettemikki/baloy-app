import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AutoRefresh from '@/components/AutoRefresh';
import PositionFilingCard from '@/components/PositionFilingCard';
import { IconBallot } from '@/components/Icons';
import { isFilingOpen } from '@/lib/electionWindows';

export default async function FileCandidacyPage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string;

  const [candidatePositions, myFilings] = await Promise.all([
    prisma.position.findMany({
      where: { election: { OR: [{ closesAt: null }, { closesAt: { gt: new Date() } }] } },
      include: { election: true },
    }),
    prisma.candidacyFiling.findMany({
      where: { homeownerId },
      include: { position: { include: { election: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const openPositions = candidatePositions.filter((p) => isFilingOpen(p.election));
  const filingByPositionId = new Map(myFilings.map((f) => [f.positionId, f]));
  const pastFilings = myFilings.filter((f) => {
    const closesAt = f.position.election.closesAt;
    return closesAt !== null && closesAt < new Date();
  });

  return (
    <div>
      <AutoRefresh />
      <Link href="/home" className="mb-4 inline-block text-sm font-medium text-brand">
        ← Home
      </Link>

      <div className="mb-1 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-soft">
          <IconBallot width={18} height={18} className="text-purple" />
        </div>
        <h1 className="text-xl font-medium">Run for a position</h1>
      </div>
      <p className="mb-5 text-sm text-ink-soft">
        File to run for an open position — the board reviews every filing before it appears on the
        ballot.
      </p>

      {openPositions.length === 0 ? (
        <p className="text-sm text-ink-muted">No positions are open for filing right now.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {openPositions.map((p) => {
            const filing = filingByPositionId.get(p.id);
            return (
              <PositionFilingCard
                key={p.id}
                positionId={p.id}
                positionTitle={p.title}
                electionTitle={p.election.title}
                status={filing?.status ?? null}
                rejectionReason={filing?.rejectionReason ?? null}
              />
            );
          })}
        </div>
      )}

      {pastFilings.length > 0 && (
        <>
          <p className="mb-2 mt-6 text-sm font-medium text-ink-soft">Past filings</p>
          {pastFilings.map((f, i) => (
            <div key={f.id} className={`py-2.5 ${i > 0 ? 'border-t border-line' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13.5px] font-medium">{f.position.title}</p>
                  <p className="text-xs text-ink-muted">{f.position.election.title}</p>
                </div>
                <span
                  className={`rounded-pill px-2 py-0.5 text-[10.5px] font-medium ${
                    f.status === 'Approved'
                      ? 'bg-brand-soft text-brand-strong'
                      : f.status === 'Rejected'
                        ? 'bg-danger-soft text-danger'
                        : 'bg-warning-soft text-warning'
                  }`}
                >
                  {f.status}
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
