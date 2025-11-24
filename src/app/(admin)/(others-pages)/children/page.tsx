import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ChildrenTable from "@/components/view/children/ChildrenTable";
import React from "react";

export default function ChildrenTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Anak Asuh" />
      <div className="space-y-6">
        <ComponentCard
          title="Tabel Anak"
          createName="+"
          createUrl="/employee/create"
        >
          <ChildrenTable />
        </ComponentCard>
      </div>
    </div>
  );
}
