/*
  Warnings:

  - A unique constraint covering the columns `[inviteToken]` on the table `Homeowner` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Homeowner" ADD COLUMN     "inviteToken" TEXT,
ADD COLUMN     "invitedAt" TIMESTAMP(3),
ADD COLUMN     "joinedAt" TIMESTAMP(3),
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Homeowner_inviteToken_key" ON "Homeowner"("inviteToken");
