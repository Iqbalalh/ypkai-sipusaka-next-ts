"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EmployeeTable from "@/components/view/employee/EmployeeTable";
import React, { useState } from "react";

export default function EmployeeTables() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <PageBreadcrumb pageTitle="Pegawai" />
      <div className="space-y-6">
        <ComponentCard
          title="Jumlah Data"
          createName="+"
          createUrl="/employee/create"
          count={count}
        >
          <EmployeeTable onCountChange={setCount} />
        </ComponentCard>
      </div>
    </div>
  );
}
