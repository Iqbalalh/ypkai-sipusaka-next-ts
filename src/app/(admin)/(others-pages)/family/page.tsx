"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FamilyTable from "@/components/view/family/FamilyTable";
import React, { useState } from "react";

export default function FamiliyTables() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <PageBreadcrumb pageTitle="Keluarga Asuh" />
      <div className="space-y-6">
        <ComponentCard
          count={count}
          title="Jumlah Data"
          createName="+"
          createUrl="/family/create"
        >
          <FamilyTable onCountChange={setCount} />
        </ComponentCard>
      </div>
    </div>
  );
}
