-- AlterTable
ALTER TABLE `HyperledgerEvent` MODIFY `status` ENUM('OPEN', 'PROCESSING', 'COMPLETED', 'IGNORE') NOT NULL;
