'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { IconUser, IconMenu } from '@/components/Icons';

export default function AdminHeader({
  title,
  fullName,
  onMenuClick,
}: {
  title: string;
  fullName: string;
  onMenuClick: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-3.5 md:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg hover:bg-surface-muted md:hidden"
        >
          <IconMenu width={18} height={18} className="text-ink-soft" />
        </button>
        <p className="text-sm text-ink-soft">{title}</p>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 hover:bg-surface-muted"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand-strong">
            {initials}
          </div>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-line bg-surface py-1.5 shadow-lg">
              <div className="border-b border-line px-3.5 py-2">
                <p className="text-sm font-medium">{fullName}</p>
                <p className="flex items-center gap-1 text-xs text-ink-muted">
                  <IconUser width={11} height={11} /> Administrator
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full px-3.5 py-2 text-left text-sm text-danger"
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
