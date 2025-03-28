/*
  Warnings:

  - You are about to drop the `BlackListedToken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[token]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- DropTable
DROP TABLE "BlackListedToken";

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
