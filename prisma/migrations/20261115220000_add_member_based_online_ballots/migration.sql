DROP INDEX IF EXISTS "Property_primaryVoterId_key";

CREATE TABLE "PropertyMembership" (
    "propertyId" TEXT NOT NULL,
    "homeownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PropertyMembership_pkey" PRIMARY KEY ("propertyId", "homeownerId")
);

INSERT INTO "PropertyMembership" ("propertyId", "homeownerId")
SELECT "propertyId", "id" FROM "Homeowner"
ON CONFLICT DO NOTHING;

CREATE INDEX "PropertyMembership_homeownerId_idx" ON "PropertyMembership"("homeownerId");

ALTER TABLE "PropertyMembership"
    ADD CONSTRAINT "PropertyMembership_propertyId_fkey"
    FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "PropertyMembership_homeownerId_fkey"
    FOREIGN KEY ("homeownerId") REFERENCES "Homeowner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ElectionVoter" (
    "id" SERIAL NOT NULL,
    "electionId" INTEGER NOT NULL,
    "homeownerId" TEXT NOT NULL,
    "proxyId" TEXT,
    "castAt" TIMESTAMP(3),
    "castById" TEXT,
    CONSTRAINT "ElectionVoter_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ElectionVoter_electionId_homeownerId_key"
    ON "ElectionVoter"("electionId", "homeownerId");
CREATE INDEX "ElectionVoter_proxyId_electionId_idx"
    ON "ElectionVoter"("proxyId", "electionId");

ALTER TABLE "ElectionVoter"
    ADD CONSTRAINT "ElectionVoter_electionId_fkey"
    FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "ElectionVoter_homeownerId_fkey"
    FOREIGN KEY ("homeownerId") REFERENCES "Homeowner"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "ElectionVoter_proxyId_fkey"
    FOREIGN KEY ("proxyId") REFERENCES "Homeowner"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "ElectionVoter_castById_fkey"
    FOREIGN KEY ("castById") REFERENCES "Homeowner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "ElectionBallot" (
    "id" SERIAL NOT NULL,
    "voterId" INTEGER NOT NULL,
    CONSTRAINT "ElectionBallot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ElectionBallot_voterId_key" ON "ElectionBallot"("voterId");

ALTER TABLE "ElectionBallot"
    ADD CONSTRAINT "ElectionBallot_voterId_fkey"
    FOREIGN KEY ("voterId") REFERENCES "ElectionVoter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Vote" ADD COLUMN "electionBallotId" INTEGER;
CREATE INDEX "Vote_electionBallotId_idx" ON "Vote"("electionBallotId");
ALTER TABLE "Vote"
    ADD CONSTRAINT "Vote_electionBallotId_fkey"
    FOREIGN KEY ("electionBallotId") REFERENCES "ElectionBallot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "ElectionVoter" ("electionId", "homeownerId")
SELECT DISTINCT active."electionId", active."homeownerId"
FROM (
    SELECT e."id" AS "electionId", property."primaryVoterId" AS "homeownerId"
    FROM "Election" e
    JOIN "Property" property ON property."primaryVoterId" IS NOT NULL
    JOIN "Homeowner" owner ON owner."id" = property."primaryVoterId" AND owner."passwordHash" IS NOT NULL
    WHERE e."votingOpensAt" IS NOT NULL
      AND (e."closesAt" IS NULL OR e."closesAt" > CURRENT_TIMESTAMP)
    UNION
    SELECT position."electionId", vote."homeownerId"
    FROM "Vote" vote
    JOIN "Position" position ON position."id" = vote."positionId"
    JOIN "Election" e ON e."id" = position."electionId"
    WHERE e."votingOpensAt" IS NOT NULL
      AND (e."closesAt" IS NULL OR e."closesAt" > CURRENT_TIMESTAMP)
) active
ON CONFLICT ("electionId", "homeownerId") DO NOTHING;

UPDATE "ElectionVoter" voter
SET "castAt" = ballots."castAt",
    "castById" = voter."homeownerId"
FROM (
    SELECT position."electionId", vote."homeownerId", MIN(vote."castAt") AS "castAt"
    FROM "Vote" vote
    JOIN "Position" position ON position."id" = vote."positionId"
    JOIN "Election" e ON e."id" = position."electionId"
    WHERE e."votingOpensAt" IS NOT NULL
      AND (e."closesAt" IS NULL OR e."closesAt" > CURRENT_TIMESTAMP)
    GROUP BY position."electionId", vote."homeownerId"
) ballots
WHERE voter."electionId" = ballots."electionId"
  AND voter."homeownerId" = ballots."homeownerId";

INSERT INTO "ElectionBallot" ("voterId")
SELECT voter."id"
FROM "ElectionVoter" voter
WHERE voter."castAt" IS NOT NULL
ON CONFLICT ("voterId") DO NOTHING;

UPDATE "Vote" vote
SET "electionBallotId" = ballot."id"
FROM "Position" position, "ElectionVoter" voter, "ElectionBallot" ballot
WHERE position."id" = vote."positionId"
  AND voter."electionId" = position."electionId"
  AND voter."homeownerId" = vote."homeownerId"
  AND ballot."voterId" = voter."id"
  AND vote."electionBallotId" IS NULL;
