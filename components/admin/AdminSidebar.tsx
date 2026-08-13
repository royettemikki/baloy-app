'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconUser, IconMegaphone, IconBallot, IconCard, IconTrash } from '@/components/Icons';

function getLinks(isDev: boolean) {
  const base = [
    { href: '/admin/invites', label: 'Residents', Icon: IconUser },
    { href: '/admin/announcements', label: 'Announcements', Icon: IconMegaphone },
    { href: '/admin/elections', label: 'Elections', Icon: IconBallot },
    { href: '/admin/payments', label: 'Payments', Icon: IconCard },
  ];
  return isDev
    ? [...base, { href: '/admin/dev-tools', label: 'Dev Tools', Icon: IconTrash }]
    : base;
}

export default function AdminSidebar({ isDev }: { isDev: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-[240px] flex-shrink-0 flex-col border-r border-line bg-surface px-4 py-6">
      <div className="mb-8 px-2">
        <p className="text-sm font-semibold">Makiling Hills</p>
        <p className="text-xs text-ink-muted">Woodlands Subdivision</p>
      </div>

      <nav className="flex flex-col gap-0.5">
        <p className="mb-1.5 px-3 text-[10.5px] uppercase tracking-wide text-ink-muted">Manage</p>
        {getLinks(isDev).map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${
                active
                  ? 'bg-brand-soft font-medium text-brand-strong'
                  : 'text-ink-soft hover:bg-surface-muted'
              }`}
            >
              <Icon width={16} height={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
