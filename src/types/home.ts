import { Children } from "./children";

export interface Home {
  id: number;
  partnerId: number;
  employeeId: number;
  waliId: number;
  createdAt: string; // ISO timestamp
  regionId: number;
  postalCode: string | null;
}


export interface HomeDetail {
  // =======================
  // 🏠 HOME
  // =======================
  homeId: number;
  homeRegionId: number | null;
  homePostalCode: string | null;
  homeCreatedAt: string | null;
  homeUpdatedAt: string | null;

  // =======================
  // 👤 EMPLOYEE
  // =======================
  employeeId: number | null;
  employeeNipNipp: string | null;
  employeeName: string | null;
  employeeDeathCause: string | null;
  employeeLastPosition: string | null;
  employeeRegionId: number | null;
  employeeRegionName: string | null;      // ← DITAMBAHKAN
  employeeNotes: string | null;
  employeeGender: "M" | "F" | null;
  employeeIsAccident: boolean | null;
  employeePict: string | null;
  employeeCreatedAt: string | null;
  employeeUpdatedAt: string | null;

  // =======================
  // 💑 PARTNER
  // =======================
  partnerId: number | null;
  employeePartnerId: number | null;
  partnerName: string | null;
  partnerJob: string | null;
  partnerNik: string | null;
  partnerRegionId: number | null;
  partnerRegionName: string | null;       // ← DITAMBAHKAN
  partnerAddress: string | null;
  partnerSubdistrictId: number | null;
  partnerPostalCode: string | null;
  partnerHomeCoordinate: string | null;
  partnerPhoneNumber: string | null;
  partnerPhoneNumberAlt: string | null;
  partnerIsActive: boolean | null;
  partnerIsAlive: boolean | null;
  partnerPict: string | null;
  partnerCreatedAt: string | null;
  partnerUpdatedAt: string | null;

  // =======================
  // 🧓 WALI
  // =======================
  waliId: number | null;
  waliName: string | null;
  waliAddress: string | null;
  waliRelation: string | null;
  waliPhone: string | null;
  waliPict: string | null;
  waliEmployeeId: number | null;
  waliAddressCoordinate: string | null;
  waliCreatedAt: string | null;
  waliUpdatedAt: string | null;

  // =======================
  // 📍 SELECTIONS (RESULT FIELD)
  // =======================
  selectedAddress: string | null;
  selectedPostalCode: string | null;
  selectedRegionName: string | null;

  // =======================
  // 👶 CHILDREN (ARRAY)
  // =======================
  childrenData: Children[];

  // =======================
  // 💼 UMKM
  // =======================
  isUmkm: boolean;
}
