-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('Maintenance', 'Utilities', 'Security', 'Landscaping', 'Administrative', 'SocialAndCultural', 'ReserveFund', 'Other');

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paidTo" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);
