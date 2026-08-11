CREATE TABLE `technicians` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320),
	`specialization` varchar(255),
	`location` varchar(100) NOT NULL,
	`status` enum('available','busy','offline') NOT NULL DEFAULT 'available',
	`rating` int NOT NULL DEFAULT 5,
	`completedJobs` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `technicians_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contactMessages` MODIFY COLUMN `email` varchar(320);--> statement-breakpoint
ALTER TABLE `contactMessages` ADD `read` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `reviews` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `contactMessages` DROP COLUMN `status`;--> statement-breakpoint
ALTER TABLE `reviews` DROP COLUMN `bookingId`;