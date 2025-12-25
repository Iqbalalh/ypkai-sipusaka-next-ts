import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UmkmTable from "@/components/view/umkm/UmkmTable";

export default function UmkmTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="UMKM" />
      <div className="space-y-6">
        <ComponentCard title="Jumlah Data" header={false}>
          <UmkmTable />
        </ComponentCard>
      </div>
    </div>
  );
}
