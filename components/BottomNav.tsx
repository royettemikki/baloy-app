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
    <div className='flex justify-around items-center px-2 py-3 border-t border-line'>
      {tabs.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className='flex flex-col items-center gap-0.5 px-2'
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
