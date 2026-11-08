'use client';

import { useEffect, useState } from 'react';

function computeRemaining(targetIso: string): string | null {
  const diffMs = new Date(targetIso).getTime() - Date.now();
  if (diffMs <= 0) return null;

  let totalSeconds = Math.floor(diffMs / 1000);
  const years = Math.floor(totalSeconds / (365 * 24 * 60 * 60));
  totalSeconds -= years * 365 * 24 * 60 * 60;
  const months = Math.floor(totalSeconds / (30 * 24 * 60 * 60));
  totalSeconds -= months * 30 * 24 * 60 * 60;
  const weeks = Math.floor(totalSeconds / (7 * 24 * 60 * 60));
  totalSeconds -= weeks * 7 * 24 * 60 * 60;
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  totalSeconds -= days * 24 * 60 * 60;
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds -= hours * 3600;
  const minutes = Math.floor(totalSeconds / 60);
  totalSeconds -= minutes * 60;
  const seconds = totalSeconds;

  const units: [number, string][] = [
    [years, 'y'],
    [months, 'mo'],
    [weeks, 'w'],
    [days, 'd'],
    [hours, 'h'],
    [minutes, 'm'],
    [seconds, 's'],
  ];
  const startIndex = units.findIndex(([value]) => value > 0);
  return units
    .slice(startIndex === -1 ? units.length - 1 : startIndex)
    .map(([v, l]) => `${v}${l}`)
    .join(' ');
}

export default function CountdownTimer({
  targetDate,
  activeLabel,
  expiredLabel,
}: {
  targetDate: string;
  activeLabel: string;
  expiredLabel: string;
}) {
  const [remaining, setRemaining] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const tick = () => setRemaining(computeRemaining(targetDate));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (remaining === undefined) return null; // not yet mounted client-side — avoids hydration mismatch
  if (remaining === null) return <span>{expiredLabel}</span>;

  return (
    <span>
      {activeLabel} <span className="font-medium tabular-nums">{remaining}</span>
    </span>
  );
}
