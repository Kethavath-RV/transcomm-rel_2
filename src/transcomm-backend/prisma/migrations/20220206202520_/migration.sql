-- AlterTable
ALTER TABLE `ManualRetryView` ADD COLUMN `errorMessage` VARCHAR(191);

-- CreateIndex
CREATE INDEX `ManualRetryView.errorMessage_index` ON `ManualRetryView`(`errorMessage`);
