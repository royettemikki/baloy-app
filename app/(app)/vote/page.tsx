import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import VoteWizard from '@/components/VoteWizard';

export default async function VotePage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string;

  const election = await prisma.election.findFirst({
    where: { closesAt: { gt: new Date() } },
    orderBy: { opensAt: 'desc' },
    include: { positions: { include: { candidates: true } } },
  });

  if (!election) {
    return (
      <div>
        <h1 className='text-xl font-medium mb-1'>Vote</h1>
        <p className='text-sm text-ink-muted'>No active elections right now.</p>
      </div>
    );
  }

  const myVotes = await prisma.vote.findMany({
    where: { homeownerId, position: { electionId: election.id } },
  });
  const votedPositionIds = myVotes.map((v) => v.positionId);

  return (
    <VoteWizard
      election={{ ...election, closesAt: election.closesAt.toISOString() }}
      votedPositionIds={votedPositionIds}
    />
  );
}
