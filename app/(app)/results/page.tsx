import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AutoRefresh from '@/components/AutoRefresh';
import ElectionResultsDashboard from '@/components/vote/ElectionResultsDashboard';
import { getWinningCandidateIds } from '@/lib/electionWinners';

export default async function ResultsPage() {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.id) redirect('/login');

  const now = new Date();
  const [closedElections, liveElection, eligibleVoterProperties] = await Promise.all([
    prisma.election.findMany({
      where: { closesAt: { lt: now } },
      orderBy: { closesAt: 'desc' },
      include: {
        voterRoll: { select: { id: true, castAt: true } },
        positions: {
          include: {
            candidates: {
              include: {
                slate: true,
                homeowner: { select: { avatarUrl: true } },
                votes: { select: { homeownerId: true } },
              },
            },
          },
        },
      },
    }),
    prisma.election.findFirst({
      where: { votingOpensAt: { lte: now }, closesAt: { gt: now } },
      orderBy: { opensAt: 'desc' },
      select: { title: true, closesAt: true, voterRoll: { select: { castAt: true } } },
    }),
    prisma.property.findMany({
      where: {
        primaryVoterId: { not: null },
        primaryVoter: { passwordHash: { not: null } },
      },
      select: { primaryVoterId: true },
    }),
  ]);

  const eligibleVoters = new Set(
    eligibleVoterProperties.flatMap(({ primaryVoterId }) =>
      primaryVoterId ? [primaryVoterId] : [],
    ),
  ).size;
  const activeElection = liveElection?.closesAt
    ? {
        title: liveElection.title,
        closesAt: liveElection.closesAt.toISOString(),
        ballotCount: liveElection.voterRoll.filter((voter) => voter.castAt !== null).length,
        eligibleVoters: liveElection.voterRoll.length,
      }
    : null;

  const elections = closedElections.map((election) => {
    const allVotes = election.positions.flatMap((position) =>
      position.candidates.flatMap((candidate) => candidate.votes),
    );
    const ballotCount = election.voterRoll.length
      ? election.voterRoll.filter((voter) => voter.castAt !== null).length
      : new Set(allVotes.map((vote) => vote.homeownerId)).size;
    const positions = election.positions.map((position) => {
      const totalVotes = position.candidates.reduce(
        (total, candidate) => total + candidate.votes.length,
        0,
      );
      const ranked = position.candidates
        .map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          photoUrl: candidate.photoUrl,
          homeownerAvatarUrl: candidate.homeowner?.avatarUrl ?? null,
          slate: candidate.slate
            ? { name: candidate.slate.name, color: candidate.slate.color }
            : null,
          votes: candidate.votes.length,
        }))
        .sort((a, b) => b.votes - a.votes || a.id - b.id);
      const winnerIds = new Set(getWinningCandidateIds(ranked, position.seats));
      const cutoffVotes = ranked[position.seats - 1]?.votes;
      const hasUnresolvedTie =
        cutoffVotes !== undefined &&
        cutoffVotes > 0 &&
        ranked.filter((candidate) => candidate.votes === cutoffVotes).length >
          position.seats - ranked.filter((candidate) => candidate.votes > cutoffVotes).length;

      return {
        id: position.id,
        title: position.title,
        seats: position.seats,
        totalVotes,
        hasUnresolvedTie,
        candidates: ranked.map((candidate) => ({
          ...candidate,
          share: totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0,
          isWinner: winnerIds.has(candidate.id),
        })),
      };
    });

    return {
      id: election.id,
      title: election.title,
      closesAt: election.closesAt!.toISOString(),
      totalVotes: positions.reduce((total, position) => total + position.totalVotes, 0),
      ballotCount,
      eligibleVoters: election.voterRoll.length || eligibleVoters,
      positions,
    };
  });

  return (
    <div>
      <AutoRefresh intervalMs={120_000} />
      <ElectionResultsDashboard elections={elections} activeElection={activeElection} />
    </div>
  );
}
