export type UserRole = "guest" | "commuter" | "admin";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface GlobalSettings {
  base_fare: number;
  per_km_rate: number;
  minimum_fare: number;
  fuel_price_index: number;
  updated_by: string;
  updatedAt: Date;
}

export interface TariffFares {
  regular: number;
  student: number;
  senior: number;
  pwd: number;
}

export interface Tariff {
  id: string;
  origin: string;
  destination: string;
  distance_km: number;
  fares: TariffFares;
  body_numbers: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportStatus = "Pending" | "Reviewed" | "Resolved";

export type AITag = "Fare Overcharge" | "Driver Misconduct" | "Reckless Driving";

export interface OverchargingReport {
  id: string;
  user_id: string;
  body_number: string;
  origin: string;
  destination: string;
  legal_fare: number;
  extorted_fare: number;
  description: string;
  ai_tags: AITag[];
  status: ReportStatus;
  is_archived: boolean;
  incident_date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SectorType = "regular" | "student" | "senior" | "pwd";

export const SECTOR_DISCOUNTS: Record<SectorType, number> = {
  regular: 0,
  student: 0.15,
  senior: 0.2,
  pwd: 0.25,
};

export const SECTOR_LABELS: Record<SectorType, string> = {
  regular: "Regular",
  student: "Student",
  senior: "Senior Citizen",
  pwd: "PWD",
};
