CREATE TABLE `vendor_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`documentType` enum('commercial_license','tax_certificate','bank_details','id_card') NOT NULL,
	`documentUrl` varchar(500) NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vendor_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendor_services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`serviceName` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendor_services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendor_verification_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`code` varchar(10) NOT NULL,
	`type` enum('email','sms') NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vendor_verification_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorType` enum('parts_shop','technician','junkyard') NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`ownerName` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320) NOT NULL,
	`city` varchar(100) NOT NULL,
	`area` varchar(100) NOT NULL,
	`address` text,
	`description` text,
	`commercialLicense` varchar(100),
	`taxId` varchar(100),
	`bankAccount` varchar(100),
	`rating` decimal(3,2) DEFAULT '0',
	`status` enum('pending','verified','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
	`verificationCode` varchar(10),
	`verificationCodeExpiry` timestamp,
	`verifiedAt` timestamp,
	`approvedAt` timestamp,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendors_id` PRIMARY KEY(`id`)
);
