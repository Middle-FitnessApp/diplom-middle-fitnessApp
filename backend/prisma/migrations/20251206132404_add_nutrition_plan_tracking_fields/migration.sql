/*
  Warnings:

  - Added the required column `updatedAt` to the `ClientNutritionPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ClientNutritionPlan" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
