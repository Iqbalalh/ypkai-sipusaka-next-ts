"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UmkmTable from "@/components/view/umkm/UmkmTable";
import React, { useState } from "react";

export default function UmkmTables() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <PageBreadcrumb pageTitle="UMKM" />
      <div className="space-y-6">
        <ComponentCard
          title="Jumlah Data"
          createName="+"
          createUrl="/umkm/create"
          count={count}
        >
          <UmkmTable onCountChange={setCount} />
        </ComponentCard>
      </div>
    </div>
  );
}
