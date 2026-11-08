/*
  Warnings:

  - You are about to drop the column `duesChargeId` on the `Payment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_duesChargeId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "duesChargeId",
ADD COLUMN     "allocationSummary" TEXT;
