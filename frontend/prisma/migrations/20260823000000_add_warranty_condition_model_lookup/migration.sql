-- WarrantyCondition was introduced through a prior schema sync rather than a
-- committed migration. Keep this migration safe for both that existing table
-- and clean environments that apply the migration history from scratch.
CREATE TABLE IF NOT EXISTS "WarrantyCondition" (
    "id" TEXT NOT NULL,
    "sourceRow" INTEGER,
    "termName" TEXT NOT NULL,
    "duration" INTEGER,
    "unitOfTime" TEXT,
    "installationFrom" TIMESTAMP(3),
    "installationTo" TIMESTAMP(3),
    "branchOperator" TEXT,
    "branches" TEXT,
    "models" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WarrantyCondition_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "WarrantyCondition" ADD COLUMN IF NOT EXISTS "sourceRow" INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS "WarrantyCondition_sourceRow_key" ON "WarrantyCondition"("sourceRow");
CREATE INDEX IF NOT EXISTS "WarrantyCondition_installationFrom_installationTo_idx"
    ON "WarrantyCondition"("installationFrom", "installationTo");

CREATE TABLE IF NOT EXISTS "WarrantyConditionModel" (
    "id" TEXT NOT NULL,
    "conditionId" TEXT NOT NULL,
    "normalizedModel" TEXT NOT NULL,

    CONSTRAINT "WarrantyConditionModel_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
    ALTER TABLE "WarrantyConditionModel"
        ADD CONSTRAINT "WarrantyConditionModel_conditionId_fkey"
        FOREIGN KEY ("conditionId") REFERENCES "WarrantyCondition"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "WarrantyConditionModel_conditionId_normalizedModel_key"
    ON "WarrantyConditionModel"("conditionId", "normalizedModel");
CREATE INDEX IF NOT EXISTS "WarrantyConditionModel_normalizedModel_idx"
    ON "WarrantyConditionModel"("normalizedModel");
