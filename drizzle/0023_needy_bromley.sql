CREATE TABLE `obdScanResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanOrderId` int NOT NULL,
	`scanDate` timestamp NOT NULL DEFAULT (now()),
	`scannedVin` varchar(17),
	`obdProtocol` varchar(50),
	`storedCodes` json,
	`pendingCodes` json,
	`permanentCodes` json,
	`liveData` json,
	`freezeFrameData` json,
	`technicianDiagnosis` text,
	`scanRecommendations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `obdScanResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderPayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paymentOrderId` int NOT NULL,
	`paymentType` enum('inspection','repair','additional') NOT NULL,
	`paymentAmount` decimal(10,2) NOT NULL,
	`paymentMethod` enum('bank_transfer','stc_pay','mada','credit_card','cash') NOT NULL,
	`paymentStatus` enum('pending','confirmed','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentReference` varchar(255),
	`receiptUrl` varchar(500),
	`paymentNotes` text,
	`confirmedAt` timestamp,
	`confirmedBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orderPayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photoOrderId` int NOT NULL,
	`photoType` enum('before','after','during','receipt') NOT NULL,
	`photoS3Key` varchar(500) NOT NULL,
	`photoCaption` varchar(255),
	`uploadedBy` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderPhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderStatusHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`statusOrderId` int NOT NULL,
	`fromStatus` varchar(50),
	`toStatus` varchar(50) NOT NULL,
	`changedBy` varchar(100),
	`changedByRole` enum('system','admin','technician','customer') DEFAULT 'system',
	`statusNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderStatusHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderVehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicleCustomerId` int NOT NULL,
	`vehicleBrand` varchar(100) NOT NULL,
	`vehicleModel` varchar(100) NOT NULL,
	`vehicleYear` varchar(4) NOT NULL,
	`plateNumber` varchar(20),
	`vin` varchar(17),
	`vehicleColor` varchar(50),
	`vehicleMileage` int,
	`engineType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orderVehicles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderVideos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoOrderId` int NOT NULL,
	`videoS3Key` varchar(500) NOT NULL,
	`videoOriginalName` varchar(255),
	`videoMimeType` varchar(50) NOT NULL,
	`videoFileSize` int NOT NULL,
	`videoDuration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderVideos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `repairQuotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteOrderId` int NOT NULL,
	`quoteItems` json NOT NULL,
	`quoteSubtotal` decimal(10,2) NOT NULL,
	`quoteTax` decimal(10,2) DEFAULT '0.00',
	`quoteDiscount` decimal(10,2) DEFAULT '0.00',
	`quoteTotalAmount` decimal(10,2) NOT NULL,
	`quoteStatus` enum('pending','approved','rejected','expired') NOT NULL DEFAULT 'pending',
	`approvedAt` timestamp,
	`approvedBy` varchar(255),
	`quoteNotes` text,
	`validUntil` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `repairQuotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serviceInvoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceOrderId` int NOT NULL,
	`svcInvoiceNumber` varchar(30) NOT NULL,
	`svcInvoiceCustomerName` varchar(255) NOT NULL,
	`svcInvoiceCustomerPhone` varchar(20) NOT NULL,
	`svcInvoiceVehicleInfo` varchar(500),
	`svcInvoiceItems` json NOT NULL,
	`svcInvoiceSubtotal` decimal(10,2) NOT NULL,
	`svcInvoiceTax` decimal(10,2) DEFAULT '0.00',
	`svcInvoiceDiscount` decimal(10,2) DEFAULT '0.00',
	`svcInvoiceTotalAmount` decimal(10,2) NOT NULL,
	`svcInvoiceStatus` enum('draft','issued','paid','cancelled') NOT NULL DEFAULT 'draft',
	`svcInvoiceIssuedAt` timestamp,
	`svcInvoiceNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serviceInvoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `serviceInvoices_svcInvoiceNumber_unique` UNIQUE(`svcInvoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `serviceOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(20) NOT NULL,
	`customerId` int NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerPhone` varchar(20) NOT NULL,
	`customerEmail` varchar(320),
	`customerLocation` text,
	`customerLat` decimal(10,7),
	`customerLng` decimal(10,7),
	`vehicleId` int,
	`complaint` text NOT NULL,
	`orderStatus` enum('pending_payment','paid','assigned','accepted','en_route','arrived','diagnosing','diagnosis_complete','quote_sent','quote_approved','repair_payment_pending','repair_paid','repairing','repair_complete','completed','cancelled') NOT NULL DEFAULT 'pending_payment',
	`orderTechnicianId` int,
	`orderTechnicianName` varchar(255),
	`inspectionFee` decimal(10,2) DEFAULT '200.00',
	`repairCost` decimal(10,2),
	`totalAmount` decimal(10,2),
	`adminNotes` text,
	`technicianNotes` text,
	`assignedAt` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serviceOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `serviceOrders_orderNumber_unique` UNIQUE(`orderNumber`)
);
