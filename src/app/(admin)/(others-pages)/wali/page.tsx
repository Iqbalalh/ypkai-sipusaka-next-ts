import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import WaliTable from "@/components/view/wali/WaliTable";
import React from "react";

export default function FamiliyTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Wali" />
      <div className="space-y-6">
        <ComponentCard title="Wali" createName="+" createUrl="/wali/create">
          <WaliTable />
        </ComponentCard>
      </div>
    </div>
  );
}
