/**
 * Technician Feature Module
 * 
 * Provides lazy-loadable page factories for the technician feature.
 */

export const technicianPages = {
  TechnicianDashboard: () => import("@/pages/TechnicianDashboard"),
  TechnicianProfile: () => import("@/pages/TechnicianProfile"),
  TechnicianBooking: () => import("@/pages/TechnicianBooking"),
  InstructorDashboard: () => import("@/pages/InstructorDashboard"),
};
