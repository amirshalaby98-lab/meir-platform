/** User entity - represents a platform user */
export interface User {
  id: number;
  openId: string;
  name: string;
  email: string;
  loginMethod: "google" | "apple" | "github" | string;
  role: "admin" | "user" | "technician" | "vendor";
  createdAt: string;
  updatedAt: string;
  lastSignedIn: string | null;
}

/** Minimal user info for display purposes */
export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: string;
}

/** User role options */
export type UserRole = "admin" | "user" | "technician" | "vendor";

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "admin", label: "مدير" },
  { value: "user", label: "مستخدم" },
  { value: "technician", label: "فني" },
  { value: "vendor", label: "مورّد" },
];
