'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconGrid,
  IconUser,
  IconMegaphone,
  IconBallot,
  IconCard,
  IconFileText,
  IconBarChart,
  IconTrash,
} from '@/components/Icons';

type Counts = {
  pendingInvites: number;
  pendingPayments: number;
  pendingExpenses: number;
};

function getGroups(isDev: boolean, counts: Counts) {
  const main = [
    { href: '/admin', label: 'Dashboard', Icon: IconGrid },
    { href: '/admin/announcements', label: 'Announcements', Icon: IconMegaphone },
    { href: '/admin/elections', label: 'Elections', Icon: IconBallot },
  ];
  const manage = [
    { href: '/admin/invites', label: 'Residents', Icon: IconUser, badge: counts.pendingInvites },
    { href: '/admin/payments', label: 'Payments', Icon: IconCard, badge: counts.pendingPayments },
    { href: '/admin/expenses', label: 'Expenses', Icon: IconFileText, badge: counts.pendingExpenses },
    { href: '/admin/reports', label: 'Reports', Icon: IconBarChart },
  ];
  return {
    main,
    manage: isDev
      ? [...manage, { href: '/admin/dev-tools', label: 'Dev Tools', Icon: IconTrash }]
      : manage,
  };
}

export default function AdminSidebar({
  isDev,
  mobileOpen,
  onClose,
  counts,
}: {
  isDev: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  counts: Counts;
}) {
  const pathname = usePathname();
  const { main, manage } = getGroups(isDev, counts);

  const renderLink = ({
    href,
    label,
    Icon,
    badge,
  }: {
    href: string;
    label: string;
    Icon: any;
    badge?: number;
  }) => {
    const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        onClick={onClose}
        className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 ${
          active
            ? 'bg-brand font-medium text-on-brand shadow-sm'
            : 'text-ink-soft hover:translate-x-0.5 hover:bg-surface-hover hover:text-ink'
        }`}
      >
        <Icon width={16} height={16} />
        <span className="flex-1">{label}</span>
        {!!badge && (
          <span
            className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
              active ? 'bg-on-brand-subtle text-on-brand' : 'bg-surface-muted text-ink-soft'
            }`}
          >            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-overlay md:hidden" onClick={onClose} />}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen min-h-screen w-[240px] flex-shrink-0 flex-col border-r border-line bg-surface px-3 py-5 transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-7 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand-strong ring-1 ring-brand/10">
            <IconGrid width={16} height={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Makiling Hills</p>
            <p className="text-xs text-ink-muted">Woodlands · Admin</p>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Main</p>
          {main.map(renderLink)}

          <p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Manage
          </p>
          {manage.map(renderLink)}
        </nav>
      </aside>
    </>
  );
}
