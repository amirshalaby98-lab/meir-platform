/**
 * Features - Barrel Export
 * 
 * Each feature module encapsulates a business domain with its own pages and components.
 * This follows the Feature-Sliced Design (FSD) architecture pattern.
 * 
 * Structure:
 *   features/
 *     {feature}/
 *       index.ts        - Public API (lazy page factories)
 *       pages/          - Feature-specific pages (to be migrated)
 *       components/     - Feature-specific components (to be migrated)
 */

export { adminPages } from "./admin";
export { vendorPages } from "./vendor";
export { technicianPages } from "./technician";
export { coursePages } from "./courses";
export { chatPages } from "./chat";
export { pricingPages } from "./pricing";
export { bookingPages } from "./booking";
export { homePages } from "./home";
