'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ANNOUNCEMENT_TAGS } from '@/constants/announcementTags';
import { Announcement } from '@/types/announcement';
import { formatShortDate } from '@/lib/formatDate';
import { IconMegaphone } from '@/components/Icons';

type ListAnnouncement = Pick<
  Announcement,
  'id' | 'title' | 'body' | 'tag' | 'pinned' | 'postedBy' | 'postedAt'
>;

const TAGS: Array<ListAnnouncement['tag']> = ['Maintenance', 'Event', 'Safety', 'Board'];

export default function NoticesList({ announcements }: { announcements: ListAnnouncement[] }) {
  const [filter, setFilter] = useState<ListAnnouncement['tag'] | 'All'>('All');
  const visible = announcements.filter((a) => filter === 'All' || a.tag === filter);

  return (
    <div>
      <header className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-strong">Community updates</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Notices</h1>
        <p className="mt-1 text-sm text-ink-soft">Updates and important information from your community.</p>
      </header>

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
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-soft via-surface to-accentwarm-soft/60 px-6 py-10 text-center shadow-sm sm:py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-on-brand shadow-sm">
            <IconMegaphone width={27} height={27} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-strong">
            {announcements.length === 0 ? 'All quiet for now' : 'Nothing in this category'}
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink">
            {announcements.length === 0 ? 'No notices to show' : `No ${filter.toLowerCase()} notices`}
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
            {announcements.length === 0
              ? 'When your community shares an update, it will appear here.'
              : 'There are no updates in this category right now. Try another category to see what’s new.'}
          </p>
          {announcements.length > 0 && filter !== 'All' && (
            <button
              onClick={() => setFilter('All')}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-brand px-5 text-xs font-semibold text-on-brand transition hover:bg-brand-strong"
            >
              View all notices
            </button>
          )}
        </div>
      )}

      {visible.map((a) => (
        <Link
          key={a.id}
          href={`/notices/${a.id}`}
          className="mb-2.5 flex gap-2.5 rounded-2xl bg-surface-muted p-3.5 shadow-sm last:mb-0"
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
              {a.postedBy} · {formatShortDate(a.postedAt)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
