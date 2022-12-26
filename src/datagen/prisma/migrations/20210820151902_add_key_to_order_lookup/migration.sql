-- CreateTable
CREATE TABLE `EventKeyOrderLookup` (
    `key` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191),

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
