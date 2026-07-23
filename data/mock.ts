export const organization = {
  name: 'Makiling Hills - Woodlands',
  logoInitials: 'MW',
};

export const homeowner = {
  fullName: 'Dana Whitfield',
  initials: 'DW',
  unit: '14B',
  email: 'dana.w@example.com',
  phone: '(555) 012-4477',
  emergencyContact: 'Sam W.',
  ownerSince: 2021,
};

export type AnnouncementTag = 'Maintenance' | 'Event' | 'Safety' | 'Board';

export const announcements: {
  id: number;
  title: string;
  body: string;
  tag: AnnouncementTag;
  pinned: boolean;
  postedBy: string;
  postedAt: string;
}[] = [
  {
    id: 1,
    title: 'Pool closed for resurfacing',
    body: 'The main pool will be closed July 24 to 26 while the deck is resealed. The kiddie pool stays open.',
    tag: 'Maintenance',
    pinned: true,
    postedBy: 'Facilities',
    postedAt: '2026-07-20',
  },
  {
    id: 2,
    title: 'Summer block party, Saturday August 9',
    body: 'Grills go up at 4pm in the north lot. Sign up at the clubhouse to bring a dish or lend a table.',
    tag: 'Event',
    pinned: false,
    postedBy: 'Social committee',
    postedAt: '2026-07-18',
  },
  {
    id: 3,
    title: 'Gate code changing August 1',
    body: 'The Birchwood entrance code changes at the start of August. New codes go out by email.',
    tag: 'Safety',
    pinned: false,
    postedBy: 'Security committee',
    postedAt: '2026-07-15',
  },
  {
    id: 4,
    title: 'July board meeting minutes posted',
    body: 'Minutes from July 10 are up in the documents library, including the reserve fund review.',
    tag: 'Board',
    pinned: false,
    postedBy: 'Board secretary',
    postedAt: '2026-07-11',
  },
];

export const election = {
  title: '2026 Board Election',
  openSeats: 3,
  closesInDays: 4,
  percentVoted: 70,
  candidates: [
    {
      id: 1,
      initials: 'RO',
      name: 'Renata Osei',
      role: 'Incumbent Treasurer · Unit 6C',
    },
    {
      id: 2,
      initials: 'MI',
      name: 'Marcus Ibarra',
      role: 'Landscaping Chair · Unit 21A',
    },
    {
      id: 3,
      initials: 'PC',
      name: 'Priya Chandran',
      role: 'New candidate · Unit 9D',
    },
    {
      id: 4,
      initials: 'OF',
      name: 'Owen Fletcher',
      role: 'New candidate · Unit 3B',
    },
  ],
};

export const duesSummary = {
  balance: 0,
  nextAssessment: 245,
  nextDueDate: '2026-08-01',
};

export const paymentHistory = [
  {
    id: 1,
    description: 'Monthly assessment',
    amount: 245,
    date: '2026-07-01',
    status: 'Paid' as const,
  },
  {
    id: 2,
    description: 'Monthly assessment',
    amount: 245,
    date: '2026-06-01',
    status: 'Paid' as const,
  },
  {
    id: 3,
    description: 'Roof reserve — special',
    amount: 120,
    date: '2026-05-15',
    status: 'Paid' as const,
  },
  {
    id: 4,
    description: 'Monthly assessment',
    amount: 245,
    date: '2026-05-01',
    status: 'Paid' as const,
  },
];
