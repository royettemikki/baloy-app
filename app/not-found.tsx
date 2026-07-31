import Link from 'next/link';
import Screen from '@/components/Screen';
import { organization } from '@/data/mock';

export default function NotFound() {
  return (
    <Screen>
      <div className='bg-brand-strong flex flex-col items-center justify-center px-8 py-11'>
        <div className='w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-3.5'>
          <span className='text-lg font-semibold text-brand-strong'>
            {organization.logoInitials}
          </span>
        </div>
        <p className='text-white text-lg font-medium mb-1'>
          {organization.name}
        </p>
      </div>

      <div className='flex-1 flex flex-col items-center justify-center text-center px-8'>
        <p className='text-5xl font-semibold text-ink-muted mb-2'>404</p>
        <p className='text-base font-medium mb-1.5'>Page not found</p>
        <p className='text-sm text-ink-soft mb-6'>
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link href='/home'>
          <button className='bg-brand text-on-brand rounded-xl px-6 py-3 text-sm font-medium'>
            Back to home
          </button>
        </Link>
      </div>
    </Screen>
  );
}
