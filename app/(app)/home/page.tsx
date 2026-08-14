import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IconBell, IconCard, IconBallot } from '@/components/Icons';
import { organization } from '@/data/mock';
import { ANNOUNCEMENT_TAGS } from '@/constants/announcementTags';
import { formatShortDate, formatMonthName } from '@/lib/formatDate';

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

  const [latest, totalNotices, openCharges, openElection, payments, votes] = await Promise.all([
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
  const currentMonth = formatMonthName(new Date());

  const activity = [
    ...payments.map((p) => ({
      id: `pay-${p.id}`,
      kind: 'pay' as const,
      text: `You paid ₱${Number(p.amountPaid).toFixed(2)}${p.allocationSummary ? ` — ${p.allocationSummary}` : ''}`,
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
    <div className="animate-fadeInUp">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accentwarm-soft text-sm font-semibold text-accentwarm">
            {initials}
          </div>
          <div>
            <p className="text-sm text-ink-soft">Hi {firstName} 👋</p>
            <p className="text-xs text-ink-muted">
              {organization.name} · Unit {(session?.user as any)?.unit}
            </p>
          </div>
        </div>
        <Link
          href="/notices"
          className="relative flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted"
        >
          <IconBell width={16} height={16} className="text-ink-soft" />
          {totalNotices > 0 && (
            <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
          )}
        </Link>
      </div>

      <div className="mb-3.5 rounded-2xl bg-brand p-[18px]">
        <p className="mb-2.5 text-base font-medium text-white">
          {needsAttention
            ? 'A few things need your attention'
            : `You're all set for ${currentMonth} 🎉`}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {balance === 0 ? (
            <span className="rounded-pill bg-white px-2.5 py-1 text-[11.5px] font-medium text-brand">
              Dues paid
            </span>
          ) : (
            <Link
              href="/dues"
              className="rounded-pill bg-white px-2.5 py-1 text-[11.5px] font-medium text-brand"
            >
              ₱{balance.toFixed(2)} due · Pay now
            </Link>
          )}
          {openElection && !alreadyVoted && (
            <span className="rounded-pill bg-white/20 px-2.5 py-1 text-[11.5px] font-medium text-white">
              Vote open
            </span>
          )}
          <span className="rounded-pill bg-white/20 px-2.5 py-1 text-[11.5px] font-medium text-white">
            {totalNotices} notices
          </span>
        </div>
      </div>

      {openElection && !alreadyVoted && (
        <Link href="/vote">
          <div className="mb-3.5 flex items-center justify-between gap-2.5 rounded-2xl bg-surface-muted px-[18px] py-4">
            <div>
              <p className="mb-0.5 text-sm font-medium">{openElection.title} is open</p>
              <p className="text-xs text-ink-soft">
                Closes {formatShortDate(openElection.closesAt)}
              </p>
            </div>
            <button className="flex-shrink-0 rounded-lg bg-brand px-3.5 py-2 text-xs text-on-brand">
              Vote
            </button>
          </div>
        </Link>
      )}

      <p className="mb-2 text-sm font-medium text-ink-soft">From your community</p>
      {latest.length === 0 && <p className="mb-4 text-sm text-ink-muted">No notices yet.</p>}
      {latest.map((a, i) => (
        <Link
          key={a.id}
          href={`/notices/${a.id}`}
          className={`flex gap-2.5 py-3 ${i > 0 ? 'border-t border-line' : ''}`}
        >
          <div
            className={`flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-lg ${ANNOUNCEMENT_TAGS[a.tag].bg} ${ANNOUNCEMENT_TAGS[a.tag].fg}`}
          >
            {ANNOUNCEMENT_TAGS[a.tag].icon}
          </div>
          <div>
            <p className="mb-0.5 text-[13.5px] font-medium">{a.title}</p>
            <p className="text-xs text-ink-soft">{a.body}</p>
          </div>
        </Link>
      ))}

      {activity.length > 0 && (
        <>
          <p className="mb-2 mt-5 text-sm font-medium text-ink-soft">Recent activity</p>
          {activity.map((item, i) => (
            <div
              key={item.id}
              className={`flex gap-2.5 py-2.5 ${i > 0 ? 'border-t border-line' : ''}`}
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
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
                <p className="text-[12.5px]">{item.text}</p>
                <p className="text-[11px] text-ink-muted">{formatShortDate(item.date)}</p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
