"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ChildrenTable from "@/components/view/children/ChildrenTable";
import React, { useState } from "react";

export default function ChildrenTables() {
  const [count, setCount] = useState<number>(0);
  return (
    <div>
      <PageBreadcrumb pageTitle="Anak Asuh" />
      <div className="space-y-6">
        <ComponentCard
          title="Jumlah Data"
          createName="+"
          createUrl="/children/create"
          count={count}
        >
          <ChildrenTable onCountChange={setCount} />
        </ComponentCard>
      </div>
    </div>
  );
}
