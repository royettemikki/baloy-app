// Whether a resident can only file for one position per election at a time.
// Hardcoded on for now — a future admin settings screen could make this
// toggleable without touching any of the logic that calls this function.
export function isSingleCandidacyRestrictionEnabled(): boolean {
  return true;
}
