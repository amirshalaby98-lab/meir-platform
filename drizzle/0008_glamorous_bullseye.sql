CREATE TABLE `instructors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`bio` text,
	`avatar` varchar(500),
	`specialization` varchar(255),
	`experience` int DEFAULT 0,
	`rating` int NOT NULL DEFAULT 5,
	`totalCourses` int NOT NULL DEFAULT 0,
	`totalStudents` int NOT NULL DEFAULT 0,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instructors_id` PRIMARY KEY(`id`),
	CONSTRAINT `instructors_email_unique` UNIQUE(`email`)
);
