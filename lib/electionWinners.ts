import { prisma } from '@/lib/prisma';

export async function getPositionWinnerIds(positionId: number): Promise<number[]> {
  const position = await prisma.position.findUnique({
    where: { id: positionId },
    include: { candidates: { include: { votes: true } } },
  });
  if (!position) return [];

  return [...position.candidates]
    .sort((a, b) => b.votes.length - a.votes.length || a.id - b.id)
    .slice(0, position.seats)
    .map((c) => c.id);
}

export type Officeholder = {
  positionId: number;
  positionTitle: string;
  homeownerId: string;
  fullName: string;
  unit: string;
  electionId: number;
  electionTitle: string;
  electionYear: number;
};

// The single source of truth for "who currently holds each role" — considers
// every closed election, but only the most recently closed one counts per
// position title. An older election's winner for the same title is retired
// automatically once a newer election for that same title closes.
export async function getCurrentOfficeholders(): Promise<Officeholder[]> {
  const now = new Date();

  const closedElections = await prisma.election.findMany({
    where: { closesAt: { lt: now } },
    orderBy: { closesAt: 'desc' },
    include: {
      positions: { include: { candidates: { include: { votes: true, homeowner: true } } } },
    },
  });

  const seenTitles = new Set<string>();
  const holders: Officeholder[] = [];

  for (const election of closedElections) {
    if (!election.closesAt) continue; // shouldn't happen given the query filter above, but keeps this fully type-safe
    for (const position of election.positions) {
      if (seenTitles.has(position.title)) continue; // a more recent election already decided this title
      seenTitles.add(position.title);

      const winnerIds = [...position.candidates]
        .sort((a, b) => b.votes.length - a.votes.length || a.id - b.id)
        .slice(0, position.seats)
        .map((c) => c.id);

      for (const candidate of position.candidates) {
        if (winnerIds.includes(candidate.id) && candidate.homeownerId && candidate.homeowner) {
          holders.push({
            positionId: position.id,
            positionTitle: position.title,
            homeownerId: candidate.homeownerId,
            fullName: candidate.homeowner.fullName,
            unit: candidate.homeowner.unit,
            electionId: election.id,
            electionTitle: election.title,
            electionYear: election.closesAt.getFullYear(),
          });
        }
      }
    }
  }

  return holders;
}

export async function getCommitteeMemberships(homeownerId: string) {
  const holders = await getCurrentOfficeholders();
  return holders
    .filter((h) => h.homeownerId === homeownerId)
    .map((h) => ({ positionId: h.positionId, positionTitle: h.positionTitle }));
}

export async function hasApprovalAuthority(homeownerId: string): Promise<boolean> {
  const homeowner = await prisma.homeowner.findUnique({ where: { id: homeownerId } });
  if (homeowner?.isAdmin) return true;

  const holders = await getCurrentOfficeholders();
  return holders.some(
    (h) =>
      h.homeownerId === homeownerId &&
      (h.positionTitle === 'President' || h.positionTitle === 'Treasurer'),
  );
}
