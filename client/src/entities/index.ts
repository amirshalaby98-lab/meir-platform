/**
 * Entities Layer - Domain models and type definitions
 * 
 * This layer defines the core business entities used across the application.
 * Each entity module contains:
 * - types.ts: TypeScript interfaces and type definitions
 * - index.ts: Barrel exports
 * 
 * Usage:
 *   import { User, Booking, Technician } from "@/entities";
 *   import { BOOKING_STATUSES } from "@/entities/booking";
 */

export type { User, UserSummary, UserRole } from "./user";
export { USER_ROLES } from "./user";

export type { Booking, BookingStatus, CreateBookingInput } from "./booking";
export { BOOKING_STATUSES } from "./booking";

export type { Technician, TechnicianStatus, CreateTechnicianInput, TechnicianPerformance } from "./technician";
export { TECHNICIAN_STATUSES } from "./technician";

export type { Review, CreateReviewInput, RatingDistribution } from "./review";

export type { Vendor, VendorStatus, RegisterVendorInput, VendorService } from "./vendor";
export { VENDOR_STATUSES } from "./vendor";
