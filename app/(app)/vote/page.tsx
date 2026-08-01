import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import VoteWizard from '@/components/VoteWizard';
import BallotSummary from '@/components/BallotSummary';
import { IconBallot } from '@/components/Icons';

export default async function VotePage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string;

  const election = await prisma.election.findFirst({
    where: { closesAt: { gt: new Date() } },
    orderBy: { opensAt: 'desc' },
    include: {
      positions: {
        include: {
          candidates: {
            include: { slate: true },
            orderBy: { ballotNumber: 'asc' },
          },
        },
      },
    },
  });

  if (!election) {
    return (
      <div className='flex flex-col items-center text-center px-6 py-16 animate-fadeInUp'>
        <div className='w-14 h-14 rounded-full bg-purple-soft flex items-center justify-center mb-4'>
          <IconBallot width={24} height={24} className='text-purple' />
        </div>
        <p className='text-base font-medium mb-1.5'>No election right now</p>
        <p className='text-sm text-ink-soft leading-relaxed max-w-[240px]'>
          When the board opens a new election, it'll show up here — and you'll
          see a reminder on your Home screen too.
        </p>
      </div>
    );
  }

  const myVotes = await prisma.vote.findMany({
    where: { homeownerId, position: { electionId: election.id } },
    include: { position: true, candidate: true },
  });

  const allVoted =
    election.positions.length > 0 &&
    myVotes.length >= election.positions.length;

  if (allVoted) {
    return (
      <BallotSummary
        electionTitle={election.title}
        closesAt={election.closesAt}
        votes={myVotes}
      />
    );
  }

  return (
    <VoteWizard
      election={{ ...election, closesAt: election.closesAt.toISOString() }}
      votedPositionIds={myVotes.map((v) => v.positionId)}
    />
  );
}
