
-- Add profile fields without deleting existing user data.
ALTER TABLE "User"
ADD COLUMN "branch" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "dateOfBirth" TIMESTAMP(3),
ADD COLUMN "gender" TEXT,
ADD COLUMN "name" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "pincode" TEXT,
ADD COLUMN "rollNumber" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "year" TEXT;

-- Add userId as nullable first.
ALTER TABLE "Application"
ADD COLUMN "userId" INTEGER;

-- Map applications to existing users through User.studentId.
UPDATE "Application" AS a
SET "userId" = u.id
FROM "User" AS u
WHERE u."studentId" = a."studentId";

-- Stop safely if any application cannot be mapped.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Application"
    WHERE "userId" IS NULL
  ) THEN
    RAISE EXCEPTION
      'Migration stopped: application has no matching user';
  END IF;
END $$;

ALTER TABLE "Application"
ALTER COLUMN "userId" SET NOT NULL;

-- Remove the old application-to-student relationship.
ALTER TABLE "Application"
DROP CONSTRAINT "Application_studentId_fkey";

DROP INDEX "Application_studentId_placementDriveId_key";

ALTER TABLE "Application"
DROP COLUMN "studentId";

-- Add the new application-to-user relationship.
CREATE UNIQUE INDEX "Application_userId_placementDriveId_key"
ON "Application"("userId", "placementDriveId");

CREATE UNIQUE INDEX "User_rollNumber_key"
ON "User"("rollNumber");

ALTER TABLE "Application"
ADD CONSTRAINT "Application_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
