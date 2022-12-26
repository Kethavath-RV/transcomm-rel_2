/*
  Warnings:

  - Added the required column `ecomCode` to the `EventKeyOrderLookup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ecomCode` to the `HyperledgerEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ecomCode` to the `TxnLookup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `EventKeyOrderLookup` ADD COLUMN `ecomCode` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `HyperledgerEvent` ADD COLUMN `ecomCode` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `TxnLookup` ADD COLUMN `ecomCode` VARCHAR(191) NOT NULL;
