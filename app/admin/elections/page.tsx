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
import EndVotingNowButton from '@/components/admin/elections/EndVotingNowButton';
import CountdownTimer from '@/components/CountdownTimer';
import AutoRefresh from '@/components/AutoRefresh';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { IconBallot, IconCheck, IconUser } from '@/components/Icons';

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
  const liveCount = elections.filter((election) => isVotingOpen(election, now)).length;
  const filingCount = elections.filter((election) => isFilingOpen(election, now)).length;
  const candidateCount = elections.reduce(
    (total, election) =>
      total + election.positions.reduce((count, position) => count + position.candidates.length, 0),
    0,
  );
  const voteCount = elections.reduce(
    (total, election) =>
      total +
      election.positions.reduce(
        (count, position) =>
          count +
          position.candidates.reduce((votes, candidate) => votes + candidate.votes.length, 0),
        0,
      ),
    0,
  );
  return (
    <div className="w-full">
      <AutoRefresh />

      <AdminPageHeader
        title="Elections"
        description="Set up board terms, review filings, and follow voting."
        action={<NewElectionButton />}
        eyebrow="Governance"
      />

      <section className="shadow-brand/10 relative mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-brand to-brand-strong px-5 py-5 text-on-brand shadow-lg sm:px-6 sm:py-6">
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-14 h-40 w-40 rounded-full border-[24px] border-white/[0.07]"
        />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-lg">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-on-brand-muted">
              Election operations
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">
              A clear view of every board cycle
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-on-brand-muted">
              Prepare positions, review resident candidacies, and manage each step through final
              results.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-[330px]">
            {[
              { label: 'Cycles', value: elections.length, icon: IconBallot },
              { label: 'Filing open', value: filingCount, icon: IconUser },
              { label: 'Voting live', value: liveCount, icon: IconCheck },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-medium text-white/75">{label}</p>
                  <Icon width={14} height={14} className="text-white/75" />
                </div>
                <p className="mt-1 text-xl font-semibold tabular-nums text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: 'Candidates on ballots', value: candidateCount, icon: IconUser },
          { label: 'Resident accounts', value: residents.length, icon: IconCheck },
          { label: 'Votes recorded', value: voteCount, icon: IconBallot },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-line bg-surface p-3.5 shadow-sm sm:p-4"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
              <Icon width={16} height={16} />
            </span>
            <p className="mt-3 text-xl font-semibold tabular-nums text-ink">{value}</p>
            <p className="mt-0.5 text-[10px] font-medium text-ink-muted">{label}</p>
          </div>
        ))}
      </div>

      <CurrentBoardSummary />

      {elections.length > 0 && (
        <div className="mb-3 flex items-end justify-between px-0.5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-strong">
              Manage elections
            </p>
            <h2 className="mt-0.5 text-base font-semibold text-ink">Election cycles</h2>
          </div>
          <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-[10px] font-medium tabular-nums text-ink-muted">
            {elections.length} total
          </span>
        </div>
      )}

      {elections.length === 0 && (
        <div className="rounded-3xl border border-dashed border-line bg-surface px-5 py-10 text-center shadow-sm">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
            <IconBallot width={22} height={22} />
          </span>
          <p className="mt-3 text-sm font-semibold text-ink">Your next election starts here</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-muted">
            Create a cycle to set up board positions, collect candidacies, and prepare residents to
            vote.
          </p>
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
              positionCount={election.positions.length}
              candidateCount={election.positions.reduce(
                (count, position) => count + position.candidates.length,
                0,
              )}
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
                          <span className="h-2 w-2 animate-pulse rounded-full bg-on-brand" /> Live
                          voting - ballot locked
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          Residents are casting their votes
                        </p>
                        <p className="mt-0.5 text-xs text-on-brand-muted">
                          Positions and candidates can no longer be changed.
                        </p>
                      </div>
                      <div className="rounded-xl bg-on-brand-subtle px-3.5 py-2 text-xs font-medium">
                        <CountdownTimer
                          targetDate={votingClosesAt.toISOString()}
                          activeLabel="Voting closes in"
                          expiredLabel="Voting is closed"
                        />
                      </div>
                      <EndVotingNowButton electionId={election.id} />
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

              <p
                className={`mb-2.5 text-xs text-ink-muted ${ballotLocked && !isClosed ? 'hidden' : ''}`}
              >
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
                          finalized={isClosed}
                          lockLabel={isClosed ? 'Final' : 'Ballot locked'}
                        >
                          <div className="mt-3">
                            <div className="mb-2 flex items-center justify-between px-1">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                                Candidate roster
                              </p>
                              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-ink-muted">
                                {position.candidates.length}
                              </span>
                            </div>
                            {position.candidates.length === 0 && (
                              <p className="rounded-lg bg-surface-muted px-3 py-2 text-[11px] text-ink-muted">
                                No candidates added yet.
                              </p>
                            )}
                            <div className="grid grid-cols-1">
                              {position.candidates.map((c) => {
                                const isWinner = winnerIds.includes(c.id);
                                return (
                                  <div
                                    key={c.id}
                                    className={`border-line/50 flex min-w-0 items-center justify-between gap-2 rounded-xl border-b px-2 py-2.5 last:border-0 ${
                                      isWinner ? 'bg-brand-soft/45' : ''
                                    }`}
                                  >
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                      {c.photoUrl ? (
                                        <img
                                          src={c.photoUrl}
                                          alt=""
                                          className="h-8 w-8 shrink-0 rounded-lg object-cover"
                                        />
                                      ) : (
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-[10px] font-semibold text-brand-strong">
                                          {c.name
                                            .split(' ')
                                            .map((part) => part[0])
                                            .slice(0, 2)
                                            .join('')
                                            .toUpperCase()}
                                        </span>
                                      )}
                                      <div className="min-w-0">
                                        <p className="flex min-w-0 items-center gap-1.5 text-xs font-semibold">
                                          <span className="truncate">{c.name}</span>
                                          {isWinner && (
                                            <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-[9px] font-semibold text-on-brand">
                                              Elected
                                            </span>
                                          )}
                                        </p>
                                        {c.roleDescription && (
                                          <p className="truncate text-[10px] text-ink-soft">
                                            {c.roleDescription}
                                          </p>
                                        )}
                                        {!isClosed && (
                                          <p className="truncate text-[10px] text-ink-muted">
                                            {c.votes.length} vote{c.votes.length === 1 ? '' : 's'}
                                            {!c.homeownerId && ' · not linked to an account'}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    {isClosed && (
                                      <span className="bg-surface/80 shrink-0 rounded-lg px-2 py-1 text-[10px] font-semibold tabular-nums text-ink-soft">
                                        {c.votes.length} vote{c.votes.length === 1 ? '' : 's'}
                                      </span>
                                    )}
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
                              <p className="mb-2 text-xs font-medium text-ink-soft">
                                Pending filings
                              </p>
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
                <div className="bg-brand-soft/60 mt-3 rounded-xl px-3.5 py-3 text-xs text-brand-strong">
                  Ballot structure is frozen for this election. Positions and candidate details
                  cannot be changed after voting begins.
                </div>
              )}
            </ElectionAccordion>
          );
        }),
      )}
    </div>
  );
}
