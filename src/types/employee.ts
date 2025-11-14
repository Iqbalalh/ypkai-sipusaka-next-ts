export interface Employee {
  id: number;
  nipNipp: string;
  employeeName: string;
  deathCause: string | null;
  lastPosition: string | null;
  regionId: number;
  notes: string | null;
  employeeGender: "M" | "F"
  isAccident: boolean;
  employeePict: string | null;
  createdAt: string | null; // Timestamp ISO
  updatedAt: string | null; // Timestamp ISO
}
