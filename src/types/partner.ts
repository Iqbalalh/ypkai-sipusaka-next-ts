export interface Partner {
  id?: number;
  employeeId: number | null;
  partnerName: string;
  partnerJob?: string;
  partnerNik?: string;
  regionId: number | null;
  address: string | null;
  subdistrictId: number | null;
  postalCode: string;
  homeCoordinate: string;
  phoneNumber?: string;
  phoneNumberAlt: string;
  isActive: boolean;
  isAlive: boolean;
  partnerPict?: string | null;
  createdAt?: string | null; // Timestamp ISO
  updatedAt?: string | null; // Timestamp ISO

  // Non-native Field
  isUmkm?: boolean;
  regionName?: string | null;
}
