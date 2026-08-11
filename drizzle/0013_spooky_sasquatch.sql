ALTER TABLE `pricing_settings` MODIFY COLUMN `hourlyRate` int NOT NULL DEFAULT 100;--> statement-breakpoint
ALTER TABLE `pricing_settings` MODIFY COLUMN `pricePerKm` int NOT NULL DEFAULT 2;