'use client';

import { useState } from 'react';
import { ANNOUNCEMENT_TAGS, AnnouncementTag } from '@/constants/announcementTags';

import Link from 'next/link';

const TAGS: AnnouncementTag[] = ['Maintenance', 'Event', 'Safety', 'Board'];

type Announcement = {
  id: number;
  title: string;
  body: string;
  tag: AnnouncementTag;
  pinned: boolean;
  postedBy: string;
  postedAt: string;
  imageUrl: string | null;
};

export default function NoticesList({ announcements }: { announcements: Announcement[] }) {
  const [filter, setFilter] = useState<AnnouncementTag | 'All'>('All');
  const visible = announcements.filter((a) => filter === 'All' || a.tag === filter);

  return (
    <div className="animate-fadeInUp">
      <h1 className="mb-3.5 text-xl font-medium">Notices</h1>

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('All')}
          className={`whitespace-nowrap rounded-pill px-3 py-1.5 text-xs font-medium ${
            filter === 'All' ? 'bg-brand text-on-brand' : 'bg-surface-muted text-ink-soft'
          }`}
        >
          All
        </button>
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`whitespace-nowrap rounded-pill px-3 py-1.5 text-xs font-medium ${
              filter === tag ? 'bg-brand text-on-brand' : 'bg-surface-muted text-ink-soft'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-ink-muted">Nothing in this category yet.</p>
      )}

      {visible.map((a) => (
        <Link
          key={a.id}
          href={`/notices/${a.id}`}
          className="mb-2.5 flex gap-2.5 rounded-2xl bg-surface-muted p-3.5 last:mb-0"
        >
          <div
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${ANNOUNCEMENT_TAGS[a.tag].bg} ${ANNOUNCEMENT_TAGS[a.tag].fg}`}
          >
            {ANNOUNCEMENT_TAGS[a.tag].icon}
          </div>
          <div className="flex-1">
            <div className="mb-0.5 flex items-center gap-1.5">
              <p className="text-sm font-medium">{a.title}</p>
            </div>
            <p className="mb-1.5 text-xs leading-relaxed text-ink-soft">
              {a.body.length > 90 ? `${a.body.slice(0, 90)}…` : a.body}
            </p>
            <p className="text-[11px] text-ink-muted">
              {a.postedBy} ·{' '}
              {new Date(a.postedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
