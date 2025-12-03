/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `NutritionCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NutritionCategory_name_key" ON "NutritionCategory"("name");
