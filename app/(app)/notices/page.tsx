import { prisma } from '@/lib/prisma';
import NoticesList from '@/components/NoticesList';

export default async function NoticesPage() {
  const now = new Date();
  const announcements = await prisma.announcement.findMany({
    where: {
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
      ],
    },
    orderBy: [{ pinned: 'desc' }, { postedAt: 'desc' }],
  });

  const serialized = announcements.map((a) => ({
    ...a,
    postedAt: a.postedAt.toISOString(),
  }));

  return <NoticesList announcements={serialized} />;
}
