type ElectionWindow = {
  filingOpensAt: Date | null;
  filingClosesAt: Date | null;
  votingOpensAt: Date | null;
  closesAt: Date | null;
};

export function isFilingOpen(election: ElectionWindow, now: Date = new Date()): boolean {
  if (!election.filingOpensAt) return false;
  if (now < election.filingOpensAt) return false;
  if (!election.filingClosesAt) return true;
  return now < election.filingClosesAt;
}

export function isVotingOpen(election: ElectionWindow, now: Date = new Date()): boolean {
  if (!election.votingOpensAt || !election.closesAt) return false;
  if (now < election.votingOpensAt) return false;
  return now < election.closesAt;
}

export function isAwaitingVotingStart(election: ElectionWindow, now: Date = new Date()): boolean {
  if (!election.filingOpensAt) return false;
  if (isVotingOpen(election, now)) return false;
  if (election.closesAt && election.closesAt <= now) return false;
  return !isFilingOpen(election, now);
}

export function isDraft(election: ElectionWindow): boolean {
  return !election.filingOpensAt;
}
