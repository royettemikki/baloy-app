-- CreateEnum
CREATE TYPE "AnnouncementTag" AS ENUM ('Maintenance', 'Event', 'Safety', 'Board');

-- CreateTable
CREATE TABLE "Announcement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tag" "AnnouncementTag" NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "postedBy" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);
