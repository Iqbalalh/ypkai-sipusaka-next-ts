import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EmployeeTable from "@/components/view/employee/EmployeeTable";
import React from "react";


export default function EmployeeTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Pegawai" />
      <div className="space-y-6">
        <ComponentCard title="Tabel Pegawai" createName="+" createUrl="/employee/create">
          <EmployeeTable />
        </ComponentCard>
      </div>
    </div>
  );
}
