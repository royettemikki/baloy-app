import { prisma } from '@/lib/prisma';
import AnnouncementsList from '@/components/admin/announcements/AnnouncementsList';
import NewAnnouncementButton from '@/components/admin/announcements/NewAnnouncementButton';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

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
      <AdminPageHeader
        title="Announcements"
        description="Create, edit, and pin updates for residents."
        action={<NewAnnouncementButton />}
        eyebrow="Community"
      />
      <AnnouncementsList announcements={serialized} />
    </div>
  );
}
