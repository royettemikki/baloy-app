import { IconCheck } from '@/components/Icons';
import { formatLongDate } from '@/lib/formatDate';

type Vote = {
  id: number;
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

      {votes.map((v) => (
        <div key={v.id} className="mb-2.5 rounded-2xl border border-line p-3.5">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-xs text-ink-muted">{v.position.title}</p>
            <span className="flex items-center gap-1 rounded-pill bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-strong">
              <IconCheck width={10} height={10} /> Voted
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-[12.5px] font-semibold text-brand-strong">
              {v.candidate.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{v.candidate.name}</p>
              <p className="text-xs text-ink-soft">{v.candidate.roleDescription}</p>
            </div>
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
