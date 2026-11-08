import { ANNOUNCEMENT_TAGS } from '@/constants/announcementTags';
import { Announcement } from '@/types/announcement';
import { formatLongDate } from '@/lib/formatDate';

type Props = {
  announcement: Pick<Announcement, 'title' | 'body' | 'tag' | 'postedBy' | 'postedAt' | 'imageUrl'>;
};

export default function NoticeDetailContent({ announcement }: Props) {
  const tagStyle = ANNOUNCEMENT_TAGS[announcement.tag];

  return (
    <>
      {announcement.imageUrl && (
        <img
          src={announcement.imageUrl}
          alt=""
          className="mx-auto mb-4 h-auto max-h-[65vh] w-auto max-w-full rounded-xl object-contain"
        />
      )}

      <div
        className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${tagStyle.bg} ${tagStyle.fg}`}
      >
        {tagStyle.icon}
      </div>

      <h1 className="mb-1.5 text-xl font-medium">{announcement.title}</h1>
      <p className="mb-4 text-xs text-ink-muted">
        {announcement.postedBy} · {formatLongDate(announcement.postedAt)}
      </p>
      <p className="text-sm leading-relaxed text-ink-soft">{announcement.body}</p>
    </>
  );
}
