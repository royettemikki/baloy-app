-- AlterEnum
ALTER TYPE "ChargeStatus" ADD VALUE 'Rejected';

-- AlterTable
ALTER TABLE "DuesCharge" ADD COLUMN     "rejectionReason" TEXT;
