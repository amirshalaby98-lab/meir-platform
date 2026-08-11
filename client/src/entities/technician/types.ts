/** Technician entity - represents a service technician */
export interface Technician {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  specialization: string | null;
  location: string;
  status: TechnicianStatus;
  rating: number | null;
  completedJobs: number;
  createdAt: string;
  updatedAt: string;
}

/** Technician status options */
export type TechnicianStatus = "available" | "busy" | "offline";

export const TECHNICIAN_STATUSES: { value: TechnicianStatus; label: string; color: string }[] = [
  { value: "available", label: "متاح", color: "green" },
  { value: "busy", label: "مشغول", color: "orange" },
  { value: "offline", label: "غير متصل", color: "gray" },
];

/** Technician creation input */
export interface CreateTechnicianInput {
  name: string;
  phone: string;
  email?: string;
  specialization?: string;
  location: string;
}

/** Technician performance stats */
export interface TechnicianPerformance {
  technicianId: number;
  technicianName: string;
  totalBookings: number;
  completedBookings: number;
  completionRate: number;
  averageRating: number;
}
