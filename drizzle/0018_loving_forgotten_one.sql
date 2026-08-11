CREATE TABLE `chat_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`conversationId` int NOT NULL,
	`messageId` int NOT NULL,
	`type` enum('new_message','offer_received','offer_accepted','offer_rejected') NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`userId` int NOT NULL,
	`userType` enum('customer','vendor') NOT NULL,
	`lastReadMessageId` int,
	`unreadCount` int NOT NULL DEFAULT 0,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`vendorId` int NOT NULL,
	`bookingId` int,
	`subject` varchar(255) NOT NULL,
	`status` enum('active','closed','archived') NOT NULL DEFAULT 'active',
	`lastMessageAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`senderType` enum('customer','vendor') NOT NULL,
	`content` text NOT NULL,
	`messageType` enum('text','offer','image') NOT NULL DEFAULT 'text',
	`offerId` int,
	`imageUrl` varchar(500),
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`vendorId` int NOT NULL,
	`customerId` int NOT NULL,
	`bookingId` int,
	`description` text NOT NULL,
	`originalPrice` decimal(10,2) NOT NULL,
	`offeredPrice` decimal(10,2) NOT NULL,
	`discountPercentage` decimal(5,2) DEFAULT '0',
	`laborHours` decimal(5,2),
	`parts` text,
	`status` enum('pending','accepted','rejected','expired') NOT NULL DEFAULT 'pending',
	`expiresAt` timestamp,
	`acceptedAt` timestamp,
	`rejectedAt` timestamp,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `price_offers_id` PRIMARY KEY(`id`)
);
