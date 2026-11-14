import { getCurrentOfficeholders, Officeholder } from '@/lib/electionWinners';
import { formatFullDate } from '@/lib/formatDate';

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function displayUnit(unit: string) {
  return /^REPLACE_WITH_/i.test(unit) ? 'Unit not set' : `Unit ${unit}`;
}

export default async function CurrentBoardSummary() {
  const officeholders = await getCurrentOfficeholders();
  if (officeholders.length === 0) return null;

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

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="from-brand-soft/70 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r via-surface to-surface px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-on-brand">
            <svg
              aria-hidden="true"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
              <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Current board</p>
            <p className="text-[10px] text-ink-muted">Elected residents serving the community</p>
          </div>
        </div>
        <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-[10px] font-semibold text-ink-soft">
          {officeholders.length} member{officeholders.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="space-y-4 border-t border-line px-4 py-4 sm:px-5">
        {groups.map((group) => (
          <div key={`${group.electionTitle}-${group.electionYear}`}>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                {group.electionTitle}
              </p>
              <span className="text-[10px] text-ink-muted">{group.electionYear}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {group.holders.map((holder) => (
                <div
                  key={`${holder.positionId}-${holder.homeownerId}`}
                  className="border-line/80 bg-surface-muted/45 flex min-w-0 items-start gap-2.5 rounded-xl border px-2.5 py-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-[10px] font-semibold text-brand-strong">
                    {initials(holder.fullName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-[10px] font-medium leading-snug text-ink-muted">
                      {holder.positionTitle}
                    </p>
                    <p className="break-words text-xs font-semibold leading-snug text-ink">
                      {holder.fullName}
                    </p>
                    <p className="mt-0.5 break-words text-[9px] text-ink-muted">
                      {displayUnit(holder.unit)}
                    </p>
                    <p className="mt-0.5 break-words text-[9px] text-ink-muted">
                      {holder.isHoldover
                        ? `Holdover since ${formatFullDate(holder.termEndsAt)}`
                        : `Term through ${formatFullDate(holder.termEndsAt)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
