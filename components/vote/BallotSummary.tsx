import { IconCheck } from '@/components/Icons';

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
    <div className='animate-fadeInUp'>
      <div className='flex flex-col items-center text-center mb-5'>
        <div className='w-14 h-14 rounded-full bg-brand-soft flex items-center justify-center mb-3'>
          <IconCheck width={24} height={24} className='text-brand' />
        </div>
        <p className='text-lg font-medium mb-1'>Ballot submitted</p>
        <p className='text-xs text-ink-muted'>
          Voted on{' '}
          {submittedAt.toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      <p className='text-xs text-ink-muted uppercase tracking-wide font-medium mb-1.5'>
        {electionTitle}
      </p>

      {votes.map((v) => (
        <div key={v.id} className='border border-line rounded-2xl p-3.5 mb-2.5'>
          <div className='flex items-center justify-between mb-2.5'>
            <p className='text-xs text-ink-muted'>{v.position.title}</p>
            <span className='text-[11px] font-medium text-brand-strong bg-brand-soft px-2 py-0.5 rounded-pill flex items-center gap-1'>
              <IconCheck width={10} height={10} /> Voted
            </span>
          </div>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center text-[12.5px] font-semibold flex-shrink-0'>
              {v.candidate.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <p className='text-sm font-medium'>{v.candidate.name}</p>
              <p className='text-xs text-ink-soft'>
                {v.candidate.roleDescription}
              </p>
            </div>
          </div>
        </div>
      ))}

      <p className='text-xs text-ink-muted mt-2'>
        Results are shared after voting closes on{' '}
        {closesAt.toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
        })}
        .
      </p>
    </div>
  );
}
