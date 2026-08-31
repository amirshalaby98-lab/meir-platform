CREATE TABLE `consultationPayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`consultationId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`paymentMethod` enum('bank_transfer','stc_pay','mada','credit_card','cash') NOT NULL,
	`status` enum('pending','confirmed','failed','refunded') NOT NULL DEFAULT 'pending',
	`reference` varchar(255),
	`receiptUrl` varchar(500),
	`confirmedAt` timestamp,
	`confirmedBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consultationPayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productOrderPayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`paymentMethod` enum('bank_transfer','stc_pay','mada','credit_card','cash') NOT NULL,
	`status` enum('pending','confirmed','failed','refunded') NOT NULL DEFAULT 'pending',
	`reference` varchar(255),
	`receiptUrl` varchar(500),
	`notes` text,
	`confirmedAt` timestamp,
	`confirmedBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productOrderPayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(20) NOT NULL,
	`customerId` int NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerPhone` varchar(20) NOT NULL,
	`customerEmail` varchar(320),
	`productId` int NOT NULL,
	`productNameSnapshot` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(10,2) NOT NULL,
	`totalPrice` decimal(10,2) NOT NULL,
	`shippingName` varchar(255) NOT NULL,
	`shippingPhone` varchar(20) NOT NULL,
	`shippingAddress` text NOT NULL,
	`shippingCity` varchar(100) NOT NULL,
	`orderStatus` enum('pending_payment','paid','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending_payment',
	`adminNotes` text,
	`shippedAt` timestamp,
	`deliveredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `productOrders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`price` decimal(10,2) NOT NULL,
	`stockQuantity` int NOT NULL DEFAULT 0,
	`images` json,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `consultations` MODIFY COLUMN `status` enum('pending_payment','pending','assigned','in_progress','completed','cancelled') DEFAULT 'pending_payment';