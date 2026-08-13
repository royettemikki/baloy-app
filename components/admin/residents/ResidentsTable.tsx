'use client';

import { useState } from 'react';
import CopyInviteLink from './CopyInviteLink';
import ResidentActionsMenu from './ResidentActionsMenu';
import { IconUser, IconCheck, IconCalendar } from '@/components/Icons';
import { Resident } from '@/types/resident';
import { formatShortDate } from '@/lib/formatDate';

function ResidentBadges({ homeowner }: { homeowner: Resident }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {homeowner.passwordHash ? (
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand-strong">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-strong" /> Active
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-warning-soft px-2.5 py-1 text-[11px] font-medium text-warning">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Pending
        </span>
      )}
      {homeowner.isAdmin && (
        <span className="rounded-pill bg-purple-soft px-2.5 py-1 text-[11px] font-medium text-purple">
          Admin
        </span>
      )}
    </div>
  );
}

function ResidentMobileCard({
  homeowner,
  currentAdminId,
}: {
  homeowner: Resident;
  currentAdminId: string;
}) {
  const initials = homeowner.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="mb-2.5 flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accentwarm-soft text-[11px] font-semibold text-accentwarm">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{homeowner.fullName}</p>
            <p className="truncate text-xs text-ink-muted">{homeowner.email}</p>
          </div>
        </div>
        <ResidentActionsMenu homeowner={homeowner} currentAdminId={currentAdminId} />
      </div>

      <ResidentBadges homeowner={homeowner} />

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <p className="text-xs text-ink-soft">Unit {homeowner.unit}</p>
        <p className="text-xs text-ink-muted">
          {homeowner.invitedAt ? formatShortDate(homeowner.invitedAt) : '—'}
        </p>
      </div>

      {!homeowner.passwordHash && homeowner.inviteToken && (
        <div className="mt-2.5 border-t border-line pt-2.5">
          <CopyInviteLink token={homeowner.inviteToken} />
        </div>
      )}
    </div>
  );
}

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

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, email, or unit…"
        className="mb-4 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm shadow-sm"
      />

      {/* Mobile: card list */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">No matching residents.</p>
        ) : (
          filtered.map((h) => (
            <ResidentMobileCard key={h.id} homeowner={h} currentAdminId={currentAdminId} />
          ))
        )}
      </div>

      {/* Tablet/desktop: real table */}
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface shadow-sm sm:block">
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
                    <ResidentBadges homeowner={h} />
                  </td>
                  <td className="px-5 py-3.5 text-ink-muted">
                    {h.invitedAt ? formatShortDate(h.invitedAt) : '—'}
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
