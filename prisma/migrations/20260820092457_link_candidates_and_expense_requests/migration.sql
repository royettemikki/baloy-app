-- CreateEnum
CREATE TYPE "ExpenseRequestStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "homeownerId" TEXT;

-- CreateTable
CREATE TABLE "ExpenseRequest" (
    "id" SERIAL NOT NULL,
    "homeownerId" TEXT NOT NULL,
    "positionId" INTEGER NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "justification" TEXT NOT NULL,
    "status" "ExpenseRequestStatus" NOT NULL DEFAULT 'Pending',
    "rejectionReason" TEXT,
    "resultingExpenseId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ExpenseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseRequest_resultingExpenseId_key" ON "ExpenseRequest"("resultingExpenseId");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseRequest" ADD CONSTRAINT "ExpenseRequest_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseRequest" ADD CONSTRAINT "ExpenseRequest_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpenseRequest" ADD CONSTRAINT "ExpenseRequest_resultingExpenseId_fkey" FOREIGN KEY ("resultingExpenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;
