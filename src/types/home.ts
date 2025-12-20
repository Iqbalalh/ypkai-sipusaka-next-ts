import { Children } from "./children";
import { Employee } from "./employee";
import { Partner } from "./partner";
import { Wali } from "./wali";

export interface Home {
  id: number;
  partnerId?: number | null;
  employeeId?: number | null;
  waliId?: number | null;
  createdAt: string; // ISO timestamp
  regionId: number;
  postalCode: string | null;

  // non-native
  selectedRegionName?: string | null;
}

export interface HomeTable {
  homeId: number;
  partnerId: number;
  partnerName: string;
  partnerPict: string | null;
  isAlive: boolean;
  regionId: number;
  isActive: boolean;
  employeeId: number;
  nipNipp: string;
  employeeName: string;
  employeePict: string | null;
  employeeGender: string;
  waliId: number;
  waliName: string;
  childrenCount: number;
  isUmkm: boolean;
}

export interface HomeDetail extends Home {
  employee: Employee;
  partner: Partner;
  wali: Wali;
  childrens: Children[];
}

export interface HomeDetails {
  homeDetails: HomeDetail;
}

// export interface HomeDetails {
//   // =======================
//   // 🏠 HOME
//   // =======================
//   homeId: number;
//   homeRegionId: number | null;
//   homePostalCode: string | null;
//   homeCreatedAt: string | null;
//   homeUpdatedAt: string | null;

//   // =======================
//   // 👤 EMPLOYEE
//   // =======================
//   employeeId: number | null;
//   employeeNipNipp: string | null;
//   employeeName: string | null;
//   employeeDeathCause: string | null;
//   employeeLastPosition: string | null;
//   employeeRegionId: number | null;
//   employeeRegionName: string | null; // ← DITAMBAHKAN
//   employeeNotes: string | null;
//   employeeGender: "M" | "F" | null;
//   employeeIsAccident: boolean | null;
//   employeePict: string | null;
//   employeeCreatedAt: string | null;
//   employeeUpdatedAt: string | null;

//   // =======================
//   // 💑 PARTNER
//   // =======================
//   partnerId: number | null;
//   employeePartnerId: number | null;
//   partnerName: string | null;
//   partnerJob: string | null;
//   partnerNik: string | null;
//   partnerRegionId: number | null;
//   partnerRegionName: string | null; // ← DITAMBAHKAN
//   partnerAddress: string | null;
//   partnerSubdistrictId: number | null;
//   partnerPostalCode: string | null;
//   partnerHomeCoordinate: string | null;
//   partnerPhoneNumber: string | null;
//   partnerPhoneNumberAlt: string | null;
//   partnerIsActive: boolean | null;
//   partnerIsAlive: boolean | null;
//   partnerPict: string | null;
//   partnerCreatedAt: string | null;
//   partnerUpdatedAt: string | null;

//   // =======================
//   // 🧓 WALI
//   // =======================
//   waliId: number | null;
//   waliName: string | null;
//   waliAddress: string | null;
//   waliRelation: string | null;
//   waliPhone: string | null;
//   waliPict: string | null;
//   waliEmployeeId: number | null;
//   waliAddressCoordinate: string | null;
//   waliCreatedAt: string | null;
//   waliUpdatedAt: string | null;

//   // =======================
//   // 📍 SELECTIONS (RESULT FIELD)
//   // =======================
//   selectedAddress: string | null;
//   selectedPostalCode: string | null;
//   selectedRegionName: string | null;

//   // =======================
//   // 👶 CHILDREN (ARRAY)
//   // =======================
//   childrenData: Children[];

//   // =======================
//   // 💼 UMKM
//   // =======================
//   isUmkm: boolean;
// }

export interface Family {
  id?: number | null;
  partnerId?: number | null;
  employeeId?: number | null;
  waliId?: number | null;
  createdAt?: string; // ISO timestamp
  regionId?: number | null;
  postalCode?: string | null;
  employee: Employee;
  partner: Partner;
  wali: Wali;
  childrens: Children[];
}
