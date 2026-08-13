'use client';

import { useState } from 'react';
import CopyInviteLink from './CopyInviteLink';
import ResidentActionsMenu from './ResidentActionsMenu';
import { IconUser, IconCheck, IconCalendar } from '@/components/Icons';
import { Resident } from '@/types/resident';

function ResidentBadges({ homeowner }: { homeowner: Resident }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {homeowner.passwordHash ? (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-strong bg-brand-soft px-2.5 py-1 rounded-pill">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-strong" /> Active
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-warning bg-warning-soft px-2.5 py-1 rounded-pill">
          <span className="w-1.5 h-1.5 rounded-full bg-warning" /> Pending
        </span>
      )}
      {homeowner.isAdmin && (
        <span className="text-[11px] font-medium text-purple bg-purple-soft px-2.5 py-1 rounded-pill">Admin</span>
      )}
    </div>
  );
}

function ResidentMobileCard({ homeowner, currentAdminId }: { homeowner: Resident; currentAdminId: string }) {
  const initials = homeowner.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-accentwarm-soft text-accentwarm flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{homeowner.fullName}</p>
            <p className="text-xs text-ink-muted truncate">{homeowner.email}</p>
          </div>
        </div>
        <ResidentActionsMenu homeowner={homeowner} currentAdminId={currentAdminId} />
      </div>

      <ResidentBadges homeowner={homeowner} />

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
        <p className="text-xs text-ink-soft">Unit {homeowner.unit}</p>
        <p className="text-xs text-ink-muted">
          {homeowner.invitedAt
            ? new Date(homeowner.invitedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            : '—'}
        </p>
      </div>

      {!homeowner.passwordHash && homeowner.inviteToken && (
        <div className="mt-2.5 pt-2.5 border-t border-line">
          <CopyInviteLink token={homeowner.inviteToken} />
        </div>
      )}
    </div>
  );
}

export default function ResidentsTable({ homeowners, currentAdminId }: { homeowners: Resident[]; currentAdminId: string }) {
  const [query, setQuery] = useState('');

  const filtered = homeowners.filter((h) => {
    const q = query.toLowerCase();
    return h.fullName.toLowerCase().includes(q) || h.email.toLowerCase().includes(q) || h.unit.toLowerCase().includes(q);
  });

  const active = filtered.filter((h) => h.passwordHash);
  const pending = filtered.filter((h) => !h.passwordHash);

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newThisWeek = homeowners.filter((h) => new Date(h.createdAt).getTime() > oneWeekAgo).length;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-surface-muted flex items-center justify-center">
              <IconUser width={18} height={18} className="text-ink-soft" />
            </div>
            {newThisWeek > 0 && (
              <span className="text-[11px] font-medium text-brand-strong bg-brand-soft px-2 py-0.5 rounded-pill">
                +{newThisWeek} this week
              </span>
            )}
          </div>
          <p className="text-3xl font-medium mb-0.5">{homeowners.length}</p>
          <p className="text-xs text-ink-muted">Total residents</p>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-brand-soft flex items-center justify-center mb-3">
            <IconCheck width={18} height={18} className="text-brand-strong" />
          </div>
          <p className="text-3xl font-medium text-brand-strong mb-0.5">{active.length}</p>
          <p className="text-xs text-ink-muted">Active accounts</p>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-warning-soft flex items-center justify-center mb-3">
            <IconCalendar width={18} height={18} className="text-warning" />
          </div>
          <p className="text-3xl font-medium text-warning mb-0.5">{pending.length}</p>
          <p className="text-xs text-ink-muted">Pending invites</p>
        </div>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, email, or unit…"
        className="w-full border border-line rounded-xl px-4 py-2.5 text-sm mb-4 bg-surface shadow-sm"
      />

      {/* Mobile: card list */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-ink-muted text-center py-8">No matching residents.</p>
        ) : (
          filtered.map((h) => <ResidentMobileCard key={h.id} homeowner={h} currentAdminId={currentAdminId} />)
        )}
      </div>

      {/* Tablet/desktop: real table */}
      <div className="hidden sm:block bg-surface border border-line rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] text-ink-muted uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Resident</th>
              <th className="px-5 py-3 font-medium">Unit</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Invited</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-ink-muted py-8">
                  No matching residents.
                </td>
              </tr>
            )}
            {filtered.map((h) => {
              const initials = h.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
              return (
                <tr key={h.id} className="hover:bg-surface-muted transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accentwarm-soft text-accentwarm flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
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
                    {h.invitedAt ? new Date(h.invitedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
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