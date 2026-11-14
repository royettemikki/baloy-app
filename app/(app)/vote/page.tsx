import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import VoteWizard from '@/components/vote/VoteWizard';
import BallotSummary from '@/components/vote/BallotSummary';
import AutoRefresh from '@/components/AutoRefresh';
import { isVotingOpen, isFilingOpen, isAwaitingVotingStart } from '@/lib/electionWindows';
import { IconBallot, IconBarChart, IconHome } from '@/components/Icons';

export default async function VotePage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string;

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

  const homeowner = await prisma.homeowner.findUnique({
    where: { id: homeownerId },
    select: {
      propertyId: true,
      property: { select: { primaryVoterId: true, unit: true } },
    },
  });
  if (homeowner?.property.primaryVoterId !== homeownerId) {
    return (
      <div>
        <AutoRefresh />
        {quickLinks}
        <div className="mx-auto max-w-lg rounded-2xl border border-line bg-surface p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-soft">
            <IconBallot width={21} height={21} className="text-purple" />
          </div>
          <h1 className="text-lg font-semibold text-ink">
            Voting access is assigned to your property&apos;s primary voter
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            An administrator must designate the resident authorized to vote for{' '}
            {homeowner?.property.unit ?? 'your property'}. Contact your community administrator if
            this should be you.
          </p>
        </div>
      </div>
    );
  }

  const myVotes = await prisma.vote.findMany({
    where: { propertyId: homeowner.propertyId, position: { electionId: votable.id } },
    include: {
      position: true,
      candidate: { include: { homeowner: { select: { avatarUrl: true } } } },
    },
    orderBy: [{ castAt: 'asc' }, { id: 'asc' }],
  });
  const propertyVotes = myVotes.map((vote) => ({
    ...vote,
    candidate: {
      ...vote.candidate,
      homeownerAvatarUrl: vote.candidate.homeowner?.avatarUrl ?? null,
    },
  }));
  const votedPositionIds = [...new Set(propertyVotes.map((vote) => vote.positionId))];

  const allVoted =
    votable.positions.length > 0 && votedPositionIds.length >= votable.positions.length;

  if (allVoted) {
    return (
      <div>
        <AutoRefresh />
        {quickLinks}
        <BallotSummary electionTitle={votable.title} closesAt={closesAt} votes={propertyVotes} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0">
        <AutoRefresh />
        {quickLinks}
      </div>
      <div className="min-h-0 flex-1">
        <VoteWizard
          election={electionWithCandidateAvatars}
          votedPositionIds={votedPositionIds}
        />
      </div>
    </div>
  );
}
