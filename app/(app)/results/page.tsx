import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AutoRefresh from '@/components/AutoRefresh';
import ElectionResultsDashboard from '@/components/vote/ElectionResultsDashboard';

export default async function ResultsPage() {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.id) redirect('/login');

  const now = new Date();
  const [closedElections, liveElection, eligibleVoters] = await Promise.all([
    prisma.election.findMany({
      where: { closesAt: { lt: now } },
      orderBy: { closesAt: 'desc' },
      include: {
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
      select: {
        title: true,
        closesAt: true,
        positions: { select: { votes: { select: { homeownerId: true } } } },
      },
    }),
    prisma.homeowner.count({ where: { passwordHash: { not: null } } }),
  ]);

  const liveVotes = liveElection?.positions.flatMap((position) => position.votes) ?? [];
  const activeElection = liveElection?.closesAt
    ? {
        title: liveElection.title,
        closesAt: liveElection.closesAt.toISOString(),
        ballotCount: new Set(liveVotes.map((vote) => vote.homeownerId)).size,
        eligibleVoters,
      }
    : null;

  const elections = closedElections.map((election) => {
    const allVotes = election.positions.flatMap((position) =>
      position.candidates.flatMap((candidate) => candidate.votes),
    );
    const ballotCount = new Set(allVotes.map((vote) => vote.homeownerId)).size;
    const positions = election.positions.map((position) => {
      const totalVotes = position.candidates.reduce((total, candidate) => total + candidate.votes.length, 0);
      const ranked = position.candidates
        .map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          photoUrl: candidate.photoUrl,
          homeownerAvatarUrl: candidate.homeowner?.avatarUrl ?? null,
          slate: candidate.slate ? { name: candidate.slate.name, color: candidate.slate.color } : null,
          votes: candidate.votes.length,
        }))
        .sort((a, b) => b.votes - a.votes || a.id - b.id);

      return {
        id: position.id,
        title: position.title,
        seats: position.seats,
        totalVotes,
        candidates: ranked.map((candidate, index) => ({
          ...candidate,
          share: totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0,
          isWinner: candidate.votes > 0 && index < position.seats,
        })),
      };
    });

    return {
      id: election.id,
      title: election.title,
      closesAt: election.closesAt!.toISOString(),
      totalVotes: positions.reduce((total, position) => total + position.totalVotes, 0),
      ballotCount,
      eligibleVoters,
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
