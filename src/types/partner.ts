export interface Partner {
  id: number;
  employeeId: number;
  partnerName: string;
  partnerJob: string | null;
  partnerNik: string | null;
  regionId: number | null;
  address: string | null;
  subdistrictId: number | null;
  postalCode: string | null;
  homeCoordinate: string | null;
  phoneNumber: string | null;
  phoneNumberAlt: string | null;
  isActive: boolean;
  isAlive: boolean;
  partnerPict: string | null;
  createdAt: string | null; // Timestamp ISO
  updatedAt: string | null; // Timestamp ISO
}
