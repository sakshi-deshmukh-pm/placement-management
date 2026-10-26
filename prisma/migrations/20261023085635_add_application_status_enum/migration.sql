-- Create the enum type
CREATE TYPE "ApplicationStatus" AS ENUM (
    'APPLIED',
    'SHORTLISTED',
    'SELECTED',
    'REJECTED'
);

-- Remove the old string default before changing the column type
ALTER TABLE "Application"
ALTER COLUMN "status" DROP DEFAULT;

-- Convert the existing column while preserving valid values
ALTER TABLE "Application"
ALTER COLUMN "status" TYPE "ApplicationStatus"
USING (
    CASE
        WHEN "status" IN ('APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED')
        THEN "status"::"ApplicationStatus"
        ELSE 'APPLIED'::"ApplicationStatus"
    END
);

-- Set the new enum default
ALTER TABLE "Application"
ALTER COLUMN "status" SET DEFAULT 'APPLIED'::"ApplicationStatus";