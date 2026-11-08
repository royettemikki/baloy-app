-- AlterTable
ALTER TABLE "Homeowner" ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "notifyElectionAlerts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyEmailAnnouncements" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyTextDuesReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phoneNumber" TEXT;
