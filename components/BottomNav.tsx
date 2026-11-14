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
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 sm:bottom-7 sm:px-4">
      <nav aria-label="Main navigation" className="resident-bottom-nav pointer-events-auto flex w-full max-w-[620px] items-center justify-around rounded-[24px] border border-line/80 bg-surface/90 px-2 py-2 shadow-[0_12px_36px_rgba(15,35,28,0.16)] backdrop-blur-2xl sm:px-3">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-w-14 flex-col items-center gap-0.5 rounded-2xl px-2.5 py-1.5 transition-all duration-200 ${active ? 'bg-brand-soft' : 'hover:bg-surface-hover'}`}
            >
              <span className={`flex h-7 w-10 items-center justify-center rounded-xl transition-colors ${active ? 'text-brand-strong' : 'text-ink-muted'}`}>
                <Icon width={19} height={19} className="transition-colors duration-150" />
              </span>
              <span
                className={`text-[10px] transition-colors duration-150 ${active ? 'font-semibold text-brand-strong' : 'text-ink-muted'}`}
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
