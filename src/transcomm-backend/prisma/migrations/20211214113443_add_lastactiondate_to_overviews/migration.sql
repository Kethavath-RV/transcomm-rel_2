-- AlterTable
ALTER TABLE `CancelledOrderOverview` ADD COLUMN `lastActionDate` DATETIME(3);

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `lastActionDate` DATETIME(3);

-- AlterTable
ALTER TABLE `OrderExceptionOverview` ADD COLUMN `lastActionDate` DATETIME(3);

-- AlterTable
ALTER TABLE `OrderOverview` ADD COLUMN `lastActionDate` DATETIME(3);

-- AlterTable
ALTER TABLE `ReturnedOrderOverview` ADD COLUMN `lastActionDate` DATETIME(3);
