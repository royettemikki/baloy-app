'use client';

import { useRouter } from 'next/navigation';
import { IconCheck } from '@/components/Icons';

export default function BallotComplete({
  alreadyDone,
}: {
  alreadyDone: boolean;
}) {
  const router = useRouter();
  return (
    <div className='flex flex-col h-full text-center animate-fadeInUp'>
      <div className='flex-1 flex flex-col items-center justify-center px-8'>
        <div className='w-14 h-14 rounded-full bg-brand-soft flex items-center justify-center mb-4'>
          <IconCheck width={26} height={26} className='text-brand' />
        </div>
        <p className='text-lg font-medium mb-1.5'>Ballot submitted</p>
        <p className='text-sm text-ink-soft leading-relaxed'>
          {alreadyDone
            ? "You've already completed your ballot for this election."
            : 'Your vote has been recorded. Results are shared after voting closes.'}
        </p>
      </div>
      <button
        onClick={() => router.push('/home')}
        className='w-full bg-brand text-on-brand rounded-xl py-3.5 text-sm font-medium'
      >
        Back to home
      </button>
    </div>
  );
}
