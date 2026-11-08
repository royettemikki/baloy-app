-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('Due', 'Paid', 'Overdue');

-- CreateTable
CREATE TABLE "DuesCharge" (
    "id" SERIAL NOT NULL,
    "homeownerId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "ChargeStatus" NOT NULL DEFAULT 'Due',

    CONSTRAINT "DuesCharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "duesChargeId" INTEGER NOT NULL,
    "homeownerId" TEXT NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptReference" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_duesChargeId_key" ON "Payment"("duesChargeId");

-- AddForeignKey
ALTER TABLE "DuesCharge" ADD CONSTRAINT "DuesCharge_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_duesChargeId_fkey" FOREIGN KEY ("duesChargeId") REFERENCES "DuesCharge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "Homeowner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
