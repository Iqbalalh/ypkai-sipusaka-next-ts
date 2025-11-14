import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EmployeeTable from "@/components/employee-view/EmployeeTable";
// import { Metadata } from "next";
import React from "react";

// export const metadata: Metadata = {
//   title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
//   description:
//     "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
//   // other metadata
// };

export default function EmployeeTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Pegawai" />
      <div className="space-y-6">
        <ComponentCard title="Pegawai">
          <EmployeeTable />
        </ComponentCard>
      </div>
    </div>
  );
}
