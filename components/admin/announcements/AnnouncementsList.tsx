'use client';

import { useState } from 'react';
import AnnouncementCard from './AnnouncementCard';
import { ANNOUNCEMENT_TAGS, AnnouncementTag } from '@/constants/announcementTags';

type Announcement = {
  id: number;
  title: string;
  body: string;
  tag: AnnouncementTag;
  pinned: boolean;
  postedBy: string;
  postedAt: string;
};

export default function AnnouncementsList({ announcements }: { announcements: Announcement[] }) {
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<AnnouncementTag | 'All'>('All');

  const filtered = announcements.filter((a) => {
    const matchesQuery =
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.body.toLowerCase().includes(query.toLowerCase());
    const matchesTag = tagFilter === 'All' || a.tag === tagFilter;
    return matchesQuery && matchesTag;
  });

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search announcements…"
        className="mb-4 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm shadow-sm"
      />

      <div className="mb-6 flex flex-wrap gap-1.5">
        <button
          onClick={() => setTagFilter('All')}
          className={`rounded-pill px-3 py-1.5 text-xs font-medium ${tagFilter === 'All' ? 'bg-brand text-on-brand' : 'bg-surface-muted text-ink-soft'}`}
        >
          All
        </button>
        {Object.keys(ANNOUNCEMENT_TAGS).map((tag) => (
          <button
            key={tag}
            onClick={() => setTagFilter(tag as AnnouncementTag)}
            className={`rounded-pill px-3 py-1.5 text-xs font-medium ${tagFilter === tag ? 'bg-brand text-on-brand' : 'bg-surface-muted text-ink-soft'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">No matching announcements.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      )}
    </div>
  );
}
