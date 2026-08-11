/** Booking entity - represents a service booking */
export interface Booking {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  service: string;
  location: string;
  date: string;
  time: string;
  notes: string | null;
  status: BookingStatus;
  technicianId: number | null;
  technicianName: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Booking status options */
export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

export const BOOKING_STATUSES: { value: BookingStatus; label: string; color: string }[] = [
  { value: "pending", label: "قيد الانتظار", color: "yellow" },
  { value: "confirmed", label: "مؤكد", color: "blue" },
  { value: "in_progress", label: "قيد التنفيذ", color: "orange" },
  { value: "completed", label: "مكتمل", color: "green" },
  { value: "cancelled", label: "ملغي", color: "red" },
];

/** Booking creation input */
export interface CreateBookingInput {
  name: string;
  phone: string;
  email?: string;
  service: string;
  location: string;
  date: string;
  time: string;
  notes?: string;
}
