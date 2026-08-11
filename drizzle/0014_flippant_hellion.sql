CREATE TABLE `parts_prices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partId` int NOT NULL,
	`modelId` int NOT NULL,
	`priceMin` int NOT NULL,
	`priceMax` int NOT NULL,
	`priceAverage` int NOT NULL,
	`quality` enum('original','oem','aftermarket') NOT NULL DEFAULT 'oem',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parts_prices_id` PRIMARY KEY(`id`)
);
