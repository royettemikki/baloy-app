'use client';

import { useState } from 'react';
import AnnouncementCard from './AnnouncementCard';
import { ANNOUNCEMENT_TAGS, AnnouncementTag } from '@/constants/announcementTags';
import { Announcement } from '@/types/announcement';

export default function AnnouncementsList({ announcements }: { announcements: Announcement[] }) {
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<AnnouncementTag | 'All'>('All');

  const filtered = announcements.filter((announcement) => {
    const search = query.toLowerCase();
    const matchesQuery = announcement.title.toLowerCase().includes(search) || announcement.body.toLowerCase().includes(search);
    return matchesQuery && (tagFilter === 'All' || announcement.tag === tagFilter);
  });

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-surface p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <select
          value={tagFilter}
          onChange={(event) => setTagFilter(event.target.value as AnnouncementTag | 'All')}
          aria-label="Filter announcements by category"
          className="w-full rounded-xl bg-surface-muted px-3.5 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30 sm:max-w-[220px]"
        >
          <option value="All">All categories</option>
          {Object.keys(ANNOUNCEMENT_TAGS).map((tag) => <option key={tag} value={tag}>{tag}</option>)}
        </select>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search announcements"
          aria-label="Search announcements"
          className="w-full rounded-xl bg-surface-muted px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-muted focus:ring-2 focus:ring-brand/30 sm:max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-surface px-6 py-10 text-center shadow-sm">
          <p className="text-sm font-semibold text-ink">No announcements found</p>
          <p className="mt-1 text-xs text-ink-muted">Try another search or category filter.</p>
          {(query || tagFilter !== 'All') && (
            <button onClick={() => { setQuery(''); setTagFilter('All'); }} className="mt-4 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-on-brand">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((announcement) => <AnnouncementCard key={announcement.id} announcement={announcement} />)}
        </div>
      )}
    </div>
  );
}
