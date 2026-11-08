/*
  Warnings:

  - You are about to drop the column `electionId` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `openSeats` on the `Election` table. All the data in the column will be lost.
  - You are about to drop the column `electionId` on the `Vote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[positionId,homeownerId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `positionId` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionId` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_electionId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_electionId_fkey";

-- DropIndex
DROP INDEX "Vote_electionId_homeownerId_key";

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "electionId",
ADD COLUMN     "positionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Election" DROP COLUMN "openSeats";

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "electionId",
ADD COLUMN     "positionId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "electionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "seats" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_positionId_homeownerId_key" ON "Vote"("positionId", "homeownerId");

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
