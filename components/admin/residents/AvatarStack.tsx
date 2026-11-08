export default function AvatarStack({
  names,
  max = 5,
}: {
  names: string[];
  max?: number;
}) {
  const visible = names.slice(0, max);
  const overflow = names.length - visible.length;

  return (
    <div className='flex items-center'>
      {visible.map((name, i) => {
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();
        return (
          <div
            key={i}
            style={{
              marginLeft: i === 0 ? 0 : -10,
              zIndex: visible.length - i,
            }}
            className='w-9 h-9 rounded-full bg-accentwarm-soft text-accentwarm border-2 border-surface flex items-center justify-center text-[11px] font-semibold'
          >
            {initials}
          </div>
        );
      })}
      {overflow > 0 && (
        <div
          style={{ marginLeft: -10 }}
          className='w-9 h-9 rounded-full bg-surface-muted text-ink-soft border-2 border-surface flex items-center justify-center text-[11px] font-semibold'
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
