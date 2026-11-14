import { IconCheck } from '@/components/Icons';
import { formatLongDate } from '@/lib/formatDate';

type Vote = {
  id: number;
  positionId: number;
  castAt: Date;
  position: { title: string };
  candidate: { name: string; roleDescription: string };
};

export default function BallotSummary({
  electionTitle,
  closesAt,
  votes,
}: {
  electionTitle: string;
  closesAt: Date;
  votes: Vote[];
}) {
  const submittedAt = votes.reduce(
    (latest, v) => (v.castAt > latest ? v.castAt : latest),
    votes[0].castAt,
  );
  const votesByPosition = new Map<number, Vote[]>();
  for (const vote of votes) {
    const positionVotes = votesByPosition.get(vote.positionId) ?? [];
    positionVotes.push(vote);
    votesByPosition.set(vote.positionId, positionVotes);
  }

  return (
    <div className="animate-fadeInUp">
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft">
          <IconCheck width={24} height={24} className="text-brand" />
        </div>
        <p className="mb-1 text-lg font-medium">Ballot submitted</p>
        <p className="text-xs text-ink-muted">Voted on {formatLongDate(submittedAt)}</p>
      </div>

      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted">
        {electionTitle}
      </p>

      {[...votesByPosition.values()].map((positionVotes) => (
        <div
          key={positionVotes[0].positionId}
          className="mb-2.5 rounded-2xl border border-line p-3.5"
        >
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-xs text-ink-muted">{positionVotes[0].position.title}</p>
            <span className="flex items-center gap-1 rounded-pill bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-strong">
              <IconCheck width={10} height={10} /> {positionVotes.length} selected
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {positionVotes.map((vote) => (
              <div key={vote.id} className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-[12.5px] font-semibold text-brand-strong">
                  {vote.candidate.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{vote.candidate.name}</p>
                  <p className="text-xs text-ink-soft">{vote.candidate.roleDescription}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className="mt-2 text-xs text-ink-muted">
        Results are shared after voting closes on{' '}
        {closesAt.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        })}
        .
      </p>
    </div>
  );
}
