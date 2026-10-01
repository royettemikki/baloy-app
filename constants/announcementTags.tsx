import {
  IconTool,
  IconParty,
  IconShield,
  IconFileText,
} from '@/components/Icons';

export type AnnouncementTag = 'Maintenance' | 'Event' | 'Safety' | 'Board';

export const ANNOUNCEMENT_TAGS: Record<
  AnnouncementTag,
  { bg: string; fg: string; icon: JSX.Element }
> = {
  Maintenance: {
    bg: 'bg-brand-soft',
    fg: 'text-brand-strong',
    icon: <IconTool width={16} height={16} />,
  },
  Event: {
    bg: 'bg-warning-soft',
    fg: 'text-warning',
    icon: <IconParty width={16} height={16} />,
  },
  Safety: {
    bg: 'bg-danger-soft',
    fg: 'text-danger',
    icon: <IconShield width={16} height={16} />,
  },
  Board: {
    bg: 'bg-surface-muted',
    fg: 'text-ink-soft',
    icon: <IconFileText width={16} height={16} />,
  },
};
