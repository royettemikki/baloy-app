CREATE TYPE "DuesRateMode" AS ENUM ('Fixed', 'PerArea');

ALTER TABLE "Homeowner"
  ADD COLUMN "lotAreaSqm" DECIMAL(10,2),
  ADD COLUMN "monthlyDuesMode" "DuesRateMode" NOT NULL DEFAULT 'Fixed',
  ADD COLUMN "monthlyDuesRate" DECIMAL(10,2) NOT NULL DEFAULT 0;

ALTER TABLE "DuesCharge"
  ADD COLUMN "billingPeriod" TIMESTAMP(3);

WITH monthly_charges AS (
  SELECT
    "id",
    date_trunc('month', "dueDate")::timestamp(3) AS billing_period,
    row_number() OVER (
      PARTITION BY "homeownerId", date_trunc('month', "dueDate")
      ORDER BY "dueDate", "id"
    ) AS row_number
  FROM "DuesCharge"
  WHERE "description" ILIKE 'Monthly assessment%'
)
UPDATE "DuesCharge" AS charge
SET "billingPeriod" = monthly_charges.billing_period
FROM monthly_charges
WHERE charge."id" = monthly_charges."id"
  AND monthly_charges.row_number = 1;

CREATE UNIQUE INDEX "DuesCharge_homeownerId_billingPeriod_key"
  ON "DuesCharge"("homeownerId", "billingPeriod");
