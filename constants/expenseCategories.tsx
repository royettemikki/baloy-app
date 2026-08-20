import {
  IconTool,
  IconBolt,
  IconShield,
  IconLeaf,
  IconUser,
  IconParty,
  IconCard,
  IconDots,
} from '@/components/Icons';

export type ExpenseCategory =
  | 'Maintenance'
  | 'Utilities'
  | 'Security'
  | 'Landscaping'
  | 'Administrative'
  | 'SocialAndCultural'
  | 'ReserveFund'
  | 'Other';

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  Maintenance: 'Maintenance',
  Utilities: 'Utilities',
  Security: 'Security',
  Landscaping: 'Landscaping',
  Administrative: 'Administrative',
  SocialAndCultural: 'Social & Cultural',
  ReserveFund: 'Reserve Fund',
  Other: 'Other',
};

export const EXPENSE_CATEGORIES: Record<
  ExpenseCategory,
  { bg: string; fg: string; icon: JSX.Element }
> = {
  Maintenance: {
    bg: 'bg-brand-soft',
    fg: 'text-brand-strong',
    icon: <IconTool width={16} height={16} />,
  },
  Utilities: {
    bg: 'bg-warning-soft',
    fg: 'text-warning',
    icon: <IconBolt width={16} height={16} />,
  },
  Security: {
    bg: 'bg-danger-soft',
    fg: 'text-danger',
    icon: <IconShield width={16} height={16} />,
  },
  Landscaping: {
    bg: 'bg-brand-soft',
    fg: 'text-brand-strong',
    icon: <IconLeaf width={16} height={16} />,
  },
  Administrative: {
    bg: 'bg-surface-muted',
    fg: 'text-ink-soft',
    icon: <IconUser width={16} height={16} />,
  },
  SocialAndCultural: {
    bg: 'bg-purple-soft',
    fg: 'text-purple',
    icon: <IconParty width={16} height={16} />,
  },
  ReserveFund: {
    bg: 'bg-accentwarm-soft',
    fg: 'text-accentwarm',
    icon: <IconCard width={16} height={16} />,
  },
  Other: { bg: 'bg-surface-muted', fg: 'text-ink-soft', icon: <IconDots width={16} height={16} /> },
};
