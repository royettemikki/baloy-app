import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  IconTool,
  IconParty,
  IconShield,
  IconFileText,
  IconBell,
  IconCard,
  IconBallot,
} from '@/components/Icons';
import { organization } from '@/data/mock';

const TAG_ICON: Record<string, JSX.Element> = {
  Maintenance: <IconTool width={16} height={16} />,
  Event: <IconParty width={16} height={16} />,
  Safety: <IconShield width={16} height={16} />,
  Board: <IconFileText width={16} height={16} />,
};

const TAG_STYLE: Record<string, { bg: string; fg: string }> = {
  Maintenance: { bg: 'bg-brand-soft', fg: 'text-brand-strong' },
  Event: { bg: 'bg-warning-soft', fg: 'text-warning' },
  Safety: { bg: 'bg-danger-soft', fg: 'text-danger' },
  Board: { bg: 'bg-surface-muted', fg: 'text-ink-soft' },
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const fullName = session?.user?.name ?? 'Resident';
  const firstName = fullName.split(' ')[0];
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const homeownerId = (session?.user as any)?.id as string;

  const [latest, totalNotices, openCharges, openElection, payments, votes] =
    await Promise.all([
      prisma.announcement.findMany({
        orderBy: [{ pinned: 'desc' }, { postedAt: 'desc' }],
        take: 3,
      }),
      prisma.announcement.count(),
      prisma.duesCharge.findMany({
        where: { homeownerId, status: { not: 'Paid' } },
      }),
      prisma.election.findFirst({ where: { closesAt: { gt: new Date() } } }),
      prisma.payment.findMany({
        where: { homeownerId, status: 'Confirmed' },
        include: { duesCharge: true },
        orderBy: { submittedAt: 'desc' },
        take: 4,
      }),
      prisma.vote.findMany({
        where: { homeownerId },
        include: { position: true, candidate: true },
        orderBy: { castAt: 'desc' },
        take: 4,
      }),
    ]);

  const balance = openCharges.reduce((sum, c) => sum + Number(c.amount), 0);

  let alreadyVoted = true;
  if (openElection) {
    const [positionCount, myVoteCount] = await Promise.all([
      prisma.position.count({ where: { electionId: openElection.id } }),
      prisma.vote.count({
        where: { homeownerId, position: { electionId: openElection.id } },
      }),
    ]);
    alreadyVoted = myVoteCount >= positionCount;
  }

  const needsAttention = balance > 0 || (!!openElection && !alreadyVoted);
  const currentMonth = new Date().toLocaleDateString(undefined, {
    month: 'long',
  });

  const activity = [
    ...payments.map((p) => ({
      id: `pay-${p.id}`,
      kind: 'pay' as const,
      text: `You paid ₱${Number(p.amountPaid).toFixed(2)} for ${p.duesCharge.description}`,
      date: p.submittedAt,
    })),
    ...votes.map((v) => ({
      id: `vote-${v.id}`,
      kind: 'vote' as const,
      text: `You voted for ${v.candidate.name} — ${v.position.title}`,
      date: v.castAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 4);

  return (
    <div className='animate-fadeInUp'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2.5'>
          <div className='w-9 h-9 rounded-full bg-accentwarm-soft flex items-center justify-center text-sm font-semibold text-accentwarm'>
            {initials}
          </div>
          <div>
            <p className='text-sm text-ink-soft'>Hi {firstName} 👋</p>
            <p className='text-xs text-ink-muted'>
              {organization.name} · Unit {(session?.user as any)?.unit}
            </p>
          </div>
        </div>
        <Link
          href='/notices'
          className='w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center relative'
        >
          <IconBell width={16} height={16} className='text-ink-soft' />
          {totalNotices > 0 && (
            <span className='absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-danger' />
          )}
        </Link>
      </div>

      <div className='bg-brand rounded-2xl p-[18px] mb-3.5'>
        <p className='text-white text-base font-medium mb-2.5'>
          {needsAttention
            ? 'A few things need your attention'
            : `You're all set for ${currentMonth} 🎉`}
        </p>
        <div className='flex gap-1.5 flex-wrap'>
          {balance === 0 ? (
            <span className='text-[11.5px] font-medium text-brand bg-white px-2.5 py-1 rounded-pill'>
              Dues paid
            </span>
          ) : (
            <Link
              href='/dues'
              className='text-[11.5px] font-medium text-brand bg-white px-2.5 py-1 rounded-pill'
            >
              ₱{balance.toFixed(2)} due · Pay now
            </Link>
          )}
          {openElection && !alreadyVoted && (
            <span className='text-[11.5px] font-medium text-white bg-white/20 px-2.5 py-1 rounded-pill'>
              Vote open
            </span>
          )}
          <span className='text-[11.5px] font-medium text-white bg-white/20 px-2.5 py-1 rounded-pill'>
            {totalNotices} notices
          </span>
        </div>
      </div>

      {openElection && !alreadyVoted && (
        <Link href='/vote'>
          <div className='bg-surface-muted rounded-2xl px-[18px] py-4 mb-3.5 flex items-center justify-between gap-2.5'>
            <div>
              <p className='text-sm font-medium mb-0.5'>
                {openElection.title} is open
              </p>
              <p className='text-xs text-ink-soft'>
                Closes{' '}
                {new Date(openElection.closesAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <button className='bg-brand text-on-brand text-xs px-3.5 py-2 rounded-lg flex-shrink-0'>
              Vote
            </button>
          </div>
        </Link>
      )}

      <p className='text-sm font-medium text-ink-soft mb-2'>
        From your community
      </p>
      {latest.length === 0 && (
        <p className='text-sm text-ink-muted mb-4'>No notices yet.</p>
      )}
      {latest.map((a, i) => (
        <Link
          key={a.id}
          href={`/notices/${a.id}`}
          className={`flex gap-2.5 py-3 ${i > 0 ? 'border-t border-line' : ''}`}
        >
          <div
            className={`w-[34px] h-[34px] rounded-lg flex items-center justify-center flex-shrink-0 ${TAG_STYLE[a.tag].bg} ${TAG_STYLE[a.tag].fg}`}
          >
            {TAG_ICON[a.tag]}
          </div>
          <div>
            <p className='text-[13.5px] font-medium mb-0.5'>{a.title}</p>
            <p className='text-xs text-ink-soft'>{a.body}</p>
          </div>
        </Link>
      ))}

      {activity.length > 0 && (
        <>
          <p className='text-sm font-medium text-ink-soft mb-2 mt-5'>
            Recent activity
          </p>
          {activity.map((item, i) => (
            <div
              key={item.id}
              className={`flex gap-2.5 py-2.5 ${i > 0 ? 'border-t border-line' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.kind === 'pay'
                    ? 'bg-brand-soft text-brand-strong'
                    : 'bg-purple-soft text-purple'
                }`}
              >
                {item.kind === 'pay' ? (
                  <IconCard width={14} height={14} />
                ) : (
                  <IconBallot width={14} height={14} />
                )}
              </div>
              <div>
                <p className='text-[12.5px]'>{item.text}</p>
                <p className='text-[11px] text-ink-muted'>
                  {item.date.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
