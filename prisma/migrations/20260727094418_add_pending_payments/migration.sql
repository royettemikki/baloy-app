-- AlterEnum
ALTER TYPE "ChargeStatus" ADD VALUE 'Pending';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referenceNumber" TEXT;
