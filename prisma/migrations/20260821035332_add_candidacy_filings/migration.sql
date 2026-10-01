-- CreateEnum
CREATE TYPE "CandidacyFilingStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateTable
CREATE TABLE "CandidacyFiling" (
    "id" SERIAL NOT NULL,
    "homeownerId" TEXT NOT NULL,
    "positionId" INTEGER NOT NULL,
    "statement" TEXT,
    "status" "CandidacyFilingStatus" NOT NULL DEFAULT 'Pending',
    "rejectionReason" TEXT,
    "resultingCandidateId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "CandidacyFiling_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidacyFiling_resultingCandidateId_key" ON "CandidacyFiling"("resultingCandidateId");

-- AddForeignKey
ALTER TABLE "CandidacyFiling" ADD CONSTRAINT "CandidacyFiling_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidacyFiling" ADD CONSTRAINT "CandidacyFiling_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidacyFiling" ADD CONSTRAINT "CandidacyFiling_resultingCandidateId_fkey" FOREIGN KEY ("resultingCandidateId") REFERENCES "Candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
