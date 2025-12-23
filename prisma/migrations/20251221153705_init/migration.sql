/*
  Warnings:

  - You are about to drop the column `exam` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `proficiency` on the `Subject` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Subject_exam_idx";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "exam",
DROP COLUMN "proficiency";
