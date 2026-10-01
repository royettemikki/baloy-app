import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import VoteWizard from '@/components/vote/VoteWizard';
import BallotSummary from '@/components/vote/BallotSummary';
import AutoRefresh from '@/components/AutoRefresh';
import { isVotingOpen, isFilingOpen, isAwaitingVotingStart } from '@/lib/electionWindows';
import { IconBallot } from '@/components/Icons';

export default async function VotePage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string;

  const candidateElections = await prisma.election.findMany({
    where: { OR: [{ closesAt: null }, { closesAt: { gt: new Date() } }] },
    orderBy: { opensAt: 'desc' },
    include: {
      positions: {
        include: { candidates: { include: { slate: true }, orderBy: { ballotNumber: 'asc' } } },
      },
    },
  });

  const votable = candidateElections.find((e) => isVotingOpen(e));
  const stillFiling = candidateElections.find((e) => isFilingOpen(e) && !isVotingOpen(e));
  const awaitingVoting = candidateElections.find(
    (e) => isAwaitingVotingStart(e) && !isVotingOpen(e),
  );

  const quickLinks = (
    <div className="mb-5 flex gap-4">
      <Link href="/board" className="text-xs font-medium text-brand">
        Your board →
      </Link>
      <Link href="/file-candidacy" className="text-xs font-medium text-brand">
        Run for a position →
      </Link>
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

  const myVotes = await prisma.vote.findMany({
    where: { homeownerId, position: { electionId: votable.id } },
    include: { position: true, candidate: true },
  });

  const allVoted = votable.positions.length > 0 && myVotes.length >= votable.positions.length;

  if (allVoted) {
    return (
      <div>
        <AutoRefresh />
        {quickLinks}
        <BallotSummary electionTitle={votable.title} closesAt={closesAt} votes={myVotes} />
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
          election={{ ...votable, closesAt: closesAt.toISOString() }}
          votedPositionIds={myVotes.map((v) => v.positionId)}
        />
      </div>
    </div>
  );
}
