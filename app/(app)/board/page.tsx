import Link from 'next/link';
import { getCurrentOfficeholders, Officeholder } from '@/lib/electionWinners';
import { IconBallot, IconBarChart, IconCheck, IconUser } from '@/components/Icons';

const OFFICER_TITLES = ['President', 'Vice President', 'Treasurer', 'Secretary'];

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function MemberAvatar({ name, featured = false }: { name: string; featured?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${
        featured
          ? 'h-14 w-14 border border-white/20 bg-white/15 text-base text-white'
          : 'h-11 w-11 bg-brand-soft text-sm text-brand-strong'
      }`}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}

function BoardMemberCard({
  holder,
  featured = false,
}: {
  holder: Officeholder;
  featured?: boolean;
}) {
  return (
    <article
      className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3.5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 ${
        featured
          ? 'border-brand/20 bg-brand text-on-brand sm:col-span-2 sm:p-5'
          : 'border-line bg-surface'
      }`}
    >
      <MemberAvatar name={holder.fullName} featured={featured} />
      <div className="min-w-0 flex-1">
        <p
          className={`truncate font-semibold ${featured ? 'text-base text-white' : 'text-sm text-ink'}`}
        >
          {holder.fullName}
        </p>
        <p className={`mt-0.5 text-xs ${featured ? 'text-white/75' : 'text-ink-muted'}`}>
          Unit {holder.unit}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
          featured ? 'bg-white/15 text-white' : 'bg-surface-muted text-ink-soft'
        }`}
      >
        {holder.positionTitle}
      </span>
      {featured && (
        <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 sm:flex">
          <IconCheck width={17} height={17} />
        </span>
      )}
    </article>
  );
}

export default async function BoardPage() {
  const officeholders = await getCurrentOfficeholders();

  const groupsMap = new Map<
    number,
    { electionTitle: string; electionYear: number; holders: Officeholder[] }
  >();
  for (const h of officeholders) {
    if (!groupsMap.has(h.electionId)) {
      groupsMap.set(h.electionId, {
        electionTitle: h.electionTitle,
        electionYear: h.electionYear,
        holders: [],
      });
    }
    groupsMap.get(h.electionId)!.holders.push(h);
  }
  const groups = Array.from(groupsMap.values()).sort((a, b) => b.electionYear - a.electionYear);
  const latestHolders = groups[0]?.holders ?? [];
  const totalMembers = latestHolders.length;
  const officerCount = latestHolders.filter((holder) =>
    OFFICER_TITLES.includes(holder.positionTitle),
  ).length;
  const committeeCount = totalMembers - officerCount;

  return (
    <div className="mx-auto max-w-4xl pb-4">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-strong">
            Community leadership
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Your board</h1>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-ink-soft">
            Meet the residents serving your community and guiding what happens next.
          </p>
        </div>
        <Link
          href="/results"
          className="hover:border-brand/30 inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-xs font-semibold text-ink-soft shadow-sm transition-colors hover:text-brand-strong"
        >
          <IconBarChart width={15} height={15} />
          Election results
        </Link>
      </header>

      {groups.length === 0 ? (
        <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
          <div className="to-accentwarm-soft/60 relative overflow-hidden bg-gradient-to-br from-brand-soft via-surface px-6 py-10 text-center sm:px-10 sm:py-14">
            <div
              aria-hidden="true"
              className="border-brand/5 absolute -right-10 -top-14 h-40 w-40 rounded-full border-[22px]"
            />
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-on-brand shadow-sm">
              <IconUser width={24} height={24} />
            </span>
            <h2 className="text-lg font-semibold text-ink">Your community board starts here</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
              Once an election is complete, elected officers and committee members will appear here.
              Explore the election center to follow the latest updates.
            </p>
            <Link
              href="/vote"
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-on-brand shadow-sm transition hover:bg-brand-strong"
            >
              <IconBallot width={16} height={16} />
              View elections
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="shadow-brand/10 relative mb-5 overflow-hidden rounded-3xl bg-brand px-5 py-5 text-on-brand shadow-lg sm:px-7 sm:py-6">
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[28px] border-white/[0.07]"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-20 right-28 h-36 w-36 rounded-full border-[22px] border-white/[0.05]"
            />
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
                    Elected leadership
                  </span>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    {groups[0].electionTitle}
                  </h2>
                  <p className="mt-1 text-xs text-white/75">
                    Board service · {groups[0].electionYear}
                  </p>
                </div>
                <div className="flex gap-2">
                  {[
                    { value: totalMembers, label: 'Members' },
                    { value: officerCount, label: 'Officers' },
                    { value: committeeCount, label: 'Committee' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="min-w-[74px] rounded-2xl bg-white/10 px-3 py-2 text-center backdrop-blur-sm"
                    >
                      <p className="text-lg font-semibold tabular-nums text-white">{stat.value}</p>
                      <p className="text-[9px] font-medium text-white/70">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-5 flex items-center gap-2 text-[11px] text-white/75">
                <IconCheck width={14} height={14} />
                Chosen by residents through the community election
              </p>
            </div>
          </section>
        </>
      )}

      {groups.map((group) => {
        const officers = group.holders
          .filter((h) => OFFICER_TITLES.includes(h.positionTitle))
          .sort(
            (a, b) =>
              OFFICER_TITLES.indexOf(a.positionTitle) - OFFICER_TITLES.indexOf(b.positionTitle),
          );
        const committees = group.holders
          .filter((h) => !OFFICER_TITLES.includes(h.positionTitle))
          .sort((a, b) => a.positionTitle.localeCompare(b.positionTitle));
        const isCurrentGroup = group === groups[0];

        return (
          <section
            key={`${group.electionTitle}-${group.electionYear}`}
            aria-labelledby={`board-${group.electionYear}`}
            className="mb-6"
          >
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-brand-strong">
                  {isCurrentGroup ? 'Leadership team' : 'Board term'}
                </p>
                <h2
                  id={`board-${group.electionYear}`}
                  className="mt-0.5 text-base font-semibold text-ink"
                >
                  {isCurrentGroup ? 'Board members' : group.electionTitle}
                </h2>
              </div>
              <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-[10px] font-medium text-ink-muted">
                {group.electionYear}
              </span>
            </div>
            {officers.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-2 px-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  <h3 className="text-xs font-semibold text-ink">Board officers</h3>
                  <span className="text-[10px] text-ink-muted">{officers.length}</span>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {officers.map((holder, index) => (
                    <BoardMemberCard
                      key={`${holder.positionId}-${holder.homeownerId}`}
                      holder={holder}
                      featured={index === 0 && holder.positionTitle === 'President'}
                    />
                  ))}
                </div>
              </div>
            )}
            {committees.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2 px-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accentwarm" />
                  <h3 className="text-xs font-semibold text-ink">Committee members</h3>
                  <span className="text-[10px] text-ink-muted">{committees.length}</span>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {committees.map((holder) => (
                    <BoardMemberCard
                      key={`${holder.positionId}-${holder.homeownerId}`}
                      holder={holder}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
