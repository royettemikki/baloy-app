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
      <div className="flex flex-1 flex-col items-center justify-center bg-brand-strong px-8 py-14 text-center">
        <div className="mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-on-brand-surface">
          <span className="text-xl font-semibold text-brand-strong">
            {organization.logoInitials}
          </span>
        </div>
        <p className="mb-2 text-xl font-medium text-on-brand">{organization.name}</p>
        <p className="max-w-[220px] text-sm leading-relaxed text-brand-soft">
          Notices, elections, and dues for your community — all in one place.
        </p>
      </div>

      <div className="px-6 py-6">
        <Link href="/login">
          <button className="mb-2.5 w-full rounded-xl bg-brand py-3.5 text-sm font-medium text-on-brand">
            Sign in
          </button>
        </Link>
        <Link href="/login">
          <button className="mb-4 w-full rounded-xl bg-surface-muted py-3.5 text-sm font-medium text-ink">
            Create an account
          </button>
        </Link>
      </div>
    </Screen>
  );
}
