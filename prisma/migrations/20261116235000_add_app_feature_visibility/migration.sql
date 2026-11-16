CREATE TABLE "AppFeatureVisibility" (
    "key" TEXT NOT NULL,
    "adminEnabled" BOOLEAN NOT NULL DEFAULT true,
    "residentEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AppFeatureVisibility_pkey" PRIMARY KEY ("key")
);
