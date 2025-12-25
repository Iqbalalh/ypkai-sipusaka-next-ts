import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EmployeeTable from "@/components/view/employee/EmployeeTable";

export default function EmployeeTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Pegawai" />
      <div className="space-y-6">
        <ComponentCard
          title="Data Pegawai"
          header={false}
        >
          <EmployeeTable />
        </ComponentCard>
      </div>
    </div>
  );
}
