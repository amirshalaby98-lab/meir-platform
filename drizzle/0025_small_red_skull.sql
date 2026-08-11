ALTER TABLE `car_brands` ADD `logo` varchar(500);--> statement-breakpoint
ALTER TABLE `car_brands` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `car_models` ADD `image` varchar(500);--> statement-breakpoint
ALTER TABLE `car_models` ADD `isActive` boolean DEFAULT true NOT NULL;