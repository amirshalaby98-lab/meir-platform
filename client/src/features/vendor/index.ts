/**
 * Vendor Feature Module
 * 
 * Provides lazy-loadable page factories for the vendor feature.
 */

export const vendorPages = {
  VendorDashboard: () => import("@/pages/VendorDashboard"),
  VendorRegistration: () => import("@/pages/VendorRegistration"),
  VendorAnalytics: () => import("@/pages/VendorAnalytics"),
};
