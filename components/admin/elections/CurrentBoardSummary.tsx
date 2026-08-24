import { getCurrentOfficeholders, Officeholder } from '@/lib/electionWinners';

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
    <div className="mb-6 rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <p className="mb-3 text-sm font-medium">Current board</p>
      {groups.map((group) => (
        <div key={`${group.electionTitle}-${group.electionYear}`} className="mb-3 last:mb-0">
          <p className="mb-1.5 text-[11px] text-ink-muted">
            {group.electionTitle} ({group.electionYear})
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {group.holders.map((h) => (
              <div
                key={`${h.positionId}-${h.homeownerId}`}
                className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2"
              >
                <span className="text-xs font-medium">{h.positionTitle}</span>
                <span className="text-xs text-ink-muted">{h.fullName}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
