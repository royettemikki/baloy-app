import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import VoteWizard from '@/components/vote/VoteWizard';
import BallotSummary from '@/components/vote/BallotSummary';
import BallotComplete from '@/components/vote/BallotComplete';
import VotingEntitlementPanel from '@/components/vote/VotingEntitlementPanel';
import AutoRefresh from '@/components/AutoRefresh';
import { isVotingOpen, isFilingOpen, isAwaitingVotingStart } from '@/lib/electionWindows';
import { IconBallot, IconBarChart, IconHome } from '@/components/Icons';

export default async function VotePage({ searchParams }: { searchParams?: { voterId?: string } }) {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string | undefined;
  if (!homeownerId) redirect('/login');

  const now = new Date();
  const [candidateElections, publishedResultsCount] = await Promise.all([
    prisma.election.findMany({
      where: { OR: [{ closesAt: null }, { closesAt: { gt: now } }] },
      orderBy: { opensAt: 'desc' },
      include: {
        positions: {
          include: {
            candidates: {
              include: { slate: true, homeowner: { select: { avatarUrl: true } } },
              orderBy: { ballotNumber: 'asc' },
            },
          },
        },
      },
    }),
    prisma.election.count({ where: { closesAt: { lt: now } } }),
  ]);

  const votable = candidateElections.find((e) => isVotingOpen(e));
  const stillFiling = candidateElections.find((e) => isFilingOpen(e) && !isVotingOpen(e));
  const awaitingVoting = candidateElections.find(
    (e) => isAwaitingVotingStart(e) && !isVotingOpen(e),
  );

  const quickLinks = (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Link
        href="/board"
        className="hover:border-brand/30 inline-flex min-h-9 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-semibold text-ink-soft shadow-sm transition-colors hover:text-brand-strong"
      >
        <IconHome width={15} height={15} />
        Your board
      </Link>
      {(publishedResultsCount > 0 || votable) && (
        <Link
          href="/results"
          className="hover:border-brand/30 inline-flex min-h-9 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-semibold text-ink-soft shadow-sm transition-colors hover:text-brand-strong"
        >
          <IconBarChart width={15} height={15} />
          Election results
        </Link>
      )}
      {stillFiling && (
        <Link
          href="/file-candidacy"
          className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-brand px-3.5 text-xs font-semibold text-on-brand shadow-sm transition-colors hover:bg-brand-strong"
        >
          <IconBallot width={15} height={15} />
          Run for a position
        </Link>
      )}
    </div>
  );

  if (!votable || !votable.closesAt) {
    return (
      <div>
        <AutoRefresh />
        {quickLinks}
        <div className="flex animate-fadeInUp flex-col items-center px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-soft">
            <IconBallot width={24} height={24} className="text-purple" />
          </div>
          <p className="mb-1.5 text-base font-medium">No election right now</p>
          <p className="max-w-[240px] text-sm leading-relaxed text-ink-soft">
            {stillFiling
              ? `Candidate filing for ${stillFiling.title} is still open. Voting hasn't started yet.`
              : awaitingVoting
                ? `Filing has closed for ${awaitingVoting.title}. Voting will begin once the board opens it.`
                : "When the board opens a new election, it'll show up here."}
          </p>
        </div>
      </div>
    );
  }

  const closesAt = votable.closesAt;
  const electionWithCandidateAvatars = {
    ...votable,
    positions: votable.positions.map((position) => ({
      ...position,
      candidates: position.candidates.map((candidate) => ({
        ...candidate,
        homeownerAvatarUrl: candidate.homeowner?.avatarUrl ?? null,
      })),
    })),
    closesAt: closesAt.toISOString(),
  };

  const voters = await prisma.electionVoter.findMany({
    where: {
      electionId: votable.id,
      OR: [{ homeownerId }, { proxyId: homeownerId }],
    },
    include: {
      homeowner: { select: { id: true, fullName: true, propertyId: true } },
      proxy: { select: { id: true, fullName: true } },
      castBy: { select: { fullName: true } },
      ballot: {
        include: {
          votes: {
            include: {
              position: true,
              candidate: { include: { homeowner: { select: { avatarUrl: true } } } },
            },
            orderBy: [{ castAt: 'asc' }, { id: 'asc' }],
          },
        },
      },
    },
    orderBy: { homeowner: { fullName: 'asc' } },
  });

  const requestedVoterId = Number(searchParams?.voterId);
  const selectedVoter =
    voters.find((voter) => voter.id === requestedVoterId) ??
    (voters.length === 1 ? voters[0] : null);
  const activeAccounts =
    selectedVoter?.homeownerId === homeownerId
      ? await prisma.homeowner.findMany({
          where: {
            id: { not: homeownerId },
            passwordHash: { not: null },
            propertyMemberships: {
              some: { propertyId: selectedVoter.homeowner.propertyId },
            },
          },
          select: { id: true, fullName: true },
          orderBy: { fullName: 'asc' },
        })
      : [];

  return (
    <div>
      <AutoRefresh />
      {quickLinks}
      {!selectedVoter ? (
        <div className="mx-auto max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-ink">
            {voters.length > 1 ? 'Choose a voting entitlement' : 'No voting entitlement'}
          </h1>
          {voters.length > 1 ? (
            <div className="mt-4 space-y-2">
              {voters.map((voter) => (
                <Link
                  key={voter.id}
                  href={`/vote?voterId=${voter.id}`}
                  className="flex items-center justify-between rounded-xl border border-line p-3 text-sm hover:bg-surface-muted"
                >
                  <span>{voter.homeowner.fullName}</span>
                  <span className="text-xs text-ink-muted">
                    {voter.ballot
                      ? 'Already voted'
                      : voter.proxyId === homeownerId
                        ? 'Proxy ballot'
                        : voter.proxyId
                          ? 'Proxy assigned'
                          : 'Ready to vote'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              You are not listed as a primary owner or an authorized proxy for this election.
              Contact your community administrator if you believe this is incorrect.
            </p>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-2xl">
          {voters.length > 1 && (
            <Link href="/vote" className="mb-3 inline-block text-xs font-medium text-brand-strong">
              ← Choose another voter
            </Link>
          )}
          {selectedVoter.ballot ? (
            selectedVoter.ballot.votes.length > 0 ? (
              <BallotSummary
                electionTitle={votable.title}
                closesAt={closesAt}
                votes={selectedVoter.ballot.votes.map((vote) => ({
                  ...vote,
                  castAt: selectedVoter.castAt!,
                  candidate: {
                    ...vote.candidate,
                    homeownerAvatarUrl: vote.candidate.homeowner?.avatarUrl ?? null,
                  },
                }))}
              />
            ) : (
              <BallotComplete alreadyDone />
            )
          ) : (
            <>
              <div className="mb-4 rounded-2xl border border-line bg-surface p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                  {selectedVoter.homeownerId === homeownerId
                    ? 'Your voting entitlement'
                    : 'Voting on behalf of'}
                </p>
                <p className="mt-1 text-base font-semibold text-ink">
                  {selectedVoter.homeowner.fullName}
                </p>
              </div>
              <VotingEntitlementPanel
                election={electionWithCandidateAvatars}
                voterId={selectedVoter.id}
                activeAccounts={activeAccounts}
                currentProxyId={selectedVoter.proxyId}
                canAssignProxy={selectedVoter.homeownerId === homeownerId}
                proxyName={selectedVoter.proxy?.fullName ?? null}
              />
            </>
          )}
          {selectedVoter.ballot && selectedVoter.castBy && (
            <p className="mt-3 text-center text-xs text-ink-muted">
              Ballot submitted by {selectedVoter.castBy.fullName}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
