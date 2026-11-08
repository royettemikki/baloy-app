import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IconBell, IconCard, IconBallot } from '@/components/Icons';
import { organization } from '@/data/mock';
import { ANNOUNCEMENT_TAGS } from '@/constants/announcementTags';
import { formatShortDate, formatMonthName } from '@/lib/formatDate';
import { getCommitteeMemberships, hasApprovalAuthority } from '@/lib/electionWinners';

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
  const unit = (session?.user as any)?.unit;
  const now = new Date();
  const visibleAnnouncementWhere = {
    AND: [
      { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
      { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
    ],
  };

  const [latest, totalNotices, openCharges, openElection, payments, votes, committees, canApprove] =
    await Promise.all([
      prisma.announcement.findMany({
        where: visibleAnnouncementWhere,
        orderBy: [{ pinned: 'desc' }, { postedAt: 'desc' }],
        take: 3,
      }),
      prisma.announcement.count({ where: visibleAnnouncementWhere }),
      prisma.duesCharge.findMany({ where: { homeownerId, status: { not: 'Paid' } } }),
      prisma.election.findFirst({ where: { closesAt: { gt: now } } }).then(async (election) => {
        if (!election) return null;
        const { isVotingOpen } = await import('@/lib/electionWindows');
        return isVotingOpen(election) ? election : null;
      }),
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
      getCommitteeMemberships(homeownerId),
      hasApprovalAuthority(homeownerId),
    ]);

  const balance = openCharges.reduce(
    (sum, charge) => sum + Number(charge.amount) - Number(charge.amountPaid),
    0,
  );
  const pendingApprovals = canApprove
    ? await prisma.expenseRequest.count({
        where: { status: 'Pending', homeownerId: { not: homeownerId } },
      })
    : 0;

  let alreadyVoted = true;
  if (openElection) {
    const [positionCount, myVoteCount] = await Promise.all([
      prisma.position.count({ where: { electionId: openElection.id } }),
      prisma.vote.count({ where: { homeownerId, position: { electionId: openElection.id } } }),
    ]);
    alreadyVoted = myVoteCount >= positionCount;
  }

  const activity = [
    ...payments.map((payment) => ({
      id: `pay-${payment.id}`,
      kind: 'pay' as const,
      text: `Payment of ₱${Number(payment.amountPaid).toFixed(2)}${payment.allocationSummary ? ` · ${payment.allocationSummary}` : ''}`,
      date: payment.submittedAt,
    })),
    ...votes.map((vote) => ({
      id: `vote-${vote.id}`,
      kind: 'vote' as const,
      text: `Voted for ${vote.candidate.name} · ${vote.position.title}`,
      date: vote.castAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 4);

  const needsAction = balance > 0 || (!!openElection && !alreadyVoted);

  return (
    <div className="animate-fadeInUp space-y-2 pb-4">
      <header className="border-line/70 bg-surface/95 fixed inset-x-0 top-0 z-40 mx-auto flex h-[68px] w-full max-w-[calc(64rem+2.5rem)] items-center justify-between border-b px-5 py-3 shadow-sm backdrop-blur-xl sm:top-5 sm:h-[72px] sm:w-[calc(100%-2rem)] sm:max-w-[calc(64rem+3.5rem)] sm:rounded-t-2xl sm:px-7 lg:top-6 lg:h-[72px] lg:w-[calc(100%-3rem)] lg:max-w-[calc(64rem+5rem)] lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-on-brand shadow-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">Good day, {firstName}</h1>
            <p className="truncate text-xs text-ink-muted">
              {organization.name}
              {unit ? ` · Unit ${unit}` : ''}
            </p>
          </div>
        </div>
        <Link
          href="/notices"
          aria-label="View notices"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted"
        >
          <IconBell width={17} height={17} className="text-ink-soft" />
          {totalNotices > 0 && (
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger" />
          )}
        </Link>
      </header>

      <div aria-hidden="true" className="h-[68px] sm:h-[72px]" />

      <section aria-labelledby="overview-heading">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 id="overview-heading" className="text-base font-semibold">
              Your overview
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">The things that may need your attention</p>
          </div>
          {needsAction && (
            <span className="rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-medium text-warning">
              Action needed
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/dues"
            className={`ui-card-interactive relative overflow-hidden rounded-2xl p-4 shadow-sm ${balance > 0 ? 'bg-warning-soft' : 'bg-brand-soft'}`}
          >
            <span
              className={`mb-3 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${balance > 0 ? 'bg-warning text-white' : 'bg-brand text-on-brand'}`}
            >
              {balance > 0 ? 'Payment due' : 'Up to date'}
            </span>
            <p className="text-xs text-ink-muted">Dues balance</p>
            <p className="mt-1 text-lg font-semibold tracking-tight">₱{balance.toFixed(2)}</p>
            <p className={`mt-1 text-xs ${balance > 0 ? 'text-brand-strong' : 'text-ink-muted'}`}>
              {balance > 0 ? 'View and pay balance' : 'No payment due'}
            </p>
          </Link>
          <Link
            href="/notices"
            className="ui-card-interactive rounded-2xl bg-accentwarm-soft p-4 shadow-sm"
          >
            <span className="mb-3 inline-flex rounded-full bg-accentwarm px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              Community
            </span>
            <p className="text-xs text-ink-soft">Notices</p>
            <p className="mt-1 text-lg font-semibold tracking-tight">{totalNotices}</p>
            <p className="mt-1 text-xs font-medium text-accentwarm">
              {totalNotices === 1 ? 'Current notice' : 'Current notices'}
            </p>
          </Link>
        </div>
      </section>

      {openElection && !alreadyVoted && (
        <section aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="mb-3 text-base font-semibold">
            Your next step
          </h2>
          <Link
            href="/vote"
            className="ui-card-interactive flex items-center justify-between gap-4 rounded-2xl bg-brand p-4 text-on-brand shadow-sm"
          >
            <div className="min-w-0">
              <span className="mb-2 inline-flex rounded-full bg-brand px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-on-brand">
                Voting is open
              </span>
              <p className="text-sm font-semibold">{openElection.title}</p>
              <p className="mt-1 text-xs text-on-brand-muted">
                Cast your vote
                {openElection.closesAt ? ` by ${formatShortDate(openElection.closesAt)}` : ''}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-on-brand-surface px-4 py-2 text-xs font-semibold text-brand">
              Vote
            </span>
          </Link>
        </section>
      )}

      {(committees.length > 0 || canApprove) && (
        <section
          aria-labelledby="board-heading"
          className="rounded-2xl bg-purple-soft p-4 shadow-sm"
        >
          <div className="mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              For board members
            </p>
            <h2 id="board-heading" className="mt-1 text-base font-semibold">
              Board duties
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">
              Board tools and requests are grouped here.
            </p>
          </div>
          <div className="space-y-2">
            {canApprove && (
              <Link
                href="/board-approvals"
                className="ui-card-interactive flex items-center justify-between gap-3 rounded-xl bg-surface p-3.5 shadow-sm"
              >
                <div>
                  <p className="text-sm font-semibold text-purple">Expense approvals</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {pendingApprovals > 0
                      ? `${pendingApprovals} request${pendingApprovals === 1 ? '' : 's'} awaiting review`
                      : 'No requests waiting for review'}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${pendingApprovals > 0 ? 'bg-purple text-white' : 'bg-purple-soft text-purple'}`}
                >
                  {pendingApprovals > 0 ? 'Review' : 'Open'}
                </span>
              </Link>
            )}
            {committees.length > 0 && (
              <Link
                href="/expense-requests"
                className="ui-card-interactive flex items-center justify-between gap-3 rounded-xl bg-surface p-3.5 shadow-sm"
              >
                <div>
                  <p className="text-sm font-medium">Committee expenses</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    Submit and track a committee request
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-strong">
                  Manage
                </span>
              </Link>
            )}
          </div>
        </section>
      )}

      <section aria-labelledby="notices-heading">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h2 id="notices-heading" className="text-base font-semibold">
              From your community
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">Latest notices and updates</p>
          </div>
          <Link href="/notices" className="text-xs font-medium text-brand-strong">
            See all
          </Link>
        </div>
        {latest.length === 0 ? (
          <div className="rounded-2xl bg-surface-muted p-4 text-sm text-ink-muted">
            No current notices.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-surface-muted shadow-sm">
            {latest.map((announcement, index) => (
              <Link
                key={announcement.id}
                href={`/notices/${announcement.id}`}
                className={`flex gap-3 p-3.5 transition-colors hover:bg-surface-hover ${index > 0 ? 'border-line/50 border-t' : ''}`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ANNOUNCEMENT_TAGS[announcement.tag].bg} ${ANNOUNCEMENT_TAGS[announcement.tag].fg}`}
                >
                  {ANNOUNCEMENT_TAGS[announcement.tag].icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{announcement.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">
                    {announcement.body}
                  </p>
                  <p className="mt-1.5 text-[10px] text-ink-muted">
                    {formatShortDate(announcement.postedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {activity.length > 0 && (
        <section aria-labelledby="activity-heading">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 id="activity-heading" className="text-base font-semibold">
                Recent activity
              </h2>
              <p className="mt-0.5 text-xs text-ink-muted">Your latest payments and votes</p>
            </div>
            <Link href="/dues/history" className="text-xs font-medium text-brand-strong">
              Payment history
            </Link>
          </div>
          <div className="rounded-2xl bg-surface-muted px-3.5 shadow-sm">
            {activity.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 py-3 ${index > 0 ? 'border-line/50 border-t' : ''}`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.kind === 'pay' ? 'bg-brand-soft text-brand-strong' : 'bg-purple-soft text-purple'}`}
                >
                  {item.kind === 'pay' ? (
                    <IconCard width={15} height={15} />
                  ) : (
                    <IconBallot width={15} height={15} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium">{item.text}</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">{formatShortDate(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
