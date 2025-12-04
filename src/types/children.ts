export interface Children {
  id?: number;
  employeeId?: number;
  partnerId?: number;
  homeId?: number;
  childrenName: string;
  isActive: boolean;
  childrenBirthdate?: string | null;
  childrenAddress?: string | null;
  childrenPhone?: string | null;
  notes?: string | null;
  isFatherAlive: boolean;
  isMotherAlive: boolean;
  childrenGender: "M" | "F";
  isCondition: boolean;
  childrenPict?: string | null;
  createdAt?: string | null; // Timestamp ISO
  updatedAt?: string | null; // Timestamp ISO
  index?: number | null;

  // Non-native
  childrenPictFile?: File | null;
  employeeName?: string | null;
  partnerName?: string | null;
  waliName?: string | null;
}
