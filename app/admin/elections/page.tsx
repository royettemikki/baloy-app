import { prisma } from '@/lib/prisma';
import { getPositionWinnerIds } from '@/lib/electionWinners';
import { STANDARD_POSITION_TEMPLATE } from '@/constants/positionTemplates';
import { isFilingOpen, isVotingOpen, isAwaitingVotingStart, isDraft } from '@/lib/electionWindows';
import CandidateLinkPicker from '@/components/admin/elections/CandidateLinkPicker';
import NewElectionButton from '@/components/admin/elections/NewElectionButton';
import NewPositionForm from '@/components/admin/elections/NewPositionForm';
import NewCandidateForm from '@/components/admin/elections/NewCandidateForm';
import ElectionAccordion from '@/components/admin/elections/ElectionAccordion';
import ApplyTemplateButton from '@/components/admin/elections/ApplyTemplateButton';
import PositionRow from '@/components/admin/elections/PositionRow';
import CandidacyFilingRow from '@/components/admin/elections/CandidacyFilingRow';
import CurrentBoardSummary from '@/components/admin/elections/CurrentBoardSummary';
import StartFilingButton from '@/components/admin/elections/StartFilingButton';
import StartVotingNowButton from '@/components/admin/elections/StartVotingNowButton';
import CountdownTimer from '@/components/CountdownTimer';
import AutoRefresh from '@/components/AutoRefresh';

export default async function AdminElectionsPage() {
  const [elections, residents] = await Promise.all([
    prisma.election.findMany({
      orderBy: { opensAt: 'desc' },
      include: { positions: { include: { candidates: { include: { votes: true } } } } },
    }),
    prisma.homeowner.findMany({
      where: { passwordHash: { not: null } },
      orderBy: { fullName: 'asc' },
    }),
  ]);

  const serializedResidents = residents.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    unit: r.unit,
  }));
  const now = new Date();

  return (
    <div>
      <AutoRefresh />

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-ink-soft">Manage elections, positions, and candidates.</p>
        <NewElectionButton />
      </div>

      <CurrentBoardSummary />

      {elections.length === 0 && (
        <p className="text-sm text-ink-muted">No elections have been created yet.</p>
      )}

      {await Promise.all(
        elections.map(async (election) => {
          const isClosed = election.closesAt !== null && election.closesAt < now;
          const draft = isDraft(election);
          const filingOpen = isFilingOpen(election, now);
          const votingOpen = isVotingOpen(election, now);
          const awaitingVoting = isAwaitingVotingStart(election, now);
          const existingTitles = new Set(election.positions.map((p) => p.title));
          const templateFullyApplied = STANDARD_POSITION_TEMPLATE.every((t) =>
            existingTitles.has(t.title),
          );

          const filingClosesAt = election.filingClosesAt;
          const votingClosesAt = election.closesAt;

          const statusLabel = isClosed
            ? 'Closed'
            : draft
              ? 'Draft'
              : votingOpen
                ? 'Voting open'
                : awaitingVoting
                  ? 'Awaiting voting'
                  : 'Filing open';

          return (
            <ElectionAccordion
              key={election.id}
              title={election.title}
              statusLabel={statusLabel}
              isClosed={isClosed}
              defaultOpen={!isClosed}
            >
              {!isClosed && (
                <>
                  {draft && (
                    <StartFilingButton
                      electionId={election.id}
                      hasPositions={election.positions.length > 0}
                    />
                  )}
                  {(filingOpen || awaitingVoting) && (
                    <StartVotingNowButton electionId={election.id} />
                  )}

                  <div className="mb-4 flex flex-wrap gap-4 text-xs">
                    {draft && (
                      <span className="text-ink-muted">
                        Not open yet — click "Open for filing" when ready
                      </span>
                    )}
                    {filingOpen && filingClosesAt && (
                      <span className="text-ink-soft">
                        <CountdownTimer
                          targetDate={filingClosesAt.toISOString()}
                          activeLabel="Filing closes in"
                          expiredLabel="Filing is closed"
                        />
                      </span>
                    )}
                    {awaitingVoting && (
                      <span className="text-warning">
                        Filing has closed — click "Start voting" when ready
                      </span>
                    )}
                    {votingOpen && votingClosesAt && (
                      <span className="text-brand-strong">
                        <CountdownTimer
                          targetDate={votingClosesAt.toISOString()}
                          activeLabel="Voting closes in"
                          expiredLabel="Voting is closed"
                        />
                      </span>
                    )}
                  </div>
                </>
              )}

              <p className="mb-4 text-xs text-ink-muted">
                {isClosed
                  ? 'Winners shown below'
                  : 'Still open — set up positions and candidates now'}
              </p>

              {await Promise.all(
                election.positions.map(async (position) => {
                  const winnerIds = isClosed ? await getPositionWinnerIds(position.id) : [];

                  const pendingFilings = !isClosed
                    ? await prisma.candidacyFiling.findMany({
                        where: { positionId: position.id, status: 'Pending' },
                        include: { homeowner: true },
                      })
                    : [];

                  return (
                    <PositionRow
                      key={position.id}
                      positionId={position.id}
                      title={position.title}
                      seats={position.seats}
                    >
                      <div className="flex flex-col gap-2">
                        {position.candidates.map((c) => {
                          const isWinner = winnerIds.includes(c.id);
                          return (
                            <div
                              key={c.id}
                              className="flex items-center justify-between gap-3 border-t border-line py-2 first:border-0"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {c.name}{' '}
                                  {isWinner && (
                                    <span className="ml-1 text-[11px] font-medium text-brand-strong">
                                      Winner
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-ink-muted">
                                  {c.votes.length} vote{c.votes.length === 1 ? '' : 's'}
                                  {!c.homeownerId && ' · not linked to an account'}
                                </p>
                              </div>
                              {!c.homeownerId && !isClosed && (
                                <CandidateLinkPicker
                                  candidateId={c.id}
                                  currentHomeownerId={c.homeownerId}
                                  residents={serializedResidents}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {pendingFilings.length > 0 && (
                        <div className="mt-3 border-t border-line pt-3">
                          <p className="mb-2 text-xs font-medium text-ink-soft">Pending filings</p>
                          <div className="flex flex-col gap-2">
                            {pendingFilings.map((f) => (
                              <CandidacyFilingRow
                                key={f.id}
                                filingId={f.id}
                                homeownerName={f.homeowner.fullName}
                                statement={f.statement}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {!isClosed && !votingOpen && (
                        <NewCandidateForm
                          positionId={position.id}
                          residents={serializedResidents}
                        />
                      )}
                    </PositionRow>
                  );
                }),
              )}

              {!isClosed && (
                <>
                  {!templateFullyApplied && <ApplyTemplateButton electionId={election.id} />}
                  <NewPositionForm electionId={election.id} />
                </>
              )}
            </ElectionAccordion>
          );
        }),
      )}
    </div>
  );
}
