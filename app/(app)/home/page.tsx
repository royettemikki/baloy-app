import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IconBell, IconCard, IconBallot } from '@/components/Icons';
import { organization } from '@/data/mock';
import { ANNOUNCEMENT_TAGS } from '@/constants/announcementTags';
import { formatShortDate, formatMonthName } from '@/lib/formatDate';
import { getCommitteeMemberships, hasApprovalAuthority } from '@/lib/electionWinners';
import { ensureCurrentMonthDues } from '@/lib/monthlyDues';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const homeownerId = (session?.user as any)?.id as string;
  const account = await prisma.homeowner.findUnique({
    where: { id: homeownerId },
    select: {
      propertyId: true,
      avatarUrl: true,
      fullName: true,
      property: {
        select: {
          unit: true,
          primaryVoterId: true,
          homeowners: { select: { id: true } },
        },
      },
    },
  });
  if (!account) redirect('/login');
  const fullName = account.fullName;
  const firstName = fullName.split(' ')[0];
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  await ensureCurrentMonthDues();
  const residentIds = account.property.homeowners.map((resident) => resident.id);
  const unit = account.property.unit;
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
      prisma.duesCharge.findMany({
        where: { homeownerId: { in: residentIds }, status: { not: 'Paid' } },
      }),
      prisma.election.findFirst({ where: { closesAt: { gt: now } } }).then(async (election) => {
        if (!election) return null;
        const { isVotingOpen } = await import('@/lib/electionWindows');
        return isVotingOpen(election) ? election : null;
      }),
      prisma.payment.findMany({
        where: { homeownerId: { in: residentIds }, status: 'Confirmed' },
        orderBy: { submittedAt: 'desc' },
        take: 4,
      }),
      prisma.vote.findMany({
        where: { propertyId: account.propertyId },
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
    const [positionCount, propertyVotes] = await Promise.all([
      prisma.position.count({ where: { electionId: openElection.id } }),
      prisma.vote.findMany({
        where: { propertyId: account.propertyId, position: { electionId: openElection.id } },
        select: { positionId: true },
      }),
    ]);
    alreadyVoted = new Set(propertyVotes.map((vote) => vote.positionId)).size >= positionCount;
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

  const isPrimaryVoter = account.property.primaryVoterId === homeownerId;
  const needsAction = balance > 0 || (!!openElection && isPrimaryVoter && !alreadyVoted);

  return (
    <div className="space-y-6 pb-4">
      <header className="flex items-center justify-between gap-4 py-1">
        <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
          {account.avatarUrl ? (
            <img
              src={account.avatarUrl}
              alt={`${fullName}'s profile`}
              className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-brand-soft sm:h-12 sm:w-12"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-strong sm:h-12 sm:w-12">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-strong">Resident portal</p>
            <h1 className="truncate text-xl font-semibold tracking-tight text-ink sm:text-2xl">Good day, {firstName}</h1>
            <p className="mt-1 truncate text-xs text-ink-muted sm:text-sm">
              {organization.name}
              {unit ? ` · Unit ${unit}` : ''}
            </p>
          </div>
        </div>
        <Link
          href="/notices"
          aria-label="View notices"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-surface-hover"
        >
          <IconBell width={18} height={18} />
          {totalNotices > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accentwarm ring-2 ring-surface" />
          )}
        </Link>
      </header>

      <section aria-labelledby="overview-heading">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 id="overview-heading" className="text-lg font-semibold">
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/dues"
            className={`ui-card-interactive relative overflow-hidden rounded-[24px] border border-line/60 bg-gradient-to-br p-4 shadow-[0_10px_28px_-20px_var(--brand)] sm:p-5 ${balance > 0 ? 'from-warning-soft to-surface' : 'from-brand-soft to-surface'}`}
          >
            <span aria-hidden="true" className="pointer-events-none absolute -right-7 -top-8 h-28 w-28 rounded-full border-[18px] border-white/30" />
            <span
              className={`mb-4 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${balance > 0 ? 'bg-warning text-white' : 'bg-brand text-on-brand'}`}
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
            className="ui-card-interactive relative overflow-hidden rounded-[24px] border border-accentwarm/10 bg-gradient-to-br from-accentwarm-soft to-surface p-4 shadow-[0_10px_28px_-20px_var(--accent-warm)] sm:p-5"
          >
            <span aria-hidden="true" className="pointer-events-none absolute -right-7 -top-8 h-28 w-28 rounded-full border-[18px] border-white/30" />
            <span className="mb-4 inline-flex rounded-full bg-accentwarm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
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
          {isPrimaryVoter ? (
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
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-4">
              <p className="text-sm font-semibold text-ink">{openElection.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                Only your property&apos;s administrator-designated primary voter can cast its ballot.
                Contact your administrator if you believe you should be designated.
              </p>
            </div>
          )}
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
