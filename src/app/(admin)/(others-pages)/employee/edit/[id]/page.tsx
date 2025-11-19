"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select, { Option } from "@/components/form/Select";
import FileInput from "@/components/form/input/FileInput";
import { Image, message } from "antd";

import { API_EMPLOYEES, API_REGIONS } from "@/lib/apiEndpoint";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

import camelcaseKeys from "camelcase-keys";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditEmployee() {
  const [regions, setRegions] = useState<Option[]>([]);
  const [employee, setEmployee] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const { id } = useParams();

  // ============================
  //   VALIDASI FILE
  // ============================
  const validateFile = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 1 * 1024 * 1024; // 1MB

    if (!allowedTypes.includes(file.type)) {
      message.error("Format tidak valid. Hanya JPG, PNG, atau WEBP.");
      return false;
    }

    if (file.size > maxSize) {
      message.error("Ukuran file maksimal 1MB.");
      return false;
    }

    return true;
  };

  // ============================
  // UPLOAD FOTO
  // ============================
  const handleChangePict = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setUploadLoading(true);

    const formData = new FormData();
    formData.append("photo", file);

    message.loading({
      content: "Mengupload foto...",
      key: "upload",
      duration: 0,
    });

    try {
      const res = await fetchWithAuth(`${API_EMPLOYEES}/${id}/photo`, {
        method: "PATCH",
        body: formData,
      });

      console.log(res)

      if (!res.ok) throw new Error("Upload gagal");

      const result = await res.json();

      // Update foto di UI tanpa reload
      setEmployee((prev: any) => ({
        ...prev,
        employeePictUrl: result.fileUrl,
      }));

      message.success({
        content: "Foto berhasil diupload!",
        key: "upload",
        duration: 2,
      });
    } catch (err) {
      console.error(err);
      message.error({
        content: "Gagal mengupload foto.",
        key: "upload",
        duration: 2,
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // ============================
  // SUBMIT FORM UPDATE
  // ============================
  const handleSubmit = async () => {
    if (!employee) return;

    setSubmitLoading(true);

    const payload = {
      nipNipp: employee.nipNipp,
      employeeName: employee.employeeName,
      deathCause: employee.deathCause,
      lastPosition: employee.lastPosition,
      notes: employee.notes,
      regionId: employee.regionId,
      employeeGender: employee.employeeGender,
      isAccident: Boolean(employee.isAccident),
    };

    message.loading({
      content: "Menyimpan perubahan...",
      key: "save",
      duration: 0,
    });

    try {
      const res = await fetchWithAuth(`${API_EMPLOYEES}/${employee.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal");

      message.success({
        content: "Data pegawai berhasil diperbarui.",
        key: "save",
        duration: 2,
      });
    } catch (error) {
      console.log(error);
      message.error({
        content: "Gagal menyimpan data pegawai.",
        key: "save",
        duration: 2,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // ============================
  // FETCH DATA
  // ============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        const empRes = await fetchWithAuth(`${API_EMPLOYEES}/${id}`);
        const empData = camelcaseKeys((await empRes.json()).data, {
          deep: true,
        });
        setEmployee(empData);

        const regRes = await fetchWithAuth(API_REGIONS);
        const regionData = camelcaseKeys((await regRes.json()).data, {
          deep: true,
        });

        setRegions(
          regionData.map((r: any) => ({
            value: r.regionId,
            label: r.regionName,
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!employee) return <p>No data available</p>;

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Pegawai" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <ComponentCard title="Isi Form dibawah">
            <div className="space-y-6">

              {/* ID */}
              <div>
                <Label>ID</Label>
                <Input type="number" defaultValue={employee.id} disabled />
              </div>

              {/* nipNipp */}
              <div>
                <Label>NIP / NIPP</Label>
                <Input
                  type="text"
                  defaultValue={employee.nipNipp}
                  onChange={(e) =>
                    setEmployee((prev: any) => ({
                      ...prev,
                      nipNipp: e.target.value,
                    }))
                  }
                />
              </div>

              {/* employeeName */}
              <div>
                <Label>Nama Pegawai</Label>
                <Input
                  type="text"
                  defaultValue={employee.employeeName}
                  onChange={(e) =>
                    setEmployee((prev: any) => ({
                      ...prev,
                      employeeName: e.target.value,
                    }))
                  }
                />
              </div>

              {/* deathCause */}
              <div>
                <Label>Penyebab Kematian</Label>
                <Input
                  type="text"
                  defaultValue={employee.deathCause || ""}
                  onChange={(e) =>
                    setEmployee((prev: any) => ({
                      ...prev,
                      deathCause: e.target.value,
                    }))
                  }
                />
              </div>

              {/* lastPosition */}
              <div>
                <Label>Posisi Terakhir</Label>
                <Input
                  type="text"
                  defaultValue={employee.lastPosition || ""}
                  onChange={(e) =>
                    setEmployee((prev: any) => ({
                      ...prev,
                      lastPosition: e.target.value,
                    }))
                  }
                />
              </div>

              {/* notes */}
              <div>
                <Label>Catatan</Label>
                <TextArea
                  value={employee?.notes || ""}
                  onChange={(value: any) =>
                    setEmployee((prev: any) => ({
                      ...prev,
                      notes: value,
                    }))
                  }
                  rows={6}
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-6">
              <button
                onClick={handleSubmit}
                disabled={submitLoading}
                className="px-4 py-2 text-white rounded bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {submitLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </ComponentCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <ComponentCard title="Pilih salah satu">
            <div className="space-y-6">

              {/* regionId */}
              <div>
                <Label>Wilayah</Label>
                <Select
                  options={regions}
                  defaultValue={employee.regionId}
                  onChange={(value: any) =>
                    setEmployee((prev: any) => ({
                      ...prev,
                      regionId: value,
                    }))
                  }
                />
              </div>

              {/* Gender */}
              <div>
                <Label>Jenis Kelamin</Label>
                <Select
                  options={[
                    { value: "F", label: "Perempuan" },
                    { value: "M", label: "Laki-laki" },
                  ]}
                  defaultValue={employee.employeeGender}
                  onChange={(value: any) =>
                    setEmployee((prev: any) => ({
                      ...prev,
                      employeeGender: value,
                    }))
                  }
                />
              </div>

              {/* PLH */}
              <div>
                <Label>PLH / Non-PLH</Label>
                <Select
                  options={[
                    { value: true, label: "PLH" },
                    { value: false, label: "Non-PLH" },
                  ]}
                  defaultValue={employee.isAccident}
                  onChange={(value: any) =>
                    setEmployee((prev: any) => ({
                      ...prev,
                      isAccident: value,
                    }))
                  }
                />
              </div>

              {/* Upload Foto */}
              <div>
                <Label>Foto Pegawai</Label>
                <FileInput onChange={handleChangePict} />

                {uploadLoading && (
                  <p className="text-sm text-blue-500">Mengupload...</p>
                )}

                {employee.employeePictUrl && !uploadLoading && (
                  <Image
                    src={employee.employeePictUrl}
                    alt="Foto Pegawai"
                    className="object-cover mt-3 rounded-md h-32"
                  />
                )}
              </div>

            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
