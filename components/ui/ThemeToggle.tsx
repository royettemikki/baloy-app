'use client';

import { useTheme } from '@/components/ThemeProvider';
import { IconMoon, IconSun } from '@/components/Icons';

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
      className={`theme-toggle ${compact ? 'h-9 w-9' : 'h-10 w-full justify-between px-3'}`}
    >
      <span className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
          {dark ? <IconSun width={14} height={14} /> : <IconMoon width={14} height={14} />}
        </span>
        {!compact && <span>{dark ? 'Light mode' : 'Dark mode'}</span>}
      </span>
      {!compact && <span className="text-xs text-ink-muted">{dark ? 'On' : 'Off'}</span>}
    </button>
  );
}
