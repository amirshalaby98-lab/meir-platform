CREATE TABLE `badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(100) NOT NULL,
	`color` varchar(20) NOT NULL DEFAULT 'yellow',
	`type` enum('rating','jobs','reviews','consistency','growth','special') NOT NULL,
	`minRating` decimal(3,1),
	`minJobs` int,
	`minReviews` int,
	`minConsistencyDays` int,
	`minGrowthPercentage` decimal(5,2),
	`isActive` boolean NOT NULL DEFAULT true,
	`rarity` enum('common','uncommon','rare','epic','legendary') NOT NULL DEFAULT 'common',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaderboard` (
	`id` int AUTO_INCREMENT NOT NULL,
	`technicianId` int NOT NULL,
	`ratingScore` decimal(5,2) NOT NULL DEFAULT '0',
	`jobsScore` int NOT NULL DEFAULT 0,
	`reviewsScore` int NOT NULL DEFAULT 0,
	`totalScore` decimal(8,2) NOT NULL DEFAULT '0',
	`rank` int NOT NULL DEFAULT 0,
	`previousRank` int,
	`period` enum('weekly','monthly','yearly','all_time') NOT NULL DEFAULT 'monthly',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leaderboard_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` int NOT NULL,
	`vendorId` int NOT NULL,
	`response` text NOT NULL,
	`helpful` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `review_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` int NOT NULL,
	`userId` int NOT NULL,
	`voteType` enum('helpful','unhelpful') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `review_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(100) NOT NULL,
	`type` enum('discount','bonus','feature','recognition','priority') NOT NULL,
	`value` decimal(10,2),
	`percentage` decimal(5,2),
	`minRating` decimal(3,1),
	`minJobs` int,
	`maxRewardCount` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`validFrom` timestamp NOT NULL DEFAULT (now()),
	`validUntil` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savedFilters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`startDate` timestamp,
	`endDate` timestamp,
	`technicianId` int,
	`minRating` decimal(3,1) NOT NULL DEFAULT '1',
	`maxRating` decimal(3,1) NOT NULL DEFAULT '5',
	`minReviews` int NOT NULL DEFAULT 0,
	`sortBy` enum('rating','jobs','reviews','name') NOT NULL DEFAULT 'rating',
	`isDefault` boolean NOT NULL DEFAULT false,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastUsedAt` timestamp,
	CONSTRAINT `savedFilters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technicianBadges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`technicianId` int NOT NULL,
	`badgeId` int NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isPinned` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `technicianBadges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `technicianRewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`technicianId` int NOT NULL,
	`rewardId` int NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`status` enum('pending','active','used','expired') NOT NULL DEFAULT 'pending',
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `technicianRewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendor_rating_summary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`averageRating` decimal(3,2) NOT NULL DEFAULT '0',
	`totalReviews` int NOT NULL DEFAULT 0,
	`fiveStarCount` int NOT NULL DEFAULT 0,
	`fourStarCount` int NOT NULL DEFAULT 0,
	`threeStarCount` int NOT NULL DEFAULT 0,
	`twoStarCount` int NOT NULL DEFAULT 0,
	`oneStarCount` int NOT NULL DEFAULT 0,
	`recommendationPercentage` decimal(5,2) NOT NULL DEFAULT '0',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendor_rating_summary_id` PRIMARY KEY(`id`),
	CONSTRAINT `vendor_rating_summary_vendorId_unique` UNIQUE(`vendorId`)
);
--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `comment` text;--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `service` varchar(255);--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `location` varchar(255);--> statement-breakpoint
ALTER TABLE `vendors` MODIFY COLUMN `vendorType` enum('parts_shop','technician','junkyard','tow_truck','trainer') NOT NULL;