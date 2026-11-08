'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconHome,
  IconMegaphone,
  IconBallot,
  IconCard,
  IconUser,
} from './Icons';

const tabs = [
  { href: '/home', label: 'Home', Icon: IconHome },
  { href: '/notices', label: 'Notices', Icon: IconMegaphone },
  { href: '/vote', label: 'Vote', Icon: IconBallot },
  { href: '/dues', label: 'Dues', Icon: IconCard },
  { href: '/profile', label: 'Profile', Icon: IconUser },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center sm:bottom-6 sm:px-4 lg:bottom-8 lg:px-6">
      <nav aria-label="Main navigation" className="resident-bottom-nav pointer-events-auto flex w-full max-w-[1440px] items-center justify-around border-t border-line/70 bg-surface/90 px-2 py-2 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-2xl sm:rounded-b-[26px] sm:border sm:border-line/70">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-colors ${active ? '' : 'hover:bg-surface-hover'}`}
            >
              <Icon
                width={20}
                height={20}
                className={`transition-colors duration-150 ${active ? 'text-brand' : 'text-ink-muted'}`}
              />
              <span
                className={`text-[10.5px] transition-colors duration-150 ${active ? 'text-brand font-medium' : 'text-ink-muted'}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
