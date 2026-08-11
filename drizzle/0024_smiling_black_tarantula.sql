ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','technician') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);