import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

import Link from 'next/link';
import Screen from '@/components/Screen';
import { organization } from '@/data/mock';

export default async function WelcomePage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/home');
  }
  return (
    <Screen>
      <div className='flex-1 bg-brand-strong flex flex-col items-center justify-center text-center px-8 py-14'>
        <div className='w-[60px] h-[60px] rounded-2xl bg-white flex items-center justify-center mb-4'>
          <span className='text-xl font-semibold text-brand-strong'>
            {organization.logoInitials}
          </span>
        </div>
        <p className='text-white text-xl font-medium mb-2'>
          {organization.name}
        </p>
        <p className='text-brand-soft text-sm leading-relaxed max-w-[220px]'>
          Notices, elections, and dues for your community — all in one place.
        </p>
      </div>

      <div className='px-6 py-6'>
        <Link href='/login'>
          <button className='w-full bg-brand text-on-brand rounded-xl py-3.5 text-sm font-medium mb-2.5'>
            Sign in
          </button>
        </Link>
        <Link href='/login'>
          <button className='w-full bg-surface-muted text-ink rounded-xl py-3.5 text-sm font-medium mb-4'>
            Create an account
          </button>
        </Link>
        <p className='text-center text-[10.5px] text-ink-muted'>
          Powered by Baloy
        </p>
      </div>
    </Screen>
  );
}
