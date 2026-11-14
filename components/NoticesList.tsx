'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ANNOUNCEMENT_TAGS } from '@/constants/announcementTags';
import { Announcement } from '@/types/announcement';
import { formatShortDate } from '@/lib/formatDate';
import { IconMegaphone } from '@/components/Icons';
import PageHeader from '@/components/PageHeader';

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
      <PageHeader
        eyebrow="Community updates"
        title="Notices"
        description="Updates and important information from your community."
      />

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('All')}
          aria-pressed={filter === 'All'}
          className={`whitespace-nowrap rounded-pill px-3.5 py-2 text-xs font-semibold transition-colors ${
            filter === 'All' ? 'bg-brand text-on-brand shadow-sm' : 'border border-line/70 bg-surface text-ink-soft hover:bg-surface-hover'
          }`}
        >
          All
        </button>
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            aria-pressed={filter === tag}
            className={`whitespace-nowrap rounded-pill px-3.5 py-2 text-xs font-semibold transition-colors ${
              filter === tag ? 'bg-brand text-on-brand shadow-sm' : 'border border-line/70 bg-surface text-ink-soft hover:bg-surface-hover'
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

      {visible.length > 0 && (
        <div key={filter} className="space-y-3 animate-fadeInUp">
          {visible.map((a) => (
            <Link
              key={a.id}
              href={`/notices/${a.id}`}
              className="group flex gap-3 rounded-[22px] border border-line/70 bg-surface p-4 shadow-[0_10px_30px_-25px_var(--overlay-strong)] transition-all hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_16px_34px_-24px_var(--brand)] sm:p-5"
            >
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${ANNOUNCEMENT_TAGS[a.tag].bg} ${ANNOUNCEMENT_TAGS[a.tag].fg}`}
              >
                {ANNOUNCEMENT_TAGS[a.tag].icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{a.title}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${ANNOUNCEMENT_TAGS[a.tag].bg} ${ANNOUNCEMENT_TAGS[a.tag].fg}`}>
                    {a.tag}
                  </span>
                </div>
                <p className="mb-2 text-xs leading-relaxed text-ink-soft">
                  {a.body.length > 90 ? `${a.body.slice(0, 90)}…` : a.body}
                </p>
                <p className="text-[11px] text-ink-muted">
                  {a.postedBy} · {formatShortDate(a.postedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
