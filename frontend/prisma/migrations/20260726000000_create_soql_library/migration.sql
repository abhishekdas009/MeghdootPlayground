-- CreateTable
CREATE TABLE "soql_library" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "soql" TEXT NOT NULL,
    "favourite" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soql_library_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "soql_library_label_idx" ON "soql_library"("label");

-- CreateIndex
CREATE INDEX "soql_library_category_idx" ON "soql_library"("category");
