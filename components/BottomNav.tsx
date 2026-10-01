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
    <div className='flex items-center justify-around border-t border-line bg-surface/95 px-2 py-2.5 backdrop-blur'>
      {tabs.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-colors ${active ? 'bg-brand-soft' : 'hover:bg-surface-hover'}`}
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
    </div>
  );
}
