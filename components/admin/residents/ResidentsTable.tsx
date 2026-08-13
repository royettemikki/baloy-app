'use client';

import { useState } from 'react';
import CopyInviteLink from './CopyInviteLink';
import { IconCheck, IconCalendar, IconUser } from '@/components/Icons';
import Badge from '@/components/ui/Badge';
import { Resident } from '@/types/resident';
import ResidentActionsMenu from './ResidentActionsMenu';

export default function ResidentsTable({
  homeowners,
  currentAdminId,
}: {
  homeowners: Resident[];
  currentAdminId: string;
}) {
  const [query, setQuery] = useState('');

  const filtered = homeowners.filter((h) => {
    const q = query.toLowerCase();
    return (
      h.fullName.toLowerCase().includes(q) ||
      h.email.toLowerCase().includes(q) ||
      h.unit.toLowerCase().includes(q)
    );
  });

  const active = filtered.filter((h) => h.passwordHash);
  const pending = filtered.filter((h) => !h.passwordHash);

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newThisWeek = homeowners.filter((h) => new Date(h.createdAt).getTime() > oneWeekAgo).length;
  const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
  const stalePending = homeowners.filter(
    (h) => !h.passwordHash && h.invitedAt && new Date(h.invitedAt).getTime() < fiveDaysAgo,
  );

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted">
              <IconUser width={18} height={18} className="text-ink-soft" />
            </div>
            {newThisWeek > 0 && (
              <span className="rounded-pill bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-strong">
                +{newThisWeek} this week
              </span>
            )}
          </div>
          <p className="mb-0.5 text-3xl font-medium">{homeowners.length}</p>
          <p className="text-xs text-ink-muted">Total residents</p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft">
            <IconCheck width={18} height={18} className="text-brand-strong" />
          </div>
          <p className="mb-0.5 text-3xl font-medium text-brand-strong">{active.length}</p>
          <p className="text-xs text-ink-muted">Active accounts</p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-warning-soft">
            <IconCalendar width={18} height={18} className="text-warning" />
          </div>
          <p className="mb-0.5 text-3xl font-medium text-warning">{pending.length}</p>
          <p className="text-xs text-ink-muted">Pending invites</p>
        </div>
      </div>

      {stalePending.length > 0 && (
        <div className="border-warning/20 mb-6 rounded-2xl border bg-warning-soft p-5 shadow-sm">
          <p className="mb-1 text-sm font-medium text-warning">Needs a follow-up</p>
          <p className="mb-3 text-xs text-ink-soft">
            {stalePending.length} invite{stalePending.length === 1 ? '' : 's'} sent 5+ days ago
            still unclaimed.
          </p>
          <div className="flex flex-col gap-2">
            {stalePending.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-lg bg-surface px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{h.fullName}</p>
                  <p className="text-xs text-ink-muted">
                    Unit {h.unit} · invited{' '}
                    {h.invitedAt
                      ? Math.floor((Date.now() - new Date(h.invitedAt).getTime()) / 86400000)
                      : '?'}{' '}
                    days ago
                  </p>
                </div>
                {h.inviteToken && <CopyInviteLink token={h.inviteToken} />}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <div className="border-b border-line p-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or unit…"
            className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm"
          />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-muted">
              <th className="px-5 py-3 font-medium">Resident</th>
              <th className="px-5 py-3 font-medium">Unit</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Invited</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-ink-muted">
                  No matching residents.
                </td>
              </tr>
            )}
            {filtered.map((h) => {
              const initials = h.fullName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();
              return (
                <tr key={h.id} className="transition-colors hover:bg-surface-muted">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accentwarm-soft text-[11px] font-semibold text-accentwarm">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium">{h.fullName}</p>
                        <p className="text-xs text-ink-muted">{h.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-ink-soft">{h.unit}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {h.passwordHash ? (
                        <Badge tone="brand" dot>
                          Active
                        </Badge>
                      ) : (
                        <Badge tone="warning" dot>
                          Pending
                        </Badge>
                      )}
                      {h.isAdmin && <Badge tone="purple">Admin</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-ink-muted">
                    {h.invitedAt
                      ? new Date(h.invitedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <ResidentActionsMenu homeowner={h} currentAdminId={currentAdminId} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
