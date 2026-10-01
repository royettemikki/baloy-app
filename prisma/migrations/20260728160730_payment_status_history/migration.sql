/*
  Warnings:

  - You are about to drop the column `rejectionReason` on the `DuesCharge` table. All the data in the column will be lost.
  - You are about to drop the column `confirmed` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `Payment` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Submitted', 'Confirmed', 'Rejected');

-- AlterTable
ALTER TABLE "DuesCharge" DROP COLUMN "rejectionReason";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "confirmed",
DROP COLUMN "paidAt",
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'Submitted',
ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
