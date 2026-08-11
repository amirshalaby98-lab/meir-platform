CREATE TABLE `loyaltyPoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerPhone` varchar(20) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	`totalEarned` int NOT NULL DEFAULT 0,
	`totalRedeemed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyaltyPoints_id` PRIMARY KEY(`id`),
	CONSTRAINT `loyaltyPoints_customerPhone_unique` UNIQUE(`customerPhone`)
);
--> statement-breakpoint
CREATE TABLE `pointsHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerPhone` varchar(20) NOT NULL,
	`points` int NOT NULL,
	`type` enum('earn','redeem') NOT NULL,
	`reason` varchar(255) NOT NULL,
	`bookingId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pointsHistory_id` PRIMARY KEY(`id`)
);
