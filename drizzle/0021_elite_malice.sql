CREATE TABLE `aiDiagnosticReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int,
	`userId` int,
	`requestType` enum('obd_code','symptom_description','photo_analysis','sound_analysis','full_report') DEFAULT 'obd_code',
	`inputData` text,
	`vehicleInfo` json,
	`diagnosis` text,
	`recommendations` json,
	`estimatedCosts` json,
	`urgencyLevel` enum('low','medium','high','critical') DEFAULT 'medium',
	`confidence` int DEFAULT 0,
	`status` enum('pending','processing','completed','failed') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiDiagnosticReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consultations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`engineerId` int,
	`consultationType` enum('quick','detailed','emergency') DEFAULT 'quick',
	`vehicleInfo` json,
	`description` text,
	`attachments` json,
	`engineerReport` text,
	`recommendations` json,
	`price` decimal(10,2),
	`isPaid` boolean DEFAULT false,
	`paidAt` timestamp,
	`status` enum('pending','assigned','in_progress','completed','cancelled') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consultations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fleetCompanies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`companyName` varchar(255) NOT NULL,
	`contactPerson` varchar(255),
	`phone` varchar(20) NOT NULL,
	`email` varchar(320),
	`vehicleCount` int DEFAULT 0,
	`contractType` enum('monthly','yearly','per_service') DEFAULT 'monthly',
	`status` enum('active','inactive','suspended') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fleetCompanies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fleetVehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`vin` varchar(20),
	`plateNumber` varchar(20),
	`make` varchar(100),
	`model` varchar(100),
	`year` varchar(10),
	`mileage` int DEFAULT 0,
	`lastServiceDate` timestamp,
	`nextServiceDate` timestamp,
	`status` enum('active','in_service','out_of_service') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fleetVehicles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `obdDtcResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`dtcCode` varchar(10) NOT NULL,
	`category` enum('P','B','C','U') NOT NULL,
	`severity` enum('low','medium','high') DEFAULT 'medium',
	`description` text,
	`system` varchar(100),
	`causes` json,
	`solution` text,
	`estimatedCost` varchar(50),
	`isCleared` boolean DEFAULT false,
	`clearedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `obdDtcResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `obdSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int,
	`technicianId` int,
	`userId` int,
	`vin` varchar(20),
	`vehicleMake` varchar(100),
	`vehicleModel` varchar(100),
	`vehicleYear` varchar(10),
	`engineType` varchar(100),
	`deviceName` varchar(100),
	`protocol` varchar(100),
	`connectionType` enum('bluetooth','wifi','usb','simulation') DEFAULT 'simulation',
	`sessionType` enum('full_scan','dtc_read','dtc_clear','live_data','ai_diagnosis') DEFAULT 'full_scan',
	`dtcCount` int DEFAULT 0,
	`status` enum('active','completed','failed') DEFAULT 'active',
	`notes` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `obdSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partsListings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int,
	`partName` varchar(255) NOT NULL,
	`partNumber` varchar(100),
	`oemNumber` varchar(100),
	`compatibleVins` json,
	`compatibleMakes` json,
	`compatibleModels` json,
	`category` varchar(100),
	`condition` enum('new','used','refurbished') DEFAULT 'new',
	`price` decimal(10,2),
	`currency` varchar(5) DEFAULT 'SAR',
	`quantity` int DEFAULT 1,
	`description` text,
	`images` json,
	`isAvailable` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partsListings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizAttempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quizId` int NOT NULL,
	`userId` int NOT NULL,
	`score` int DEFAULT 0,
	`totalQuestions` int DEFAULT 0,
	`correctAnswers` int DEFAULT 0,
	`passed` boolean DEFAULT false,
	`answers` json,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizAttempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizQuestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quizId` int NOT NULL,
	`question` text NOT NULL,
	`options` json NOT NULL,
	`correctAnswer` int NOT NULL,
	`explanation` text,
	`points` int DEFAULT 1,
	`orderIndex` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizQuestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`passingScore` int DEFAULT 70,
	`timeLimit` int,
	`questionCount` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workshops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`ownerName` varchar(255),
	`phone` varchar(20) NOT NULL,
	`email` varchar(320),
	`city` varchar(100) NOT NULL,
	`area` varchar(100),
	`address` text,
	`description` text,
	`specialties` json,
	`workingHours` varchar(100),
	`rating` decimal(3,2) DEFAULT '0',
	`totalReviews` int DEFAULT 0,
	`completedJobs` int DEFAULT 0,
	`commercialLicense` varchar(100),
	`status` enum('pending','approved','rejected','suspended') DEFAULT 'pending',
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workshops_id` PRIMARY KEY(`id`)
);
