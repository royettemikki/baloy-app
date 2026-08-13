'use client';

import AnnouncementForm from './AnnouncementForm';
import { IconX } from '@/components/Icons';
import { AnnouncementTag } from '@/constants/announcementTags';

type Announcement = {
  id: number;
  title: string;
  body: string;
  tag: AnnouncementTag;
  pinned: boolean;
  postedBy: string;
  imageUrl: string | null;
  startsAt: string | null;
  expiresAt: string | null;
};

export default function EditAnnouncementPanel({
  announcement,
  onClose,
}: {
  announcement: Announcement;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex animate-fadeIn justify-end bg-black/30"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="no-scrollbar h-full w-full max-w-sm animate-slideInRight overflow-y-auto bg-surface p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium">Edit announcement</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted"
          >
            <IconX width={14} height={14} className="text-ink-soft" />
          </button>
        </div>
        <AnnouncementForm initial={announcement} onDone={onClose} />
      </div>
    </div>
  );
}
