-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "age" INTEGER,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "waist" DOUBLE PRECISION,
    "chest" DOUBLE PRECISION,
    "hips" DOUBLE PRECISION,
    "arm" DOUBLE PRECISION,
    "leg" DOUBLE PRECISION,
    "goal" TEXT,
    "restrictions" TEXT,
    "experience" TEXT,
    "diet" TEXT,
    "photoFront" TEXT,
    "photoSide" TEXT,
    "photoBack" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
