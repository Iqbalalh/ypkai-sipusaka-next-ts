"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StaffTable from "@/components/view/staff/StaffTable";
import React, { useState } from "react";

export default function PartnerTables() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <PageBreadcrumb pageTitle="Yayasan Pusaka" />
      <div className="space-y-6">
        <ComponentCard
          title="Staff"
          createName="+"
          createUrl="/staff/create"
          count={count}
        >
          <StaffTable onCountChange={setCount} />
        </ComponentCard>
      </div>
    </div>
  );
}
