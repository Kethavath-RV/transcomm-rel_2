-- AlterTable
ALTER TABLE `Declaration` ADD COLUMN `bodId` VARCHAR(191),
    ADD COLUMN `chargeAmount` VARCHAR(191),
    ADD COLUMN `chargeType` VARCHAR(191);

-- AlterTable
ALTER TABLE `Movement` ADD COLUMN `referenceId` VARCHAR(191);
