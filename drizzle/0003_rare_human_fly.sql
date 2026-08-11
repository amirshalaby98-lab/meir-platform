ALTER TABLE `bookings` ADD `technicianId` int;--> statement-breakpoint
ALTER TABLE `bookings` ADD `technicianName` varchar(255);--> statement-breakpoint
ALTER TABLE `bookings` ADD `reviewSent` int DEFAULT 0 NOT NULL;