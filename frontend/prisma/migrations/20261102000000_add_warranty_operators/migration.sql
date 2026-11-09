-- Reorder and ensure Warranty_Conditions__c columns with Installation_date_operator__c before Installation_From__c

CREATE TABLE IF NOT EXISTS "Warranty_Conditions__c_reorder" (
    "id" TEXT NOT NULL,
    "sourceRow" INTEGER,
    "Installation_date_operator__c" TEXT,
    "Installation_From__c" TIMESTAMP(3),
    "Installation_To__c" TIMESTAMP(3),
    "Branch_Operator__c" TEXT,
    "Branch__c" TEXT,
    "Model_Operator__c" TEXT,
    "Modals__c" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "WarrantyDuration" INTEGER,
    "WarrantyTermName" TEXT NOT NULL,
    "WarrantyUnitOfTime" TEXT,

    CONSTRAINT "Warranty_Conditions__c_reorder_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = CURRENT_SCHEMA() AND table_name = 'Warranty_Conditions__c'
    ) THEN
        ALTER TABLE "Warranty_Conditions__c" ADD COLUMN IF NOT EXISTS "Installation_date_operator__c" TEXT;
        ALTER TABLE "Warranty_Conditions__c" ADD COLUMN IF NOT EXISTS "Model_Operator__c" TEXT;
        ALTER TABLE "Warranty_Conditions__c" ADD COLUMN IF NOT EXISTS "sourceRow" INTEGER;

        INSERT INTO "Warranty_Conditions__c_reorder" (
            "id",
            "sourceRow",
            "Installation_date_operator__c",
            "Installation_From__c",
            "Installation_To__c",
            "Branch_Operator__c",
            "Branch__c",
            "Model_Operator__c",
            "Modals__c",
            "createdAt",
            "WarrantyDuration",
            "WarrantyTermName",
            "WarrantyUnitOfTime"
        )
        SELECT
            "id",
            "sourceRow",
            "Installation_date_operator__c",
            "Installation_From__c",
            "Installation_To__c",
            "Branch_Operator__c",
            "Branch__c",
            "Model_Operator__c",
            "Modals__c",
            "createdAt",
            "WarrantyDuration",
            "WarrantyTermName",
            "WarrantyUnitOfTime"
        FROM "Warranty_Conditions__c";

        DROP TABLE "Warranty_Conditions__c" CASCADE;
    END IF;
END $$;

ALTER TABLE "Warranty_Conditions__c_reorder" RENAME TO "Warranty_Conditions__c";
ALTER TABLE "Warranty_Conditions__c" RENAME CONSTRAINT "Warranty_Conditions__c_reorder_pkey" TO "Warranty_Conditions__c_pkey";

CREATE INDEX IF NOT EXISTS "Warranty_Conditions__c_Installation_From__c_Installation_To__c_idx"
    ON "Warranty_Conditions__c"("Installation_From__c", "Installation_To__c");
