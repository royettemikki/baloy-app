'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { IconUser } from '@/components/Icons';

export default function AdminHeader({
  title,
  fullName,
}: {
  title: string;
  fullName: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className='flex items-center justify-between bg-surface border-b border-line px-8 py-3.5'>
      <p className='text-sm text-ink-soft'>{title}</p>

      <div className='relative'>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className='flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-surface-muted'
        >
          <div className='w-8 h-8 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center text-[11px] font-semibold'>
            {initials}
          </div>
        </button>

        {menuOpen && (
          <>
            <div
              className='fixed inset-0 z-40'
              onClick={() => setMenuOpen(false)}
            />
            <div className='absolute right-0 top-full mt-2 w-48 bg-surface border border-line rounded-xl shadow-lg py-1.5 z-50'>
              <div className='px-3.5 py-2 border-b border-line'>
                <p className='text-sm font-medium'>{fullName}</p>
                <p className='text-xs text-ink-muted flex items-center gap-1'>
                  <IconUser width={11} height={11} /> Administrator
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className='w-full text-left px-3.5 py-2 text-sm text-danger'
              >
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
