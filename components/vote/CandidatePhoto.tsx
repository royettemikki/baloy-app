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
  size: 'card' | 'compare' | 'sheet' | 'list';
}) {
  const dims =
    size === 'list'
      ? 'h-10 w-10 rounded-full'
      : size === 'card'
        ? 'w-[64px] h-[64px] rounded-xl'
        : 'w-[92px] h-[92px] rounded-2xl';
  const photoUrl = candidate.photoUrl ?? candidate.homeownerAvatarUrl;

  if (size === 'compare') {
    return (
      <div className="ring-ink/10 relative aspect-square w-[min(72%,220px)] overflow-hidden rounded-full border-4 border-white/90 bg-gradient-to-br from-brand-soft via-surface-muted to-accentwarm-soft shadow-xl ring-1">
        {photoUrl ? (
          <img src={photoUrl} alt={candidate.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl font-semibold text-brand-strong sm:text-6xl">
            {initials(candidate.name)}
          </div>
        )}
      </div>
    );
  }

  if (photoUrl) {
    return (
      <img src={photoUrl} alt={candidate.name} className={`${dims} flex-shrink-0 object-cover`} />
    );
  }
  return (
    <div
      className={`${dims} flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-brand-soft via-surface-muted to-accentwarm-soft font-semibold text-brand-strong ${size === 'list' ? 'text-xs' : size === 'card' ? 'text-base' : 'text-2xl'}`}
    >
      {initials(candidate.name)}
    </div>
  );
}
