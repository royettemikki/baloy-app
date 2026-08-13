import { prisma } from '@/lib/prisma';
import AnnouncementsList from '@/components/admin/announcements/AnnouncementsList';
import NewAnnouncementButton from '@/components/admin/announcements/NewAnnouncementButton';

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: 'desc' }, { postedAt: 'desc' }],
  });

  const serialized = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    tag: a.tag,
    pinned: a.pinned,
    postedBy: a.postedBy,
    postedAt: a.postedAt.toISOString(),
    imageUrl: a.imageUrl,
    startsAt: a.startsAt?.toISOString() ?? null,
    expiresAt: a.expiresAt?.toISOString() ?? null,
  }));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">Create, edit, and pin announcements for residents.</p>
        <NewAnnouncementButton />
      </div>
      <AnnouncementsList announcements={serialized} />
    </div>
  );
}
