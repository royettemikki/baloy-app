'use client';

import { useState } from 'react';
import { AnnouncementTag } from '@/data/mock';
import {
  IconTool,
  IconParty,
  IconShield,
  IconFileText,
} from '@/components/Icons';

const TAGS: AnnouncementTag[] = ['Maintenance', 'Event', 'Safety', 'Board'];

const TAG_STYLE: Record<
  AnnouncementTag,
  { bg: string; fg: string; icon: JSX.Element }
> = {
  Maintenance: {
    bg: 'bg-brand-soft',
    fg: 'text-brand-strong',
    icon: <IconTool width={16} height={16} />,
  },
  Event: {
    bg: 'bg-warning-soft',
    fg: 'text-warning',
    icon: <IconParty width={16} height={16} />,
  },
  Safety: {
    bg: 'bg-danger-soft',
    fg: 'text-danger',
    icon: <IconShield width={16} height={16} />,
  },
  Board: {
    bg: 'bg-surface-muted',
    fg: 'text-ink-soft',
    icon: <IconFileText width={16} height={16} />,
  },
};

type Announcement = {
  id: number;
  title: string;
  body: string;
  tag: AnnouncementTag;
  pinned: boolean;
  postedBy: string;
  postedAt: string;
};

export default function NoticesList({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const [filter, setFilter] = useState<AnnouncementTag | 'All'>('All');
  const visible = announcements.filter(
    (a) => filter === 'All' || a.tag === filter,
  );

  return (
    <div>
      <h1 className='text-xl font-medium mb-3.5'>Notices</h1>

      <div className='flex gap-1.5 mb-4 overflow-x-auto pb-1'>
        <button
          onClick={() => setFilter('All')}
          className={`text-xs font-medium px-3 py-1.5 rounded-pill whitespace-nowrap ${
            filter === 'All'
              ? 'bg-brand text-on-brand'
              : 'bg-surface-muted text-ink-soft'
          }`}
        >
          All
        </button>
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`text-xs font-medium px-3 py-1.5 rounded-pill whitespace-nowrap ${
              filter === tag
                ? 'bg-brand text-on-brand'
                : 'bg-surface-muted text-ink-soft'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <p className='text-sm text-ink-muted'>Nothing in this category yet.</p>
      )}

      {visible.map((a) => (
        <div
          key={a.id}
          className='flex gap-2.5 p-3.5 rounded-2xl mb-2.5 bg-surface-muted last:mb-0'
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${TAG_STYLE[a.tag].bg} ${TAG_STYLE[a.tag].fg}`}
          >
            {TAG_STYLE[a.tag].icon}
          </div>
          <div className='flex-1'>
            <p className='text-sm font-medium mb-0.5'>{a.title}</p>
            <p className='text-xs text-ink-soft mb-1.5 leading-relaxed'>
              {a.body}
            </p>
            <p className='text-[11px] text-ink-muted'>
              {a.postedBy} ·{' '}
              {new Date(a.postedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
