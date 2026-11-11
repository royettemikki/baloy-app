CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "normalizedUnit" TEXT NOT NULL,
    "lotAreaSqm" DECIMAL(10,2),
    "monthlyDuesMode" "DuesRateMode" NOT NULL DEFAULT 'Fixed',
    "monthlyDuesRate" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "duesRateOverride" BOOLEAN NOT NULL DEFAULT false,
    "creditBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "primaryVoterId" TEXT,
    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

WITH grouped_homeowners AS (
    SELECT
        CASE
            WHEN trim(regexp_replace("unit", '[[:space:]]+', ' ', 'g')) = '' THEN 'unassigned:' || "id"
            ELSE lower(trim(regexp_replace("unit", '[[:space:]]+', ' ', 'g')))
        END AS normalized_unit,
        COALESCE((array_agg(NULLIF(trim(regexp_replace("unit", '[[:space:]]+', ' ', 'g')), '') ORDER BY "createdAt", "id"))[1], 'Unassigned') AS unit,
        CASE
            WHEN count(DISTINCT "lotAreaSqm") = 1
                AND count(*) FILTER (WHERE "lotAreaSqm" IS NULL) = 0
            THEN min("lotAreaSqm")
            ELSE NULL
        END AS lot_area,
        CASE
            WHEN count(DISTINCT "monthlyDuesMode") = 1
                AND count(DISTINCT "monthlyDuesRate") = 1
                AND count(DISTINCT "duesRateOverride") = 1
            THEN (array_agg("monthlyDuesMode" ORDER BY "createdAt", "id"))[1]
            ELSE 'Fixed'::"DuesRateMode"
        END AS dues_mode,
        CASE
            WHEN count(DISTINCT "monthlyDuesMode") = 1
                AND count(DISTINCT "monthlyDuesRate") = 1
                AND count(DISTINCT "duesRateOverride") = 1
            THEN (array_agg("monthlyDuesRate" ORDER BY "createdAt", "id"))[1]
            ELSE 0
        END AS dues_rate,
        CASE
            WHEN count(DISTINCT "monthlyDuesMode") = 1
                AND count(DISTINCT "monthlyDuesRate") = 1
                AND count(DISTINCT "duesRateOverride") = 1
            THEN (array_agg("duesRateOverride" ORDER BY "createdAt", "id"))[1]
            ELSE false
        END AS dues_override,
        (
            count(DISTINCT "lotAreaSqm") > 1
            OR (count(DISTINCT "lotAreaSqm") > 0 AND count(*) FILTER (WHERE "lotAreaSqm" IS NULL) > 0)
            OR count(DISTINCT "monthlyDuesMode") > 1
            OR count(DISTINCT "monthlyDuesRate") > 1
            OR count(DISTINCT "duesRateOverride") > 1
        ) AS needs_review,
        sum("creditBalance") AS credit_balance
    FROM "Homeowner"
    GROUP BY CASE
        WHEN trim(regexp_replace("unit", '[[:space:]]+', ' ', 'g')) = '' THEN 'unassigned:' || "id"
        ELSE lower(trim(regexp_replace("unit", '[[:space:]]+', ' ', 'g')))
    END
)
INSERT INTO "Property" (
    "id",
    "unit",
    "normalizedUnit",
    "lotAreaSqm",
    "monthlyDuesMode",
    "monthlyDuesRate",
    "duesRateOverride",
    "creditBalance",
    "needsReview"
)
SELECT
    'property_' || md5(normalized_unit),
    unit,
    normalized_unit,
    lot_area,
    dues_mode,
    dues_rate,
    dues_override,
    credit_balance,
    needs_review
FROM grouped_homeowners;

CREATE UNIQUE INDEX "Property_normalizedUnit_key" ON "Property"("normalizedUnit");
CREATE UNIQUE INDEX "Property_primaryVoterId_key" ON "Property"("primaryVoterId");

ALTER TABLE "Homeowner" ADD COLUMN "propertyId" TEXT;
UPDATE "Homeowner" AS homeowner
SET "propertyId" = property."id",
    "unit" = property."unit",
    "creditBalance" = 0
FROM "Property" AS property
WHERE property."normalizedUnit" = CASE
    WHEN trim(regexp_replace(homeowner."unit", '[[:space:]]+', ' ', 'g')) = '' THEN 'unassigned:' || homeowner."id"
    ELSE lower(trim(regexp_replace(homeowner."unit", '[[:space:]]+', ' ', 'g')))
END;
ALTER TABLE "Homeowner" ALTER COLUMN "propertyId" SET NOT NULL;
ALTER TABLE "Homeowner"
    ADD CONSTRAINT "Homeowner_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Property"
    ADD CONSTRAINT "Property_primaryVoterId_fkey"
    FOREIGN KEY ("primaryVoterId") REFERENCES "Homeowner"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Homeowner_propertyId_idx" ON "Homeowner"("propertyId");

ALTER TABLE "Vote" ADD COLUMN "propertyId" TEXT;
UPDATE "Vote" AS vote
SET "propertyId" = homeowner."propertyId"
FROM "Homeowner" AS homeowner
WHERE homeowner."id" = vote."homeownerId";
ALTER TABLE "Vote" ALTER COLUMN "propertyId" SET NOT NULL;
ALTER TABLE "Vote"
    ADD CONSTRAINT "Vote_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Vote_propertyId_idx" ON "Vote"("propertyId");

CREATE TABLE "PropertyBallot" (
    "id" SERIAL NOT NULL,
    "positionId" INTEGER NOT NULL,
    "propertyId" TEXT NOT NULL,
    CONSTRAINT "PropertyBallot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PropertyBallot_positionId_propertyId_key"
    ON "PropertyBallot"("positionId", "propertyId");
ALTER TABLE "PropertyBallot"
    ADD CONSTRAINT "PropertyBallot_positionId_fkey"
    FOREIGN KEY ("positionId") REFERENCES "Position"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PropertyBallot"
    ADD CONSTRAINT "PropertyBallot_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Vote" ADD COLUMN "propertyBallotId" INTEGER;
CREATE UNIQUE INDEX "Vote_propertyBallotId_key" ON "Vote"("propertyBallotId");
ALTER TABLE "Vote"
    ADD CONSTRAINT "Vote_propertyBallotId_fkey"
    FOREIGN KEY ("propertyBallotId") REFERENCES "PropertyBallot"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
