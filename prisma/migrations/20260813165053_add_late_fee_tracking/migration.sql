-- AlterTable
ALTER TABLE "DuesCharge" ADD COLUMN     "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "lateFeeAppliedAt" TIMESTAMP(3);
