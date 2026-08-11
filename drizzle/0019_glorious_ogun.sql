CREATE TABLE `customer_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`customerId` int NOT NULL,
	`totalOrders` int NOT NULL DEFAULT 0,
	`totalSpent` decimal(12,2) NOT NULL DEFAULT '0',
	`lastOrderDate` timestamp,
	`averageOrderValue` decimal(10,2) NOT NULL DEFAULT '0',
	`customerLifetimeValue` decimal(12,2) NOT NULL DEFAULT '0',
	`isRepeat` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthly_revenue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`month` varchar(7) NOT NULL,
	`revenue` decimal(12,2) NOT NULL DEFAULT '0',
	`orders` int NOT NULL DEFAULT 0,
	`commission` decimal(12,2) NOT NULL DEFAULT '0',
	`netRevenue` decimal(12,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `monthly_revenue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revenue_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`orderId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`commission` decimal(10,2) NOT NULL DEFAULT '0',
	`netAmount` decimal(10,2) NOT NULL,
	`paymentStatus` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`transactionDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `revenue_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`serviceId` int NOT NULL,
	`serviceName` varchar(255) NOT NULL,
	`totalRequests` int NOT NULL DEFAULT 0,
	`completedRequests` int NOT NULL DEFAULT 0,
	`totalRevenue` decimal(12,2) NOT NULL DEFAULT '0',
	`averagePrice` decimal(10,2) NOT NULL DEFAULT '0',
	`averageRating` decimal(3,2) NOT NULL DEFAULT '0',
	`lastMonthRequests` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendor_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`totalRevenue` decimal(12,2) NOT NULL DEFAULT '0',
	`monthlyRevenue` decimal(12,2) NOT NULL DEFAULT '0',
	`totalOrders` int NOT NULL DEFAULT 0,
	`completedOrders` int NOT NULL DEFAULT 0,
	`pendingOrders` int NOT NULL DEFAULT 0,
	`cancelledOrders` int NOT NULL DEFAULT 0,
	`averageRating` decimal(3,2) NOT NULL DEFAULT '0',
	`totalReviews` int NOT NULL DEFAULT 0,
	`totalCustomers` int NOT NULL DEFAULT 0,
	`repeatCustomers` int NOT NULL DEFAULT 0,
	`responseTime` int NOT NULL DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vendor_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `vendor_stats_vendorId_unique` UNIQUE(`vendorId`)
);
