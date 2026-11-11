import Link from 'next/link';
import Screen from '@/components/Screen';
import { organization } from '@/data/mock';

export default function NotFound() {
  return (
    <Screen>
      <div className="flex flex-col items-center justify-center bg-brand-strong px-8 py-11">
        <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-on-brand-surface">
          <span className="text-lg font-semibold text-brand-strong">
            {organization.logoInitials}
          </span>
        </div>
        <p className="mb-1 text-lg font-medium text-on-brand">{organization.name}</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <p className="mb-2 text-5xl font-semibold text-ink-muted">404</p>
        <p className="mb-1.5 text-base font-medium">Page not found</p>
        <p className="mb-6 text-sm text-ink-soft">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link href="/home">
          <button className="rounded-xl bg-brand px-6 py-3 text-sm font-medium text-on-brand">
            Back to home
          </button>
        </Link>
      </div>
    </Screen>
  );
}
