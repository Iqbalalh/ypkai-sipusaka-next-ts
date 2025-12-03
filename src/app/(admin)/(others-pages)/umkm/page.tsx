import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UmkmTable from "@/components/view/umkm/UmkmTable";
import React from "react";


export default function UmkmTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="UMKM" />
      <div className="space-y-6">
        <ComponentCard title="UMKM" createName="+" createUrl="/umkm/create">
          <UmkmTable />
        </ComponentCard>
      </div>
    </div>
  );
}
