import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  IconTool,
  IconParty,
  IconShield,
  IconFileText,
} from '@/components/Icons';

const TAG_ICON: Record<string, JSX.Element> = {
  Maintenance: <IconTool width={16} height={16} />,
  Event: <IconParty width={16} height={16} />,
  Safety: <IconShield width={16} height={16} />,
  Board: <IconFileText width={16} height={16} />,
};

const TAG_STYLE: Record<string, { bg: string; fg: string }> = {
  Maintenance: { bg: 'bg-brand-soft', fg: 'text-brand-strong' },
  Event: { bg: 'bg-warning-soft', fg: 'text-warning' },
  Safety: { bg: 'bg-danger-soft', fg: 'text-danger' },
  Board: { bg: 'bg-surface-muted', fg: 'text-ink-soft' },
};

export default async function AnnouncementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  const announcement = id
    ? await prisma.announcement.findUnique({ where: { id } })
    : null;

  if (!announcement) {
    notFound();
  }

  return (
    <div className='animate-fadeInUp'>
      <Link
        href='/notices'
        className='text-sm text-brand font-medium mb-4 inline-block'
      >
        ← Notices
      </Link>

      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${TAG_STYLE[announcement.tag].bg} ${TAG_STYLE[announcement.tag].fg}`}
      >
        {TAG_ICON[announcement.tag]}
      </div>

      <h1 className='text-xl font-medium mb-1.5'>{announcement.title}</h1>
      <p className='text-xs text-ink-muted mb-4'>
        {announcement.postedBy} ·{' '}
        {announcement.postedAt.toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>

      <p className='text-sm text-ink-soft leading-relaxed'>
        {announcement.body}
      </p>
    </div>
  );
}
