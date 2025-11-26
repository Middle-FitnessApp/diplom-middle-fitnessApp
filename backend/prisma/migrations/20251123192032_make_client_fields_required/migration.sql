/*
  Warnings:

  - Made the column `age` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `weight` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `height` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `waist` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `chest` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hips` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `arm` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `leg` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `goal` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `restrictions` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `experience` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `diet` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `photoFront` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `photoSide` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `photoBack` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "photo" TEXT DEFAULT '/uploads/default/user.png',
ALTER COLUMN "age" SET NOT NULL,
ALTER COLUMN "weight" SET NOT NULL,
ALTER COLUMN "height" SET NOT NULL,
ALTER COLUMN "waist" SET NOT NULL,
ALTER COLUMN "chest" SET NOT NULL,
ALTER COLUMN "hips" SET NOT NULL,
ALTER COLUMN "arm" SET NOT NULL,
ALTER COLUMN "leg" SET NOT NULL,
ALTER COLUMN "goal" SET NOT NULL,
ALTER COLUMN "restrictions" SET NOT NULL,
ALTER COLUMN "experience" SET NOT NULL,
ALTER COLUMN "diet" SET NOT NULL,
ALTER COLUMN "photoFront" SET NOT NULL,
ALTER COLUMN "photoSide" SET NOT NULL,
ALTER COLUMN "photoBack" SET NOT NULL;
