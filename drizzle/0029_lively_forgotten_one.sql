CREATE TABLE `obdScanReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportUserId` int NOT NULL,
	`reportVehicleId` int,
	`reportHealthScore` int DEFAULT 0,
	`reportDtcCodes` json,
	`reportLiveData` json,
	`reportMultiEcuData` json,
	`reportProtocol` varchar(100),
	`reportVin` varchar(50),
	`reportMake` varchar(100),
	`reportModel` varchar(100),
	`reportYear` int,
	`reportMileage` int,
	`reportTechnicianNotes` text,
	`reportReviewStatus` enum('pending','reviewed','action_required') NOT NULL DEFAULT 'pending',
	`reportScanDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `obdScanReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userVehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicleUserId` int NOT NULL,
	`vehicleMake` varchar(100) NOT NULL,
	`vehicleModel` varchar(100) NOT NULL,
	`vehicleYear` int,
	`vehicleVin` varchar(50),
	`vehicleMileage` int,
	`vehicleColor` varchar(50),
	`vehiclePlateNumber` varchar(20),
	`vehicleFuelType` enum('gasoline','diesel','hybrid','electric') DEFAULT 'gasoline',
	`vehicleNotes` text,
	`vehicleIsDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userVehicles_id` PRIMARY KEY(`id`)
);
