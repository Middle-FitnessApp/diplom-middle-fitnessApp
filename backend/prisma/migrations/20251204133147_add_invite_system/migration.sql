/*
  Warnings:

  - A unique constraint covering the columns `[clientId,trainerId]` on the table `TrainerClient` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TrainerClientStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "TrainerClient" DROP CONSTRAINT "TrainerClient_clientId_fkey";

-- DropForeignKey
ALTER TABLE "TrainerClient" DROP CONSTRAINT "TrainerClient_trainerId_fkey";

-- DropIndex
DROP INDEX "TrainerClient_clientId_key";

-- AlterTable
ALTER TABLE "TrainerClient" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "status" "TrainerClientStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "TrainerClient_clientId_idx" ON "TrainerClient"("clientId");

-- CreateIndex
CREATE INDEX "TrainerClient_trainerId_idx" ON "TrainerClient"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerClient_status_idx" ON "TrainerClient"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerClient_clientId_trainerId_key" ON "TrainerClient"("clientId", "trainerId");

-- AddForeignKey
ALTER TABLE "TrainerClient" ADD CONSTRAINT "TrainerClient_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerClient" ADD CONSTRAINT "TrainerClient_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
