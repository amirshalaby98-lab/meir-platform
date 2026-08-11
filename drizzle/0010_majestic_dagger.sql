CREATE TABLE `car_brands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `car_brands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `car_models` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brandId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`yearFrom` int,
	`yearTo` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `car_models_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `labor_times` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modelId` int NOT NULL,
	`partId` int NOT NULL,
	`hours` varchar(10) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `labor_times_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricing_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hourlyRate` int NOT NULL DEFAULT 200,
	`pricePerKm` int NOT NULL DEFAULT 5,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricing_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_parts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `service_parts_id` PRIMARY KEY(`id`)
);
