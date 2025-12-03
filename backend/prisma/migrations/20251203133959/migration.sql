/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `NutritionProgram` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NutritionProgram_name_key" ON "NutritionProgram"("name");
