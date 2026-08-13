import { AnnouncementTag } from '@/constants/announcementTags';

export type Announcement = {
  id: number;
  title: string;
  body: string;
  tag: AnnouncementTag;
  pinned: boolean;
  postedBy: string;
  postedAt: string;
  imageUrl: string | null;
  startsAt: string | null;
  expiresAt: string | null;
};
