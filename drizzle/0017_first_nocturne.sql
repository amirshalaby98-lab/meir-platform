CREATE TABLE `advanced_price_calculations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brandId` int NOT NULL,
	`modelId` int NOT NULL,
	`partId` int NOT NULL,
	`partVariantId` int,
	`serviceTypeId` int NOT NULL,
	`selectedOptionalLabor` text,
	`partPrice` decimal(10,2) NOT NULL,
	`laborHours` decimal(5,2) NOT NULL,
	`hourlyRate` decimal(10,2) NOT NULL,
	`laborCost` decimal(10,2) NOT NULL,
	`distance` int NOT NULL,
	`pricePerKm` decimal(10,2) NOT NULL,
	`distanceCost` decimal(10,2) NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`taxAmount` decimal(10,2) DEFAULT '0',
	`discountAmount` decimal(10,2) DEFAULT '0',
	`totalCost` decimal(10,2) NOT NULL,
	`customerIp` varchar(50),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `advanced_price_calculations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `optional_labor` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceTypeId` int NOT NULL,
	`partId` int NOT NULL,
	`modelId` int NOT NULL,
	`laborCode` varchar(50) NOT NULL,
	`laborName` varchar(255) NOT NULL,
	`skillLevel` varchar(10) NOT NULL,
	`minHours` decimal(5,2) NOT NULL,
	`maxHours` decimal(5,2) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `optional_labor_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `part_variants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partId` int NOT NULL,
	`modelId` int NOT NULL,
	`variantCode` varchar(50) NOT NULL,
	`variantName` varchar(255) NOT NULL,
	`oemPartNumber` varchar(100),
	`price` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `part_variants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partId` int NOT NULL,
	`modelId` int NOT NULL,
	`serviceTypeCode` varchar(50) NOT NULL,
	`serviceTypeName` varchar(255) NOT NULL,
	`description` text,
	`skillLevel` varchar(10) NOT NULL,
	`minHours` decimal(5,2) NOT NULL,
	`maxHours` decimal(5,2) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_types_id` PRIMARY KEY(`id`)
);
