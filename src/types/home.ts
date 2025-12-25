import { Children } from "./children";
import { Employee } from "./employee";
import { Partner } from "./partner";
import { Wali } from "./wali";

export interface Home {
  id: number | null;
  partnerId?: number | null;
  employeeId?: number | null;
  waliId?: number | null;
  createdAt?: string; // ISO timestamp
  regionId: number | null;
  postalCode: string | null;

  // non-native
  selectedRegionName?: string | null;
}
export interface Family extends Home {
  employee: Employee;
  partner: Partner;
  wali: Wali;
  childrens: Children[];
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
