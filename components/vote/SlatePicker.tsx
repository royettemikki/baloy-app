import { IconX } from '@/components/Icons';

export default function SlatePicker({
  slates,
  onClose,
  onPick,
}: {
  slates: { name: string; color: string }[];
  onClose: () => void;
  onPick: (slateName: string) => void;
}) {
  return (
    <div className='fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center'>
      <div className='w-full sm:max-w-md bg-surface rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto no-scrollbar animate-fadeInUp'>
        <div className='flex justify-end mb-2'>
          <button
            onClick={onClose}
            className='w-7 h-7 rounded-full bg-surface-muted flex items-center justify-center'
          >
            <IconX width={14} height={14} className='text-ink-soft' />
          </button>
        </div>

        <p className='text-sm font-medium mb-1'>Vote for your preferred team</p>
        <p className='text-xs text-ink-muted mb-4'>
          This fills in every position your chosen team is running for —
          including positions you've already picked. Anything they're not
          running for stays as-is, and you can still review or change anything
          before submitting.
        </p>

        <div className='flex flex-col gap-2'>
          {slates.map((slate) => (
            <button
              key={slate.name}
              onClick={() => onPick(slate.name)}
              className='flex items-center gap-2.5 border border-line rounded-xl px-3.5 py-2.5 text-left'
            >
              <span
                className='w-2.5 h-2.5 rounded-full flex-shrink-0'
                style={{ backgroundColor: slate.color }}
              />
              <span className='text-sm font-medium flex-1'>{slate.name}</span>
              <span className='text-xs text-ink-muted'>Use this team →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
