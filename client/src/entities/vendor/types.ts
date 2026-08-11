/** Vendor entity - represents a service vendor/supplier */
export interface Vendor {
  id: number;
  businessName: string;
  businessNameAr: string | null;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  status: VendorStatus;
  rating: number | null;
  totalOrders: number;
  createdAt: string;
  updatedAt: string;
}

/** Vendor status options */
export type VendorStatus = "pending" | "approved" | "rejected" | "suspended";

export const VENDOR_STATUSES: { value: VendorStatus; label: string; color: string }[] = [
  { value: "pending", label: "قيد المراجعة", color: "yellow" },
  { value: "approved", label: "معتمد", color: "green" },
  { value: "rejected", label: "مرفوض", color: "red" },
  { value: "suspended", label: "موقوف", color: "gray" },
];

/** Vendor registration input */
export interface RegisterVendorInput {
  businessName: string;
  businessNameAr?: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  description?: string;
}

/** Vendor service */
export interface VendorService {
  id: number;
  vendorId: number;
  serviceName: string;
  serviceNameAr: string | null;
  price: number;
  description: string | null;
}
