/*
  Warnings:

  - Added the required column `updatedAt` to the `PhoneVerificationCode` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PhoneVerificationCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phoneNumber" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PhoneVerificationCode" ("code", "createdAt", "id", "phoneNumber", "status") SELECT "code", "createdAt", "id", "phoneNumber", "status" FROM "PhoneVerificationCode";
DROP TABLE "PhoneVerificationCode";
ALTER TABLE "new_PhoneVerificationCode" RENAME TO "PhoneVerificationCode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
