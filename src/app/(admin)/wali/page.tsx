"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import WaliTable from "@/components/view/wali/WaliTable";
import React, { useState } from "react";

export default function WaliTables() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <PageBreadcrumb pageTitle="Wali" />
      <div className="space-y-6">
        <ComponentCard
          count={count}
          title="Jumlah Data"
          createName="+"
          createUrl="/wali/create"
        >
          <WaliTable onCountChange={setCount} />
        </ComponentCard>
      </div>
    </div>
  );
}
