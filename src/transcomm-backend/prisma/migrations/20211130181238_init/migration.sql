-- CreateTable
CREATE TABLE `Order` (
    `orderNumber` VARCHAR(191) NOT NULL,
    `ecomBusinessCode` VARCHAR(191) NOT NULL,
    `orderDate` DATETIME(3),
    `actionDate` DATETIME(3),
    `eCommBusinessName` VARCHAR(191),
    `status` VARCHAR(191) NOT NULL,
    `consigneeName` VARCHAR(191),

    PRIMARY KEY (`orderNumber`, `ecomBusinessCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `mode` VARCHAR(191) NOT NULL,
    `invoiceDate` DATETIME(3),
    `cancellationReason` VARCHAR(191),
    `totalNoOfInvoicePages` INTEGER NOT NULL,
    `invoiceType` INTEGER NOT NULL,
    `paymentInstrumentType` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `totalValue` FLOAT NOT NULL,
    `incoTerm` VARCHAR(191) NOT NULL,
    `freightAmount` FLOAT,
    `freightCurrency` VARCHAR(191),
    `insuranceAmount` FLOAT,
    `insuranceCurrency` VARCHAR(191),
    `exporterCode` VARCHAR(191),
    `fzCode` INTEGER,
    `warehouseCode` VARCHAR(191),
    `cargoOwnership` VARCHAR(191),
    `orderNumber` VARCHAR(191) NOT NULL,
    `ecomBusinessCode` VARCHAR(191) NOT NULL,
    `lockedBy` VARCHAR(191),
    `locked` BOOLEAN NOT NULL,

    PRIMARY KEY (`invoiceNumber`, `orderNumber`, `ecomBusinessCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderLine` (
    `id` VARCHAR(191) NOT NULL,
    `lineNumber` VARCHAR(191) NOT NULL,
    `mode` VARCHAR(191) NOT NULL,
    `quantityReturned` INTEGER,
    `quantity` FLOAT NOT NULL,
    `quantityUOM` VARCHAR(191) NOT NULL,
    `netWeight` FLOAT NOT NULL,
    `netWeightUOM` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `hsCode` VARCHAR(191) NOT NULL,
    `countryOfOrigin` VARCHAR(191) NOT NULL,
    `discountValue` FLOAT,
    `discountPercentage` FLOAT,
    `unitPrice` VARCHAR(191) NOT NULL,
    `originalValueOfItem` FLOAT NOT NULL,
    `isFreeOfCost` BOOLEAN NOT NULL,
    `goodsCondition` VARCHAR(191) NOT NULL,
    `supplementaryQuantity` FLOAT,
    `supplementaryQuantityUOM` VARCHAR(191) NOT NULL,
    `prevDeclarationReference` VARCHAR(191) NOT NULL,
    `skuProductCode` VARCHAR(191),
    `skuQuantityUOM` VARCHAR(191),
    `itemLocation` VARCHAR(191),
    `permit` VARCHAR(191),
    `skuUnitPrice` FLOAT,
    `total` FLOAT,
    `returnRequestNumber` VARCHAR(191),
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `ecomBusinessCode` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReturnReceipt` (
    `orderNumber` VARCHAR(191) NOT NULL,
    `ecomBusinessCode` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `returnRequestNumber` VARCHAR(191) NOT NULL,
    `transportDocNo` VARCHAR(191) NOT NULL,
    `transportProviderCode` VARCHAR(191) NOT NULL,
    `dateOfReceivingBackGoods` VARCHAR(191) NOT NULL,
    `gatePassNumber` VARCHAR(191) NOT NULL,
    `actualMovingInDate` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`orderNumber`, `ecomBusinessCode`, `invoiceNumber`, `returnRequestNumber`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReturnReceiptOrderLine` (
    `id` VARCHAR(191) NOT NULL,
    `lineNumber` INTEGER NOT NULL,
    `hsCode` VARCHAR(191) NOT NULL,
    `skuProductCode` VARCHAR(191) NOT NULL,
    `receviedQuantity` INTEGER NOT NULL,
    `isExtra` VARCHAR(191) NOT NULL,
    `quantityUOM` VARCHAR(191) NOT NULL,
    `goodsCondition` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `ecomBusinessCode` VARCHAR(191) NOT NULL,
    `returnRequestNumber` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChainEvent` (
    `id` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `eventTime` DATETIME(3) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `ecomBusinessCode` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChainEventException` (
    `id` VARCHAR(191) NOT NULL,
    `exceptionCode` VARCHAR(191) NOT NULL,
    `exceptionDetail` VARCHAR(191) NOT NULL,
    `chainEventId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Error` (
    `id` VARCHAR(191) NOT NULL,
    `vcId` VARCHAR(191),
    `errorType` VARCHAR(191) NOT NULL,
    `errorMessage` VARCHAR(191) NOT NULL,
    `errorTime` DATETIME(3) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `ecomBusinessCode` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Address` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `addressLine1` VARCHAR(191) NOT NULL,
    `addressLine2` VARCHAR(191),
    `POBox` VARCHAR(191),
    `city` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `ecomBusinessCode` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HouseBill` (
    `id` VARCHAR(191) NOT NULL,
    `airwayBillNumber` VARCHAR(191),
    `numberOfPackages` VARCHAR(191),
    `weightAndQualifier` VARCHAR(191),
    `volumeAndQualifier` VARCHAR(191),
    `declaredValue` VARCHAR(191),
    `orderId` VARCHAR(191) NOT NULL,
    `ecomBusinessCode` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Movement` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `mode` VARCHAR(191) NOT NULL,
    `mawb` VARCHAR(191) NOT NULL,
    `hawb` VARCHAR(191) NOT NULL,
    `transport` VARCHAR(191) NOT NULL,
    `flightNumber` VARCHAR(191) NOT NULL,
    `shippingParameterId` VARCHAR(191) NOT NULL,
    `airwayBillNumber` VARCHAR(191) NOT NULL,
    `portOfLoad` VARCHAR(191) NOT NULL,
    `pointOfExit` VARCHAR(191) NOT NULL,
    `departureDate` VARCHAR(191) NOT NULL,
    `broker` VARCHAR(191) NOT NULL,
    `agent` VARCHAR(191) NOT NULL,
    `cargoHandler` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `ecomBusinessCode` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShippingDetails` (
    `id` VARCHAR(191) NOT NULL,
    `modeOfTransport` VARCHAR(191) NOT NULL,
    `carrierNumber` VARCHAR(191) NOT NULL,
    `dateOfArrival` VARCHAR(191) NOT NULL,
    `dateOfDeparture` VARCHAR(191) NOT NULL,
    `portOfLoad` VARCHAR(191) NOT NULL,
    `portOfDischarge` VARCHAR(191) NOT NULL,
    `originalLoadPort` VARCHAR(191) NOT NULL,
    `destinationCountry` VARCHAR(191) NOT NULL,
    `pointOfExit` VARCHAR(191) NOT NULL,
    `LDMBusinessCode` VARCHAR(191) NOT NULL,
    `movementId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ShippingDetails.movementId_unique`(`movementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageDetails` (
    `id` VARCHAR(191) NOT NULL,
    `packageType` VARCHAR(191) NOT NULL,
    `numberOfPackages` VARCHAR(191) NOT NULL,
    `containerNumber` VARCHAR(191) NOT NULL,
    `cargoType` VARCHAR(191) NOT NULL,
    `netWeightAndUnit` VARCHAR(191) NOT NULL,
    `containerSize` VARCHAR(191) NOT NULL,
    `containerType` VARCHAR(191) NOT NULL,
    `containerSealNumber` VARCHAR(191) NOT NULL,
    `grossWeightAndUnit` VARCHAR(191) NOT NULL,
    `volumetricWeightAndUnit` VARCHAR(191) NOT NULL,
    `movementId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PackageDetails.movementId_unique`(`movementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Declaration` (
    `declarationNumber` VARCHAR(191) NOT NULL,
    `hyperledgerKey` VARCHAR(191) NOT NULL,
    `batchId` VARCHAR(191),
    `clearanceStatus` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191),
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `shipmentMode` VARCHAR(191),
    `regimeType` VARCHAR(191),
    `declarationType` VARCHAR(191),
    `exportCodeMirsalTwo` VARCHAR(191),
    `recipientIdentification` VARCHAR(191),
    `senderIdentification` VARCHAR(191),
    `numberOfPages` INTEGER,
    `ecomBusinessCode` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `errorType` VARCHAR(191),

    PRIMARY KEY (`orderId`, `ecomBusinessCode`, `hyperledgerKey`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeclarationError` (
    `id` VARCHAR(191) NOT NULL,
    `errorCode` VARCHAR(191) NOT NULL,
    `errorDescription` VARCHAR(191) NOT NULL,
    `errorType` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `hyperledgerKey` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `ecomBusinessCode` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Claim` (
    `orderNumber` VARCHAR(191) NOT NULL,
    `requestDate` DATETIME(3) NOT NULL,
    `currentStage` VARCHAR(191) NOT NULL,
    `claimStatus` VARCHAR(191) NOT NULL,
    `claimNumber` VARCHAR(191) NOT NULL,
    `claimType` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `hyperledgerKey` VARCHAR(191) NOT NULL,
    `declarationNumber` VARCHAR(191) NOT NULL,
    `ecomBusinessCode` VARCHAR(191) NOT NULL,
    `accountNumber` VARCHAR(191) NOT NULL,
    `transportDocumentNumber` VARCHAR(191) NOT NULL DEFAULT '',

    UNIQUE INDEX `Claim_orderId_ecomBusinessCode_hyperledgerKey_unique`(`orderId`, `ecomBusinessCode`, `hyperledgerKey`),
    PRIMARY KEY (`orderId`, `ecomBusinessCode`, `declarationNumber`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Party` (
    `id` VARCHAR(191) NOT NULL,
    `authorizationId` VARCHAR(191) NOT NULL,
    `componentId` VARCHAR(191) NOT NULL,
    `confirmationCode` VARCHAR(191) NOT NULL,
    `logicalId` VARCHAR(191) NOT NULL,
    `referenceId` VARCHAR(191) NOT NULL,
    `taskId` VARCHAR(191) NOT NULL,
    `type` ENUM('receiver', 'sender') NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `declarationNumber` VARCHAR(191) NOT NULL,
    `ecomBusinessCode` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Delivered` (
    `id` VARCHAR(191) NOT NULL,
    `airwayBillNumber` VARCHAR(191) NOT NULL,
    `transportDocumentNumber` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `deliveryDate` DATETIME(3),
    `deliveryStatus` VARCHAR(191) NOT NULL,
    `signature` VARCHAR(191) NOT NULL,
    `deliverTo` VARCHAR(191) NOT NULL,
    `deliveryType` VARCHAR(191) NOT NULL,
    `returnTo` VARCHAR(191) NOT NULL,
    `origin` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `documents` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `ecomBusinessCode` VARCHAR(191) NOT NULL,
    `deliveryCode` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permit` (
    `id` VARCHAR(191) NOT NULL,
    `dutyType` VARCHAR(191) NOT NULL,
    `dutyValue` VARCHAR(191) NOT NULL,
    `orderLineId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Duty` (
    `id` VARCHAR(191) NOT NULL,
    `referenceNo` VARCHAR(191) NOT NULL,
    `issuingAuthorityCode` INTEGER NOT NULL,
    `notRequiredFlag` BOOLEAN NOT NULL,
    `orderLineId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderOverview` (
    `orderNumber` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `ecomCode` VARCHAR(191) NOT NULL,
    `orderStatus` ENUM('Submitted', 'OrderCreated', 'InTransit', 'Cleared', 'Delivered', 'Undelivered', 'OrderCancelled', 'Final', 'ReturnCreated', 'ReturnReceipt', 'GoodsMoveOutofUAE') NOT NULL,
    `orderDate` DATETIME(3),
    `transport` VARCHAR(191) NOT NULL,
    `numberOfItems` INTEGER NOT NULL,
    `declarationNumber` VARCHAR(191) DEFAULT '',
    `batchId` VARCHAR(191) DEFAULT '',
    `declarationStatus` VARCHAR(191) NOT NULL,
    `declarationType` VARCHAR(191) NOT NULL,
    `claimNumber` VARCHAR(191),
    `claimRequestDate` DATETIME(3),
    `claimStatus` VARCHAR(191),
    `claimType` VARCHAR(191),

    INDEX `OrderOverview.orderNumber_orderStatus_index`(`orderNumber`, `orderStatus`),
    INDEX `OrderOverview.orderNumber_index`(`orderNumber`),
    INDEX `OrderOverview.orderStatus_index`(`orderStatus`),
    INDEX `OrderOverview.invoiceNumber_index`(`invoiceNumber`),
    INDEX `OrderOverview.ecomCode_index`(`ecomCode`),
    PRIMARY KEY (`orderNumber`, `invoiceNumber`, `ecomCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderExceptionOverview` (
    `orderNumber` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `ecomCode` VARCHAR(191) NOT NULL,
    `locked` BOOLEAN NOT NULL,
    `lockedBy` VARCHAR(191) NOT NULL,
    `batchId` VARCHAR(191) NOT NULL,
    `declarationStatus` VARCHAR(191) NOT NULL,
    `declarationReference` VARCHAR(191) NOT NULL,
    `rejectionDate` DATETIME(3),
    `flightNumber` VARCHAR(191) NOT NULL,
    `transport` VARCHAR(191) NOT NULL,
    `mawb` VARCHAR(191) NOT NULL,

    INDEX `OrderExceptionOverview.orderNumber_index`(`orderNumber`),
    INDEX `OrderExceptionOverview.invoiceNumber_index`(`invoiceNumber`),
    INDEX `OrderExceptionOverview.ecomCode_index`(`ecomCode`),
    INDEX `OrderExceptionOverview.transport_index`(`transport`),
    INDEX `OrderExceptionOverview.declarationReference_index`(`declarationReference`),
    INDEX `OrderExceptionOverview.mawb_index`(`mawb`),
    INDEX `OrderExceptionOverview.batchId_index`(`batchId`),
    PRIMARY KEY (`orderNumber`, `invoiceNumber`, `ecomCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CancelledOrderOverview` (
    `orderNumber` VARCHAR(191) NOT NULL,
    `ecomCode` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `orderDate` DATETIME(3),
    `cancelDate` DATETIME(3),
    `numberOfItems` INTEGER NOT NULL,
    `cancellationReason` VARCHAR(191) NOT NULL,

    INDEX `CancelledOrderOverview.orderNumber_index`(`orderNumber`),
    INDEX `CancelledOrderOverview.invoiceNumber_index`(`invoiceNumber`),
    INDEX `CancelledOrderOverview.ecomCode_index`(`ecomCode`),
    INDEX `CancelledOrderOverview.orderDate_index`(`orderDate`),
    INDEX `CancelledOrderOverview.cancelDate_index`(`cancelDate`),
    PRIMARY KEY (`orderNumber`, `invoiceNumber`, `ecomCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReturnedOrderOverview` (
    `orderNumber` VARCHAR(191) NOT NULL,
    `ecomCode` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `orderDate` DATETIME(3),
    `returnDate` DATETIME(3),
    `numberOfReturnItems` INTEGER NOT NULL,
    `returnReason` VARCHAR(191) NOT NULL,
    `declarationNumber` VARCHAR(191) DEFAULT '',
    `batchId` VARCHAR(191) DEFAULT '',
    `declarationStatus` VARCHAR(191) DEFAULT '',
    `declarationType` VARCHAR(191) DEFAULT '',
    `declarationPurposeDetails` VARCHAR(191) NOT NULL,
    `returnRequestNo` VARCHAR(191) NOT NULL,
    `prevTransportDocNo` VARCHAR(191) NOT NULL,
    `returnJustification` VARCHAR(191) NOT NULL,

    INDEX `ReturnedOrderOverview.orderNumber_index`(`orderNumber`),
    INDEX `ReturnedOrderOverview.invoiceNumber_index`(`invoiceNumber`),
    INDEX `ReturnedOrderOverview.ecomCode_index`(`ecomCode`),
    INDEX `ReturnedOrderOverview.orderDate_index`(`orderDate`),
    INDEX `ReturnedOrderOverview.returnDate_index`(`returnDate`),
    PRIMARY KEY (`orderNumber`, `invoiceNumber`, `ecomCode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ManualRetryView` (
    `orderNumber` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `ecomCode` VARCHAR(191) NOT NULL,
    `contractType` VARCHAR(191) NOT NULL,
    `errorCode` VARCHAR(191) NOT NULL,
    `errorDesc` VARCHAR(191) NOT NULL,
    `failDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `retryButton` BOOLEAN NOT NULL,
    `contractMethod` VARCHAR(191) NOT NULL,
    `vcId` VARCHAR(191),
    `remark` VARCHAR(191),

    INDEX `ManualRetryView.orderNumber_index`(`orderNumber`),
    INDEX `ManualRetryView.invoiceNumber_index`(`invoiceNumber`),
    INDEX `ManualRetryView.ecomCode_index`(`ecomCode`),
    INDEX `ManualRetryView.failDate_index`(`failDate`),
    INDEX `ManualRetryView.contractType_index`(`contractType`),
    INDEX `ManualRetryView.errorCode_index`(`errorCode`),
    INDEX `ManualRetryView.errorDesc_index`(`errorDesc`),
    INDEX `ManualRetryView.status_index`(`status`),
    INDEX `ManualRetryView.retryButton_index`(`retryButton`),
    INDEX `ManualRetryView.contractMethod_index`(`contractMethod`),
    INDEX `ManualRetryView.remark_index`(`remark`),
    PRIMARY KEY (`orderNumber`, `invoiceNumber`, `ecomCode`, `contractMethod`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderAirwayMawb` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `airwayNo` VARCHAR(191) NOT NULL,
    `mawb` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` ENUM('viewer', 'editor', 'admin', 'super_admin') NOT NULL,
    `locked` BOOLEAN NOT NULL DEFAULT false,
    `archived` BOOLEAN NOT NULL DEFAULT false,
    `failedLoginAttempts` INTEGER NOT NULL DEFAULT 0,
    `passwordChangeRequired` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `archivedAt` DATETIME(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `token` VARCHAR(500) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `RefreshToken.userId_unique`(`userId`),
    PRIMARY KEY (`token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Invoice` ADD FOREIGN KEY (`orderNumber`, `ecomBusinessCode`) REFERENCES `Order`(`orderNumber`, `ecomBusinessCode`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderLine` ADD FOREIGN KEY (`invoiceNumber`, `orderNumber`, `ecomBusinessCode`) REFERENCES `Invoice`(`invoiceNumber`, `orderNumber`, `ecomBusinessCode`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnReceipt` ADD FOREIGN KEY (`invoiceNumber`, `orderNumber`, `ecomBusinessCode`) REFERENCES `Invoice`(`invoiceNumber`, `orderNumber`, `ecomBusinessCode`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReturnReceiptOrderLine` ADD FOREIGN KEY (`invoiceNumber`, `orderNumber`, `ecomBusinessCode`, `returnRequestNumber`) REFERENCES `ReturnReceipt`(`invoiceNumber`, `orderNumber`, `ecomBusinessCode`, `returnRequestNumber`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChainEvent` ADD FOREIGN KEY (`orderId`, `ecomBusinessCode`) REFERENCES `Order`(`orderNumber`, `ecomBusinessCode`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChainEventException` ADD FOREIGN KEY (`chainEventId`) REFERENCES `ChainEvent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Error` ADD FOREIGN KEY (`orderId`, `ecomBusinessCode`) REFERENCES `Order`(`orderNumber`, `ecomBusinessCode`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Address` ADD FOREIGN KEY (`orderId`, `ecomBusinessCode`) REFERENCES `Order`(`orderNumber`, `ecomBusinessCode`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HouseBill` ADD FOREIGN KEY (`orderId`, `ecomBusinessCode`) REFERENCES `Order`(`orderNumber`, `ecomBusinessCode`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Movement` ADD FOREIGN KEY (`orderId`, `ecomBusinessCode`) REFERENCES `Order`(`orderNumber`, `ecomBusinessCode`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShippingDetails` ADD FOREIGN KEY (`movementId`) REFERENCES `Movement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageDetails` ADD FOREIGN KEY (`movementId`) REFERENCES `Movement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Declaration` ADD FOREIGN KEY (`orderId`, `ecomBusinessCode`) REFERENCES `Order`(`orderNumber`, `ecomBusinessCode`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeclarationError` ADD FOREIGN KEY (`orderId`, `ecomBusinessCode`, `hyperledgerKey`) REFERENCES `Declaration`(`orderId`, `ecomBusinessCode`, `hyperledgerKey`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Claim` ADD FOREIGN KEY (`orderId`, `ecomBusinessCode`, `hyperledgerKey`) REFERENCES `Declaration`(`orderId`, `ecomBusinessCode`, `hyperledgerKey`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Party` ADD FOREIGN KEY (`orderId`, `ecomBusinessCode`, `declarationNumber`) REFERENCES `Claim`(`orderId`, `ecomBusinessCode`, `declarationNumber`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Delivered` ADD FOREIGN KEY (`orderId`, `ecomBusinessCode`) REFERENCES `Order`(`orderNumber`, `ecomBusinessCode`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Permit` ADD FOREIGN KEY (`orderLineId`) REFERENCES `OrderLine`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Duty` ADD FOREIGN KEY (`orderLineId`) REFERENCES `OrderLine`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
