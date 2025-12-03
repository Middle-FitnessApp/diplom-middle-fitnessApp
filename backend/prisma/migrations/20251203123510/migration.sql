-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'SNACK', 'LUNCH', 'DINNER');

-- CreateTable
CREATE TABLE "NutritionCategory" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionProgram" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramDay" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "dayTitle" TEXT NOT NULL,
    "dayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "type" "MealType" NOT NULL,
    "name" TEXT NOT NULL,
    "mealOrder" INTEGER NOT NULL,
    "items" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignedNutritionPlan" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "dayIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignedNutritionPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NutritionCategory" ADD CONSTRAINT "NutritionCategory_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionProgram" ADD CONSTRAINT "NutritionProgram_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "NutritionCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDay" ADD CONSTRAINT "ProgramDay_programId_fkey" FOREIGN KEY ("programId") REFERENCES "NutritionProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "ProgramDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedNutritionPlan" ADD CONSTRAINT "AssignedNutritionPlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedNutritionPlan" ADD CONSTRAINT "AssignedNutritionPlan_programId_fkey" FOREIGN KEY ("programId") REFERENCES "NutritionProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
