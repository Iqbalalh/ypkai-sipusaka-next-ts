export interface Umkm {
  id: number;
  partnerId: number;
  ownerName: string;
  businessName: string;
  businessAddress: string | null;
  regionId: number;
  subdistrictId: number | null;
  postalCode: string | null;
  umkmCoordinate: string | null;
  businessType: string | null;
  products: string | null;
  employeeId: number | null;
  createdAt: string; // ISO timestamp
  updatedAt: string;
  waliId: number | null;
  childrenId: number | null;

  // Non-native Field
  regionName?: string | null;
}
