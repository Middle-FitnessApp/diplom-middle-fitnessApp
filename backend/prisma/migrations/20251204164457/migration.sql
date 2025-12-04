/*
  Warnings:

  - You are about to drop the `AssignedNutritionPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Meal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NutritionProgram` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgramDay` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssignedNutritionPlan" DROP CONSTRAINT "AssignedNutritionPlan_clientId_fkey";

-- DropForeignKey
ALTER TABLE "AssignedNutritionPlan" DROP CONSTRAINT "AssignedNutritionPlan_programId_fkey";

-- DropForeignKey
ALTER TABLE "Meal" DROP CONSTRAINT "Meal_dayId_fkey";

-- DropForeignKey
ALTER TABLE "NutritionProgram" DROP CONSTRAINT "NutritionProgram_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramDay" DROP CONSTRAINT "ProgramDay_programId_fkey";

-- DropTable
DROP TABLE "AssignedNutritionPlan";

-- DropTable
DROP TABLE "Meal";

-- DropTable
DROP TABLE "NutritionProgram";

-- DropTable
DROP TABLE "ProgramDay";

-- CreateTable
CREATE TABLE "NutritionSubcategory" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionSubcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionDay" (
    "id" TEXT NOT NULL,
    "subcatId" TEXT NOT NULL,
    "dayTitle" TEXT NOT NULL,
    "dayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionMeal" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "type" "MealType" NOT NULL,
    "name" TEXT NOT NULL,
    "mealOrder" INTEGER NOT NULL,
    "items" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientNutritionPlan" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "subcatId" TEXT NOT NULL,
    "dayIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientNutritionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NutritionSubcategory_name_key" ON "NutritionSubcategory"("name");

-- AddForeignKey
ALTER TABLE "NutritionSubcategory" ADD CONSTRAINT "NutritionSubcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "NutritionCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionDay" ADD CONSTRAINT "NutritionDay_subcatId_fkey" FOREIGN KEY ("subcatId") REFERENCES "NutritionSubcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionMeal" ADD CONSTRAINT "NutritionMeal_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "NutritionDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientNutritionPlan" ADD CONSTRAINT "ClientNutritionPlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientNutritionPlan" ADD CONSTRAINT "ClientNutritionPlan_subcatId_fkey" FOREIGN KEY ("subcatId") REFERENCES "NutritionSubcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
