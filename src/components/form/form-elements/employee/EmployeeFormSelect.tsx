/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "../../Label";
import Select, { Option } from "../../Select";
import FileInput from "../../input/FileInput";
import { ChevronDownIcon } from "@/icons";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";

import { API_EMPLOYEES, API_REGIONS } from "@/lib/apiEndpoint";
import { Employee } from "@/types/employee";
import { Region } from "@/types/region";
import { useParams } from "next/navigation";

export default function EmployeeForm() {
  const [regions, setRegions] = useState<Option[]>([]);
  const [employee, setEmployee] = useState<Employee>();
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const handleChangePict = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetchWithAuth(
      `${API_EMPLOYEES}/${employee?.id}/upload-pict`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await res.json();
    console.log("Uploaded:", result);

    setEmployee((prev) =>
      prev ? { ...prev, employeePict: result.fileUrl } : prev
    );
  };

  // Dropdown options
  const genderOptions = [
    { value: "M", label: "Perempuan" },
    { value: "F", label: "Laki-laki" },
  ];

  const accidentOptions = [
    { value: true, label: "PLH" },
    { value: false, label: "Non-PLH" },
  ];

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

        // Fetch Regions
        const regRes = await fetchWithAuth(API_REGIONS);
        if (!regRes.ok) throw new Error("Failed to fetch regions");
        const regionData = camelcaseKeys((await regRes.json()).data, {
          deep: true,
        });

        setRegions(
          regionData.map((r: Region) => ({
            value: r.regionId,
            label: r.regionName,
          }))
        );
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
    <ComponentCard title="Pilih salah satu">
      <div className="space-y-6">
        {/* regionId */}
        <div>
          <Label>Wilayah</Label>
          <div className="relative">
            <Select
              options={regions}
              defaultValue={employee.regionId}
              onChange={(value: any) => {
                setEmployee((prev) => ({
                  ...prev!,
                  regionId: value,
                }));
              }}
            />

            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        {/* employeeGender */}
        <div>
          <Label>Jenis Kelamin</Label>
          <div className="relative">
            <Select
              options={genderOptions}
              defaultValue={employee.employeeGender}
              onChange={(value: any) => {
                setEmployee((prev) => ({
                  ...prev!,
                  employeeGender: value,
                }));
              }}
            />

            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        {/* isAccident */}
        <div>
          <Label>PLH / Non-PLH</Label>
          <div className="relative">
            <Select
              options={accidentOptions}
              defaultValue={employee.isAccident}
              onChange={(value: any) => {
                setEmployee((prev) => ({
                  ...prev!,
                  isAccident: value,
                }));
              }}
              className="dark:bg-dark-900"
            />

            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
              <ChevronDownIcon />
            </span>
          </div>
        </div>

        {/* employeePict (File Input) */}
        <div>
          <Label>Foto Pegawai</Label>
          <FileInput onChange={handleChangePict} />
        </div>
      </div>
    </ComponentCard>
  );
}
