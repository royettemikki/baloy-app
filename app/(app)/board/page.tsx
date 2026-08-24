import Link from 'next/link';
import { getCurrentOfficeholders, Officeholder } from '@/lib/electionWinners';

const OFFICER_TITLES = ['President', 'Vice President', 'Treasurer', 'Secretary'];

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function BoardRow({ holder }: { holder: Officeholder }) {
  return (
    <div className="flex items-center gap-3 border-t border-line py-2.5 first:border-0">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accentwarm-soft text-[11px] font-semibold text-accentwarm">
        {initials(holder.fullName)}
      </div>
      <div>
        <p className="text-sm font-medium">{holder.fullName}</p>
        <p className="text-xs text-ink-muted">
          {holder.positionTitle} · Unit {holder.unit}
        </p>
      </div>
    </div>
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

  return (
    <div>
      <Link href="/vote" className="mb-4 inline-block text-sm font-medium text-brand">
        ← Vote
      </Link>
      <h1 className="mb-1 text-xl font-medium">Your board</h1>
      <p className="mb-5 text-sm text-ink-soft">
        Currently elected officers and committee members.
      </p>

      {groups.length === 0 && <p className="text-sm text-ink-muted">No election results yet.</p>}

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

        return (
          <div key={`${group.electionTitle}-${group.electionYear}`} className="mb-6">
            <p className="mb-2 text-xs font-medium text-ink-muted">
              {group.electionTitle} ({group.electionYear})
            </p>
            {officers.length > 0 && (
              <div className="mb-3 rounded-2xl bg-surface-muted px-4">
                {officers.map((h) => (
                  <BoardRow key={`${h.positionId}-${h.homeownerId}`} holder={h} />
                ))}
              </div>
            )}
            {committees.length > 0 && (
              <div className="rounded-2xl bg-surface-muted px-4">
                {committees.map((h) => (
                  <BoardRow key={`${h.positionId}-${h.homeownerId}`} holder={h} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
