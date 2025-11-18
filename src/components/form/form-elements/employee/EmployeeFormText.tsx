"use client";
import React, { useEffect, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "../../Label";
import Input from "../../input/InputField";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";
import { API_EMPLOYEES } from "@/lib/apiEndpoint";
import { Employee } from "@/types/employee";
import { useParams } from "next/navigation";
import TextArea from "../../input/TextArea";

export default function EmployeeFormText() {
  const [employee, setEmployee] = useState<Employee>();
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  // ==============================
  // Fetch Regions + Employee Data
  // ==============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        // Fetch Employee
        const empRes = await fetchWithAuth(`${API_EMPLOYEES}/1`);
        if (!empRes.ok) throw new Error("Failed to fetch employee");
        const empData = camelcaseKeys((await empRes.json()).data, {
          deep: true,
        });
        setEmployee(empData);
      } catch (error) {
        console.error("ERROR FETCH:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!employee) return <p>No data available</p>;

  return (
    <ComponentCard title="Isi Form dibawah">
      <div className="space-y-6">
        {/* ID (disabled) */}
        <div>
          <Label>ID</Label>
          <Input type="number" value={employee.id} disabled />
        </div>

        {/* nipNipp */}
        <div>
          <Label>NIP / NIPP</Label>
          <Input type="text" defaultValue={employee.nipNipp} />
        </div>

        {/* employeeName */}
        <div>
          <Label>Nama Pegawai</Label>
          <Input type="text" defaultValue={employee.employeeName} />
        </div>

        {/* deathCause */}
        <div>
          <Label>Penyebab Kematian</Label>
          <Input type="text" defaultValue={employee.deathCause || ""} />
        </div>

        {/* lastPosition */}
        <div>
          <Label>Posisi Terakhir</Label>
          <Input type="text" defaultValue={employee.lastPosition || ""} />
        </div>

        {/* notes */}
        <div>
          <Label>Catatan</Label>
          <TextArea
            placeholder="Catatan pegawai..."
            value={employee.notes || ""}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(value: any) => {
              setEmployee((prev) => ({
                ...prev!,
                employeeNotes: value,
              }));
            }}
            rows={6}
          />
        </div>
      </div>
    </ComponentCard>
  );
}
