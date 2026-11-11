'use client';

import { useState } from 'react';
import CopyInviteLink from './CopyInviteLink';
import ResidentActionsMenu from './ResidentActionsMenu';
import { Resident } from '@/types/resident';
import { formatShortDate } from '@/lib/formatDate';

function monthlyDuesLabel(homeowner: Resident) {
  if (homeowner.monthlyDuesRate <= 0) return 'Not set';
  if (homeowner.monthlyDuesMode === 'PerArea') {
    if (!homeowner.lotAreaSqm) return 'Lot area missing';
    const monthlyAmount = homeowner.monthlyDuesRate * homeowner.lotAreaSqm;
    return `₱${monthlyAmount.toFixed(2)} / month`;
  }
  return `₱${homeowner.monthlyDuesRate.toFixed(2)} / month`;
}

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
      {homeowner.isPrimaryVoter && (
        <span className="rounded-pill bg-purple-soft px-2.5 py-1 text-[11px] font-medium text-purple">
          Primary voter
        </span>
      )}
      {homeowner.propertyNeedsReview && (
        <span className="rounded-pill bg-warning-soft px-2.5 py-1 text-[11px] font-medium text-warning">
          Review property setup
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
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <div className="mb-2.5 flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand-strong">
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

      <div className="mt-3 rounded-xl bg-surface-muted px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Monthly dues</p>
        <p className="mt-0.5 text-sm font-semibold text-ink">{monthlyDuesLabel(homeowner)}</p>
        <p className="text-[10px] text-ink-muted">{homeowner.duesRateOverride ? 'Custom property rate' : 'Community default'}</p>
        {homeowner.monthlyDuesMode === 'PerArea' && homeowner.lotAreaSqm && <p className="text-[11px] text-ink-muted">{homeowner.lotAreaSqm} m² × ₱{homeowner.monthlyDuesRate.toFixed(2)} / m²</p>}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line/50 pt-3">
        <p className="text-xs text-ink-soft">Unit {homeowner.unit}</p>
        <p className="text-xs text-ink-muted">
          {homeowner.invitedAt ? formatShortDate(homeowner.invitedAt) : '—'}
        </p>
      </div>

      {!homeowner.passwordHash && homeowner.inviteToken && (
        <div className="mt-2.5 border-t border-line/50 pt-2.5">
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
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Pending'>('All');

  const searched = homeowners.filter((h) => {
    const q = query.toLowerCase();
    return (
      h.fullName.toLowerCase().includes(q) ||
      h.email.toLowerCase().includes(q) ||
      h.unit.toLowerCase().includes(q)
    );
  });

  const activeCount = homeowners.filter((h) => h.passwordHash).length;
  const pendingCount = homeowners.length - activeCount;
  const duesUnconfiguredCount = new Set(homeowners.filter((h) =>
    h.passwordHash && (h.monthlyDuesRate <= 0 || (h.monthlyDuesMode === 'PerArea' && !h.lotAreaSqm)),
  ).map((homeowner) => homeowner.propertyId)).size;
  const filtered = searched.filter((h) =>
    statusFilter === 'All' || (statusFilter === 'Active' ? !!h.passwordHash : !h.passwordHash),
  );

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newThisWeek = homeowners.filter((h) => new Date(h.createdAt).getTime() > oneWeekAgo).length;

  return (
    <div>
      <div className="mb-5 grid grid-cols-1 overflow-hidden rounded-2xl bg-surface shadow-sm sm:grid-cols-2 xl:grid-cols-4">
        <div className="p-4 sm:p-5">
          <p className="text-xs font-medium text-ink-muted">Total residents</p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <p className="text-2xl font-semibold tracking-tight text-ink">{homeowners.length}</p>
            {newThisWeek > 0 && <span className="text-[11px] font-medium text-brand-strong">+{newThisWeek} this week</span>}
          </div>
        </div>
        <div className="border-t border-line/50 p-4 sm:border-l sm:border-t-0 sm:p-5">
          <p className="flex items-center gap-2 text-xs font-medium text-ink-muted"><span className="h-2 w-2 rounded-full bg-brand" />Active accounts</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-brand-strong">{activeCount}</p>
        </div>
        <div className="border-t border-line/50 p-4 sm:border-l sm:border-t-0 sm:p-5">
          <p className="flex items-center gap-2 text-xs font-medium text-ink-muted"><span className="h-2 w-2 rounded-full bg-warning" />Pending invites</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-warning">{pendingCount}</p>
        </div>
        <div className="border-t border-line/50 p-4 sm:border-l sm:border-t-0 sm:p-5">
          <p className="flex items-center gap-2 text-xs font-medium text-ink-muted"><span className="h-2 w-2 rounded-full bg-danger" />Dues not set</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-danger">{duesUnconfiguredCount}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-surface p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, email, or unit…"
        aria-label="Search residents by name, email, or unit"
        className="w-full rounded-xl bg-surface-muted px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-muted focus:ring-2 focus:ring-brand/30 sm:order-2 sm:max-w-xs"
      />

        <div className="flex flex-wrap gap-1.5 sm:order-1">
          {(['All', 'Active', 'Pending'] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatusFilter(filter)}
            aria-pressed={statusFilter === filter}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${statusFilter === filter ? 'bg-brand text-on-brand' : 'bg-surface-muted text-ink-soft hover:bg-surface-hover'}`}
          >
            {filter}{filter === 'All' ? ` (${homeowners.length})` : filter === 'Active' ? ` (${activeCount})` : ` (${pendingCount})`}
          </button>
        ))}
        </div>
      </div>

      {/* Mobile: card list */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-surface p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-ink">No residents found</p>
            <p className="mt-1 text-xs text-ink-muted">Try another search or status filter.</p>
            {(query || statusFilter !== 'All') && <button onClick={() => { setQuery(''); setStatusFilter('All'); }} className="mt-4 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-on-brand">Clear filters</button>}
          </div>
        ) : (
          filtered.map((h) => (
            <ResidentMobileCard key={h.id} homeowner={h} currentAdminId={currentAdminId} />
          ))
        )}
      </div>

      {/* Tablet/desktop: real table */}
      <div className="hidden overflow-hidden rounded-2xl bg-surface shadow-sm sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line/50 bg-surface text-left text-[11px] uppercase tracking-[0.1em] text-ink-muted">
              <th className="px-5 py-3.5 font-semibold">Resident</th>
              <th className="px-5 py-3.5 font-semibold">Unit</th>
              <th className="px-5 py-3.5 font-semibold">Monthly dues</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Invited</th>
              <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-ink-muted">
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
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand-strong">
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
                    <p className={`text-sm font-medium ${h.monthlyDuesRate > 0 ? 'text-ink' : 'text-warning'}`}>{monthlyDuesLabel(h)}</p>
                    {h.monthlyDuesMode === 'PerArea' && h.lotAreaSqm && <p className="text-xs text-ink-muted">{h.lotAreaSqm} m² × ₱{h.monthlyDuesRate.toFixed(2)}</p>}
                    <p className="text-[10px] text-ink-muted">{h.duesRateOverride ? 'Custom property rate' : 'Community default'}</p>
                  </td>
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
