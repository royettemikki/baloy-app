import { Slate } from '@/types/candidate';

export default function SlateTag({ slate }: { slate: Slate }) {
  if (!slate) {
    return (
      <span className='text-[10.5px] font-medium px-2 py-0.5 rounded-pill bg-surface-muted text-ink-soft'>
        Independent
      </span>
    );
  }
  return (
    <span
      className='text-[10.5px] font-medium px-2 py-0.5 rounded-pill'
      style={{ backgroundColor: `${slate.color}1A`, color: slate.color }}
    >
      {slate.name}
    </span>
  );
}
