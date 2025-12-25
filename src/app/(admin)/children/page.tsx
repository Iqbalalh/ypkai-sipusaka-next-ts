import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ChildrenTable from "@/components/view/children/ChildrenTable";

export default function ChildrenTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Anak Asuh" />
      <div className="space-y-6">
        <ComponentCard
          title="Jumlah Data"
          header={false}
        >
          <ChildrenTable />
        </ComponentCard>
      </div>
    </div>
  );
}
