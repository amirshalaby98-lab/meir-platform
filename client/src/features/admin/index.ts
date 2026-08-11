/**
 * Admin Feature Module
 * 
 * Provides lazy-loadable page factories for the admin feature.
 * Components remain in their original locations and are imported directly.
 */

// Lazy page factories for code splitting
export const adminPages = {
  Admin: () => import("@/pages/Admin"),
  Dashboard: () => import("@/pages/Admin/Dashboard"),
  AdvancedDashboard: () => import("@/pages/Admin/AdvancedDashboard"),
  Bookings: () => import("@/pages/Admin/Bookings"),
  Brands: () => import("@/pages/Admin/Brands"),
  Invoices: () => import("@/pages/Admin/Invoices"),
  Models: () => import("@/pages/Admin/Models"),
  Notifications: () => import("@/pages/Admin/Notifications"),
  Parts: () => import("@/pages/Admin/Parts"),
  Users: () => import("@/pages/Admin/Users"),
  VendorApprovals: () => import("@/pages/Admin/VendorApprovals"),
  JunkyardsManagement: () => import("@/pages/admin/JunkyardsManagement"),
  LaborTimesAdvanced: () => import("@/pages/admin/LaborTimesAdvanced"),
  PartPrices: () => import("@/pages/admin/PartPrices"),
  PartsShopsManagement: () => import("@/pages/admin/PartsShopsManagement"),
  Reports: () => import("@/pages/admin/Reports"),
  TowTrucksManagement: () => import("@/pages/admin/TowTrucksManagement"),
  LaborTimeAdmin: () => import("@/pages/LaborTimeAdmin"),
  PriceHistoryAdmin: () => import("@/pages/PriceHistoryAdmin"),
  PricingSettings: () => import("@/pages/PricingSettings"),
  PromotionsAdmin: () => import("@/pages/PromotionsAdmin"),
  UnifonicSettings: () => import("@/pages/UnifonicSettings"),
};
