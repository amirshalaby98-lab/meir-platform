CREATE TABLE `junkyards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`city` varchar(100) NOT NULL,
	`area` varchar(100) NOT NULL,
	`rating` decimal(2,1) DEFAULT '0.0',
	`reviews` int DEFAULT 0,
	`specialties` text,
	`hasWarranty` boolean DEFAULT false,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `junkyards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parts_shops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`city` varchar(100) NOT NULL,
	`area` varchar(100) NOT NULL,
	`rating` decimal(2,1) DEFAULT '0.0',
	`reviews` int DEFAULT 0,
	`specialties` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parts_shops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tow_trucks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`city` varchar(100) NOT NULL,
	`area` varchar(100) NOT NULL,
	`rating` decimal(2,1) DEFAULT '0.0',
	`reviews` int DEFAULT 0,
	`services` text,
	`price` varchar(100),
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tow_trucks_id` PRIMARY KEY(`id`)
);
