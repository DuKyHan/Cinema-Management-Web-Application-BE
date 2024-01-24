/*
  Warnings:

  - Made the column `authorId` on table `News` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "News" ALTER COLUMN "authorId" SET NOT NULL;
