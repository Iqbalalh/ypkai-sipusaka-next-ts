import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import WaliTable from "@/components/view/wali/WaliTable";

export default function WaliTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Wali" />
      <div className="space-y-6">
        <ComponentCard title="Jumlah Data" header={false}>
          <WaliTable />
        </ComponentCard>
      </div>
    </div>
  );
}
