'use client';

import { useState } from 'react';
import ExportCsvButton from './ExportCsvButton';

type Row = {
  id: string;
  fullName: string;
  unit: string;
  email: string;
  owed: number;
  status: 'Paid up' | 'Overdue' | 'Outstanding';
};

export default function ComplianceTable({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState('');

  const filtered = rows.filter((r) => {
    const q = query.toLowerCase();
    return (
      r.fullName.toLowerCase().includes(q) ||
      r.unit.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q)
    );
  });

  const csvRows = filtered.map((r) => [r.fullName, r.unit, r.email, r.owed.toFixed(2), r.status]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">Who's paid up and who isn't, ranked by amount owed.</p>
        <ExportCsvButton
          filename="dues-compliance-report.csv"
          headers={['Name', 'Unit', 'Email', 'Amount Owed', 'Status']}
          rows={csvRows}
        />
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, unit, or email…"
        className="mb-4 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm shadow-sm"
      />

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3 font-medium">Resident</th>
              <th className="px-5 py-3 font-medium">Unit</th>
              <th className="px-5 py-3 text-right font-medium">Amount owed</th>
              <th className="px-5 py-3 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-ink-muted">
                  No matching residents.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-surface-muted">
                <td className="px-5 py-3.5">
                  <p className="font-medium">{r.fullName}</p>
                  <p className="text-xs text-ink-muted">{r.email}</p>
                </td>
                <td className="px-5 py-3.5 text-ink-soft">{r.unit}</td>
                <td className="px-5 py-3.5 text-right">₱{r.owed.toFixed(2)}</td>
                <td className="px-5 py-3.5 text-right">
                  <span
                    className={`rounded-pill px-2.5 py-1 text-[11px] font-medium ${
                      r.status === 'Paid up'
                        ? 'bg-brand-soft text-brand-strong'
                        : r.status === 'Overdue'
                          ? 'bg-danger-soft text-danger'
                          : 'bg-warning-soft text-warning'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
