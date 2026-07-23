import { prisma } from '@/lib/prisma';
import NoticesList from '@/components/NoticesList';

export default async function NoticesPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: 'desc' }, { postedAt: 'desc' }],
  });

  const serialized = announcements.map((a) => ({
    ...a,
    postedAt: a.postedAt.toISOString(),
  }));

  return <NoticesList announcements={serialized} />;
}
