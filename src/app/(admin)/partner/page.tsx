"use client"
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PartnerTable from "@/components/view/partner/PartnerTable";
import React, { useState } from "react";

export default function PartnerTables() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <PageBreadcrumb pageTitle="Pasangan" />
      <div className="space-y-6">
        <ComponentCard
          title="Jumlah Data"
          createName="+"
          createUrl="/partner/create"
          count={count}
        >
          <PartnerTable onCountChange={setCount} />
        </ComponentCard>
      </div>
    </div>
  );
}
