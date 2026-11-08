import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NoticeDetailContent from '@/components/NoticeDetailContent';

export default async function AnnouncementDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const id = Number(params.id);
  const now = new Date();
  const announcement = id
    ? await prisma.announcement.findFirst({
        where: {
          id,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
            { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
          ],
        },
      })
    : null;

  if (!announcement) {
    notFound();
  }

  return (
    <div className="animate-fadeInUp">
      <Link href="/notices" className="mb-4 inline-block text-sm font-medium text-brand">
        ← Notices
      </Link>
      <NoticeDetailContent
        announcement={{
          title: announcement.title,
          body: announcement.body,
          tag: announcement.tag,
          postedBy: announcement.postedBy,
          postedAt: announcement.postedAt.toISOString(),
          imageUrl: announcement.imageUrl,
        }}
      />
    </div>
  );
}
