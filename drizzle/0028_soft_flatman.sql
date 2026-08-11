ALTER TABLE `technicians` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `technicians` ADD `nationalId` varchar(20);--> statement-breakpoint
ALTER TABLE `technicians` ADD `yearsExperience` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `technicians` ADD `approvalStatus` enum('pending','approved','rejected') DEFAULT 'pending' NOT NULL;