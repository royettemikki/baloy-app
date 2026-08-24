'use client';

import { useState, useEffect } from 'react';

type Unit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

const UNIT_TO_HOURS: Record<Unit, number> = {
  minutes: 1 / 60,
  hours: 1,
  days: 24,
  weeks: 24 * 7,
  months: 24 * 30,
  years: 24 * 365,
};

export default function DurationInput({
  label,
  helperText,
  defaultAmount,
  defaultUnit,
  onChange,
}: {
  label: string;
  helperText?: string;
  defaultAmount: number;
  defaultUnit: Unit;
  onChange: (hours: number) => void;
}) {
  const [amount, setAmount] = useState(String(defaultAmount));
  const [unit, setUnit] = useState<Unit>(defaultUnit);

  useEffect(() => {
    const parsed = parseFloat(amount);
    onChange(isNaN(parsed) ? 0 : parsed * UNIT_TO_HOURS[unit]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, unit]);

  return (
    <div>
      <label className="mb-1.5 block text-[11px] text-ink-soft">{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          step="any"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm"
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as Unit)}
          className="rounded-xl border border-line bg-surface px-3 py-2.5 text-sm"
        >
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
          <option value="weeks">Weeks</option>
          <option value="months">Months</option>
          <option value="years">Years</option>
        </select>
      </div>
      {helperText && <p className="mt-1 text-[11px] text-ink-muted">{helperText}</p>}
    </div>
  );
}
