-- CreateTable
CREATE TABLE `HyperledgerEvent` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `status` ENUM('OPEN', 'PROCESSING', 'COMPLETED') NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `collection` VARCHAR(191) NOT NULL,
    `blockNumber` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
