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
import AdminPageHeader from '@/components/admin/AdminPageHeader';

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
    <div className="w-full">
      <AutoRefresh />

      <AdminPageHeader
        title="Elections"
        description="Set up board terms, review filings, and follow voting."
        action={<NewElectionButton />}
        eyebrow="Governance"
      />

      <CurrentBoardSummary />

      {elections.length > 0 && (
        <div className="mb-2 flex items-center justify-between px-0.5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Election cycles</h2>
          <span className="text-xs tabular-nums text-ink-muted">{elections.length}</span>
        </div>
      )}

      {elections.length === 0 && (
        <div className="rounded-xl border border-dashed border-line bg-surface px-5 py-6 text-center">
          <p className="text-sm font-medium text-ink">No elections yet</p>
          <p className="mt-1 text-xs text-ink-muted">Create an election to start setting up positions and candidates.</p>
        </div>
      )}

      {await Promise.all(
        elections.map(async (election) => {
          const isClosed = election.closesAt !== null && election.closesAt < now;
          const draft = isDraft(election);
          const filingOpen = isFilingOpen(election, now);
          const votingOpen = isVotingOpen(election, now);
          const ballotLocked = Boolean(election.votingOpensAt);
          const structureLocked = ballotLocked || isClosed;
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
              isVotingOpen={votingOpen}
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

                  {votingOpen && votingClosesAt && (
                    <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-brand p-4 text-on-brand shadow-sm sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-on-brand-muted">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-on-brand" /> Live voting - ballot locked
                        </p>
                        <p className="mt-1 text-sm font-semibold">Residents are casting their votes</p>
                        <p className="mt-0.5 text-xs text-on-brand-muted">Positions and candidates can no longer be changed.</p>
                      </div>
                      <div className="rounded-xl bg-on-brand-subtle px-3.5 py-2 text-xs font-medium">
                        <CountdownTimer
                          targetDate={votingClosesAt.toISOString()}
                          activeLabel="Voting closes in"
                          expiredLabel="Voting is closed"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
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
                  </div>
                </>
              )}

              <p className={`mb-2.5 text-xs text-ink-muted ${ballotLocked && !isClosed ? 'hidden' : ''}`}>
                {isClosed
                  ? 'Winners shown below'
                  : 'Still open — set up positions and candidates now'}
              </p>

              {election.positions.length > 0 && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {await Promise.all(
                election.positions.map(async (position) => {
                  const winnerIds = isClosed ? await getPositionWinnerIds(position.id) : [];

                  const pendingFilings = !structureLocked
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
                      locked={structureLocked}
                      lockLabel={isClosed ? 'Final' : 'Ballot locked'}
                    >
                      <div className="mt-2">
                        <div className="mb-1.5 flex items-center justify-between px-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Candidate roster</p>
                          <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-ink-muted">{position.candidates.length}</span>
                        </div>
                        {position.candidates.length === 0 && (
                          <p className="rounded-lg bg-surface-muted px-3 py-2 text-[11px] text-ink-muted">No candidates added yet.</p>
                        )}
                        <div className="grid grid-cols-1">
                        {position.candidates.map((c) => {
                          const isWinner = winnerIds.includes(c.id);
                          return (
                            <div
                              key={c.id}
                              className="flex min-w-0 items-center justify-between gap-2 border-b border-line/40 py-2 last:border-0"
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                {c.photoUrl ? (
                                  <img src={c.photoUrl} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                                ) : (
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-[10px] font-semibold text-brand-strong">
                                    {c.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
                                  </span>
                                )}
                                <div className="min-w-0">
                                <p className="truncate text-xs font-semibold">
                                  {c.name}{' '}
                                  {isWinner && (
                                    <span className="ml-1 text-[11px] font-medium text-brand-strong">
                                      Winner
                                    </span>
                                  )}
                                </p>
                                {c.roleDescription && <p className="truncate text-[10px] text-ink-soft">{c.roleDescription}</p>}
                                <p className="truncate text-[10px] text-ink-muted">
                                  {c.votes.length} vote{c.votes.length === 1 ? '' : 's'}
                                  {!c.homeownerId && ' · not linked to an account'}
                                </p>
                              </div>
                              </div>
                              {!c.homeownerId && !structureLocked && (
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

                      {!structureLocked && (
                        <NewCandidateForm
                          positionId={position.id}
                          residents={serializedResidents}
                        />
                      )}
                    </PositionRow>
                  );
                }),
                )}
                </div>
              )}

              {!structureLocked && (
                <>
                  {!templateFullyApplied && <ApplyTemplateButton electionId={election.id} />}
                  <NewPositionForm electionId={election.id} />
                </>
              )}
              {ballotLocked && !isClosed && (
                <div className="mt-3 rounded-xl bg-brand-soft/60 px-3.5 py-3 text-xs text-brand-strong">
                  Ballot structure is frozen for this election. Positions and candidate details cannot be changed after voting begins.
                </div>
              )}
            </ElectionAccordion>
          );
        }),
      )}
    </div>
  );
}
