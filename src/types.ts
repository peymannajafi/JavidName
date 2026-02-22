export interface Victim {
  id: string | number;
  name: string;
  score: number;
  govMatch: string;
  status: "Verified" | "Unverified";
  manualStatus: "Verified" | "Unverified" | null;
  photo: string | null;
  date: string | null;
}

export interface DashboardStats {
  total: number;
  verifiedRate: number;
  unverifiedCount: number;
  avgConfidence: number;
}
