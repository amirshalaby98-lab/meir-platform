DROP TABLE `badges`;--> statement-breakpoint
DROP TABLE `bookings`;--> statement-breakpoint
DROP TABLE `fleetCompanies`;--> statement-breakpoint
DROP TABLE `fleetMaintenance`;--> statement-breakpoint
DROP TABLE `fleetVehicles`;--> statement-breakpoint
DROP TABLE `junkyards`;--> statement-breakpoint
DROP TABLE `leaderboard`;--> statement-breakpoint
DROP TABLE `partsListings`;--> statement-breakpoint
DROP TABLE `parts_shops`;--> statement-breakpoint
DROP TABLE `rewards`;--> statement-breakpoint
DROP TABLE `technicianBadges`;--> statement-breakpoint
DROP TABLE `technicianRewards`;--> statement-breakpoint
DROP TABLE `technicians`;--> statement-breakpoint
DROP TABLE `tow_trucks`;--> statement-breakpoint
DROP TABLE `workshops`;--> statement-breakpoint
-- Data cleanup: hard-delete vendors of the removed types (parts_shop, junkyard,
-- tow_truck, technician) and their dependent rows. `trainer` vendors are the
-- only survivors of this enum and are left untouched.
DELETE FROM `vendor_verification_codes` WHERE `vendorId` IN (SELECT `id` FROM `vendors` WHERE `vendorType` IN ('parts_shop', 'junkyard', 'tow_truck', 'technician'));--> statement-breakpoint
DELETE FROM `vendor_documents` WHERE `vendorId` IN (SELECT `id` FROM `vendors` WHERE `vendorType` IN ('parts_shop', 'junkyard', 'tow_truck', 'technician'));--> statement-breakpoint
DELETE FROM `vendor_services` WHERE `vendorId` IN (SELECT `id` FROM `vendors` WHERE `vendorType` IN ('parts_shop', 'junkyard', 'tow_truck', 'technician'));--> statement-breakpoint
DELETE FROM `vendor_rating_summary` WHERE `vendorId` IN (SELECT `id` FROM `vendors` WHERE `vendorType` IN ('parts_shop', 'junkyard', 'tow_truck', 'technician'));--> statement-breakpoint
DELETE FROM `vendors` WHERE `vendorType` IN ('parts_shop', 'junkyard', 'tow_truck', 'technician');