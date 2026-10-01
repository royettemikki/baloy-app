export default function StepRing({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - current / total);

  return (
    <div className='relative w-14 h-14 flex-shrink-0'>
      <svg width='56' height='56' viewBox='0 0 56 56' className='-rotate-90'>
        <circle
          cx='28'
          cy='28'
          r={radius}
          fill='none'
          stroke='var(--surface-muted)'
          strokeWidth='4'
        />
        <circle
          cx='28'
          cy='28'
          r={radius}
          fill='none'
          stroke='var(--brand)'
          strokeWidth='4'
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='text-[11px] font-semibold text-ink'>
          {current}/{total}
        </span>
      </div>
    </div>
  );
}
