/*
  Warnings:

  - You are about to drop the `ComboPlatform` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `planId` to the `Combo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ComboPlatform" DROP CONSTRAINT "ComboPlatform_comboId_fkey";

-- DropForeignKey
ALTER TABLE "ComboPlatform" DROP CONSTRAINT "ComboPlatform_platformId_fkey";

-- AlterTable
ALTER TABLE "Combo" ADD COLUMN     "planId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Platform" ADD COLUMN     "description" TEXT;

-- DropTable
DROP TABLE "ComboPlatform";

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "platformId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_platformId_key" ON "Plan"("platformId");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Combo" ADD CONSTRAINT "Combo_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
