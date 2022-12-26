/*
  Warnings:

  - Added the required column `txId` to the `HyperledgerEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `HyperledgerEvent` ADD COLUMN `txId` VARCHAR(191) NOT NULL;
