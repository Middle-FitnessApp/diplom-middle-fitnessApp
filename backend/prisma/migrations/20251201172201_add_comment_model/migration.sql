-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progressId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Comment_progressId_idx" ON "Comment"("progressId");

-- CreateIndex
CREATE INDEX "Comment_trainerId_idx" ON "Comment"("trainerId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "Progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
