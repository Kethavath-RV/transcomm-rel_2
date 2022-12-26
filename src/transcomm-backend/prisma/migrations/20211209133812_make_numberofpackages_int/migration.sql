/*
  Warnings:

  - You are about to alter the column `numberOfPackages` on the `HouseBill` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `numberOfPackages` on the `PackageDetails` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `HouseBill` MODIFY `numberOfPackages` INTEGER;

-- AlterTable
ALTER TABLE `PackageDetails` MODIFY `numberOfPackages` INTEGER NOT NULL;
