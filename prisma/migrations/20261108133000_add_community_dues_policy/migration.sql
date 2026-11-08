ALTER TABLE "Homeowner"
  ADD COLUMN "duesRateOverride" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Homeowner"
SET "duesRateOverride" = true
WHERE "monthlyDuesRate" > 0;

CREATE TABLE "DuesSettings" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "monthlyDuesMode" "DuesRateMode" NOT NULL DEFAULT 'Fixed',
  "monthlyDuesRate" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DuesSettings_pkey" PRIMARY KEY ("id")
);
