import NoticeDetailContent from '@/components/NoticeDetailContent';
import { AnnouncementTag } from '@/constants/announcementTags';
import { IconX } from '@/components/Icons';

type Announcement = {
  title: string;
  body: string;
  tag: AnnouncementTag;
  postedBy: string;
  postedAt: string;
  imageUrl: string | null;
};

export default function NoticePreviewModal({
  announcement,
  onClose,
}: {
  announcement: Announcement;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex animate-fadeIn items-center justify-center bg-black/60 p-6"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center">
        <p className="mb-3 text-xs text-white/70">This is what residents will see on their phone</p>

        <div className="no-scrollbar max-h-[80vh] min-h-[600px] w-[340px] overflow-y-auto rounded-[32px] border-4 border-ink bg-surface p-5">
          <p className="mb-4 text-sm font-medium text-brand">← Notices</p>
          <NoticeDetailContent announcement={announcement} />
        </div>

        <button
          onClick={onClose}
          className="mt-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
        >
          <IconX width={16} height={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}
