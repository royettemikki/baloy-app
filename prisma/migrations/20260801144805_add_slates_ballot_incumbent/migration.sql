-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "ballotNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "isIncumbent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slateId" INTEGER;

-- CreateTable
CREATE TABLE "Slate" (
    "id" SERIAL NOT NULL,
    "electionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "Slate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Slate" ADD CONSTRAINT "Slate_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_slateId_fkey" FOREIGN KEY ("slateId") REFERENCES "Slate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
