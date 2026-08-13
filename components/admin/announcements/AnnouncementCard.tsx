'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { togglePinAction } from '@/app/actions/announcements';
import { ANNOUNCEMENT_TAGS } from '@/constants/announcementTags';
import { Announcement } from '@/types/announcement';
import AnnouncementActionsMenu from './AnnouncementActionsMenu';
import NoticePreviewModal from './NoticePreviewModal';
import { IconEye } from '@/components/Icons';

function getScheduleStatus(a: Announcement) {
  const now = Date.now();
  if (a.expiresAt && new Date(a.expiresAt).getTime() < now)
    return { label: 'Expired', tone: 'danger' as const };
  if (a.startsAt && new Date(a.startsAt).getTime() > now)
    return { label: 'Scheduled', tone: 'purple' as const };
  return null;
}

export default function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const [pending, startTransition] = useTransition();
  const [previewOpen, setPreviewOpen] = useState(false);
  const router = useRouter();
  const tagStyle = ANNOUNCEMENT_TAGS[announcement.tag];
  const status = getScheduleStatus(announcement);

  function handleTogglePin() {
    startTransition(async () => {
      await togglePinAction(announcement.id);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <button
        onClick={() => setPreviewOpen(true)}
        className="relative mb-3 block h-36 w-full overflow-hidden rounded-xl"
      >
        {announcement.imageUrl ? (
          <img
            src={announcement.imageUrl}
            alt=""
            className="h-full w-full scale-110 object-cover blur-lg"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${tagStyle.bg}`}>
            <div className={`h-12 w-12 ${tagStyle.fg}`}>{tagStyle.icon}</div>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <span className="flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-white">
            <IconEye width={14} height={14} /> Preview notice
          </span>
        </div>
      </button>

      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${tagStyle.bg} ${tagStyle.fg}`}
          >
            {tagStyle.icon}
          </div>
          {status && (
            <span
              className={`rounded-pill px-2 py-0.5 text-[11px] font-medium ${status.tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-purple-soft text-purple'}`}
            >
              {status.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleTogglePin}
            disabled={pending}
            className={`rounded-pill px-2.5 py-1 text-xs font-medium ${announcement.pinned ? 'bg-brand-soft text-brand-strong' : 'bg-surface-muted text-ink-muted'}`}
          >
            {announcement.pinned ? 'Pinned' : 'Pin'}
          </button>
          <AnnouncementActionsMenu announcement={announcement} />
        </div>
      </div>

      <p className="mb-1.5 text-sm font-medium">{announcement.title}</p>
      <p className="mb-3 text-sm leading-relaxed text-ink-soft">{announcement.body}</p>
      <p className="text-xs text-ink-muted">
        {announcement.postedBy} ·{' '}
        {new Date(announcement.postedAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>

      {previewOpen && (
        <NoticePreviewModal
          announcement={{
            title: announcement.title,
            body: announcement.body,
            tag: announcement.tag,
            postedBy: announcement.postedBy,
            postedAt: announcement.postedAt,
            imageUrl: announcement.imageUrl,
          }}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}
