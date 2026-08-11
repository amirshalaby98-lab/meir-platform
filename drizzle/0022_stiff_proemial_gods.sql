CREATE TABLE `consultationReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`consultationId` int NOT NULL,
	`engineerId` int NOT NULL,
	`diagnosis` text,
	`recommendations` text,
	`estimatedCost` decimal(10,2),
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`partsNeeded` json,
	`reportAttachments` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consultationReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fleetMaintenance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicleId` int NOT NULL,
	`fleetMaintenanceCompanyId` int NOT NULL,
	`serviceType` varchar(200),
	`maintenanceDescription` text,
	`maintenanceCost` decimal(10,2),
	`maintenanceTechnicianId` int,
	`maintenanceStatus` enum('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
	`scheduledDate` timestamp,
	`completedDate` timestamp,
	`mileageAtService` int,
	`maintenanceNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fleetMaintenance_id` PRIMARY KEY(`id`)
);
