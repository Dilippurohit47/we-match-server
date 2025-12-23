/*
  Warnings:

  - You are about to drop the column `category` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `github` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `githubId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `linkedIn` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Skill_userId_level_idx";

-- DropIndex
DROP INDEX "User_githubId_key";

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "category",
DROP COLUMN "level";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "github",
DROP COLUMN "githubId",
DROP COLUMN "linkedIn",
DROP COLUMN "phone",
DROP COLUMN "timezone",
ADD COLUMN     "landmark" TEXT,
ALTER COLUMN "bio" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Skill_userId_idx" ON "Skill"("userId");
