import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import NoticeDetailContent from '@/components/NoticeDetailContent';

export default async function AnnouncementDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const announcement = id ? await prisma.announcement.findUnique({ where: { id } }) : null;

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
