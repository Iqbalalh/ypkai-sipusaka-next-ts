export interface Wali {
  id?: number;
  employeeId?: number;
  waliName: string;
  relation: string | null;
  waliAddress?: string | null;
  addressCoordinate: string | null;
  waliPhone?: string | null;
  createdAt?: string; // ISO timestamp
  updatedAt?: string;
  waliPict?: string | null;

  waliPictFile?: File | null;
}
