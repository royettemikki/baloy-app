// Whether a resident can only file for one position per election at a time.
// Hardcoded on for now — a future admin settings screen could make this
// toggleable without touching any of the logic that calls this function.
export function isSingleCandidacyRestrictionEnabled(): boolean {
  return true;
}

export function getNextAvailableBallotNumber(usedNumbers: number[]): number {
  const used = new Set(usedNumbers);
  let number = 1;
  while (used.has(number)) number += 1;
  return number;
}

export function canFileForPosition(
  currentPositionTitles: string[],
  positionTitle: string,
): boolean {
  if (currentPositionTitles.length === 0) return true;
  const normalizedTitle = positionTitle.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  return currentPositionTitles.some(
    (title) => title.trim().replace(/\s+/g, ' ').toLocaleLowerCase() === normalizedTitle,
  );
}
