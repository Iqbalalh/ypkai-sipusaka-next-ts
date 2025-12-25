import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PartnerTable from "@/components/view/partner/PartnerTable";

export default function PartnerTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Pasangan" />
      <div className="space-y-6">
        <ComponentCard
          title="Jumlah Data"
          header={false}
        >
          <PartnerTable />
        </ComponentCard>
      </div>
    </div>
  );
}
