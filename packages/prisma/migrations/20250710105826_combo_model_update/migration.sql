/*
  Warnings:

  - Added the required column `priceFinal` to the `Combo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Combo` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ComboStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- AlterTable
ALTER TABLE "Combo" ADD COLUMN     "priceFinal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "status" "ComboStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
