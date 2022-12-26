-- AlterTable
ALTER TABLE `Declaration` ADD COLUMN `createdAt` VARCHAR(191),
    ADD COLUMN `direction` VARCHAR(191),
    ADD COLUMN `returnRequestNo` VARCHAR(191);

-- AlterTable
ALTER TABLE `OrderExceptionOverview` ADD COLUMN `orderDate` DATETIME(3);
