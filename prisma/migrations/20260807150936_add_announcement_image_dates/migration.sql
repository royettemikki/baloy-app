-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "startsAt" TIMESTAMP(3);
