import { Candidate } from '@/types/candidate';

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function CandidatePhoto({
  candidate,
  size,
}: {
  candidate: Candidate;
  size: 'card' | 'sheet';
}) {
  const dims =
    size === 'card'
      ? 'w-[64px] h-[64px] rounded-xl'
      : 'w-[92px] h-[92px] rounded-2xl';
  if (candidate.photoUrl) {
    return (
      <img
        src={candidate.photoUrl}
        alt={candidate.name}
        className={`${dims} object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${dims} bg-brand-soft text-brand-strong flex items-center justify-center font-semibold flex-shrink-0 ${size === 'card' ? 'text-base' : 'text-2xl'}`}
    >
      {initials(candidate.name)}
    </div>
  );
}
