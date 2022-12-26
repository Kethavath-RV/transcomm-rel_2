/*
  Warnings:

  - The primary key for the `EventKeyOrderLookup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `collection` to the `EventKeyOrderLookup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `EventKeyOrderLookup` DROP PRIMARY KEY,
    ADD COLUMN `collection` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`key`, `collection`);
