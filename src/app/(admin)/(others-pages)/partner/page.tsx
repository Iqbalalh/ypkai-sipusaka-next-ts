import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PartnerTable from "@/components/view/partner/PartnerTable";
import React from "react";


export default function PartnerTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Pasangan" />
      <div className="space-y-6">
        <ComponentCard title="Pasangan" createName="+" createUrl="/partner/create">
          <PartnerTable />
        </ComponentCard>
      </div>
    </div>
  );
}
