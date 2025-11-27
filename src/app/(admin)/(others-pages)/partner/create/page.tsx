"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import FileInput from "@/components/form/input/FileInput";

import { Image, Select, Input, message, Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import {
  API_PARTNERS,
  API_REGIONS,
  API_EMPLOYEES,
  API_SUBDISTRICTS,
} from "@/lib/apiEndpoint";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";
import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Option } from "@/components/form/Select";
import { Employee } from "@/types/employee";
import { Region } from "@/types/region";
import { Subdistricts } from "@/types/subdistrict";
import { Partner } from "@/types/partner";
import { useRouter } from "next/navigation";

const { TextArea } = Input;

export default function CreatePartner() {
  const router = useRouter();

  const [regions, setRegions] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<Option[]>([]);
  const [subdistricts, setSubdistricts] = useState<Option[]>([]);
  const [previewPict, setPreviewPict] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // FORM STATE
  const [form, setForm] = useState<Partner>({
    employeeId: null,
    partnerName: "",
    partnerJob: "",
    partnerNik: "",
    regionId: null,
    subdistrictId: null,
    address: "",
    postalCode: "",
    homeCoordinate: "",
    phoneNumber: "",
    phoneNumberAlt: "",
    isActive: true,
    isAlive: true,
  });

  // VALIDASI FILE
  const validateFile = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 1 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      messageApi.error("Format tidak valid. Hanya JPG, PNG, atau WEBP.");
      return false;
    }

    if (file.size > maxSize) {
      messageApi.error("Ukuran file maksimal 1MB.");
      return false;
    }

    return true;
  };

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setPhotoFile(file);
    setPreviewPict(URL.createObjectURL(file));
  };

  // camelCase → snake_case
  const toSnake = (str: string) =>
    str.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);

  // SUBMIT
  const handleSubmit = async () => {
    // VALIDATION: required fields
    if (!form.employeeId) {
      messageApi.error("Pegawai wajib dipilih.");
      return;
    }
    if (!form.partnerName) {
      messageApi.error("Nama pasangan wajib diisi.");
      return;
    }
    if (!form.regionId) {
      messageApi.error("Wilayah wajib dipilih.");
      return;
    }
    if (!form.subdistrictId) {
      messageApi.error("Kecamatan wajib dipilih.");
      return;
    }
    if (!form.homeCoordinate.trim()) {
      messageApi.error("Koordinat rumah wajib diisi.");
      return;
    }
    if (form.isActive === null || form.isActive === undefined) {
      messageApi.error("Status aktif wajib dipilih.");
      return;
    }
    if (form.isAlive === null || form.isAlive === undefined) {
      messageApi.error("Status hidup wajib dipilih.");
      return;
    }

    setSubmitLoading(true);
    messageApi.loading({
      content: "Membuat data pasangan...",
      key: "save",
      duration: 0,
    });

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        let finalValue = value;
        if (key === "isActive" || key === "isAlive") {
          finalValue = value ? 1 : 0;
        }

        fd.append(toSnake(key), String(finalValue));
      });

      if (photoFile) fd.append("photo", photoFile);

      const res = await fetchWithAuth(API_PARTNERS, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Gagal membuat pasangan");

      messageApi.success({
        content: "Pasangan berhasil dibuat!",
        key: "save",
        duration: 2,
      });
      router.back();
    } catch (error) {
      console.error(error);
      messageApi.error({
        content: "Gagal membuat pasangan.",
        key: "save",
        duration: 2,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // FETCH REGIONS + EMPLOYEES
  useEffect(() => {
    const loadData = async () => {
      const [regRes, empRes, subdRes] = await Promise.all([
        fetchWithAuth(API_REGIONS),
        fetchWithAuth(`${API_EMPLOYEES}/list`),
        fetchWithAuth(`${API_SUBDISTRICTS}`),
      ]);

      const regionData = camelcaseKeys((await regRes.json()).data, {
        deep: true,
      });
      const employeeData = camelcaseKeys((await empRes.json()).data, {
        deep: true,
      });
      const subdistrictData = camelcaseKeys((await subdRes.json()).data, {
        deep: true,
      });

      setRegions(
        regionData.map((r: Region) => ({
          value: r.regionId,
          label: r.regionName,
        }))
      );

      setEmployees(
        employeeData.map((e: Employee) => ({
          value: e.id,
          label: `${e.employeeName}`,
        }))
      );

      setSubdistricts(
        subdistrictData.map((e: Subdistricts) => ({
          value: e.subdistrictId,
          label: `${e.subdistrictName}`,
        }))
      );

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading)
    return (
      <div className="flex gap-2">
        <Flex align="center" gap="middle">
          <Spin indicator={<LoadingOutlined spin />} size="small" />
        </Flex>{" "}
        Loading...
      </div>
    );

  return (
    <div>
      {contextHolder}
      <PageBreadcrumb pageTitle="Tambah Data Pasangan" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* LEFT */}
        <div className="space-y-6">
          <ComponentCard title="Isi Data Pasangan">
            <div className="space-y-6">
              {/* EMPLOYEE SELECT */}
              <div>
                <Label>Pegawai *</Label>
                <Select
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="w-full"
                  size="large"
                  options={employees}
                  value={form.employeeId}
                  onChange={(value: number) =>
                    setForm({ ...form, employeeId: value })
                  }
                />
              </div>

              <div>
                <Label>Nama Pasangan *</Label>
                <Input
                  className="w-full"
                  size="large"
                  value={form.partnerName}
                  onChange={(e) =>
                    setForm({ ...form, partnerName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Pekerjaan</Label>
                <Input
                  className="w-full"
                  size="large"
                  value={form.partnerJob}
                  onChange={(e) =>
                    setForm({ ...form, partnerJob: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>NIK</Label>
                <Input
                  className="w-full"
                  size="large"
                  value={form.partnerNik}
                  onChange={(e) =>
                    setForm({ ...form, partnerNik: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Alamat *</Label>
                <TextArea
                  size="large"
                  value={form.address ?? ""}
                  rows={4}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Nomor Telepon *</Label>
                <Input
                  className="w-full"
                  size="large"
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumber: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Nomor Telepon Alternatif</Label>
                <Input
                  className="w-full"
                  size="large"
                  type="number"
                  value={form.phoneNumberAlt}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumberAlt: e.target.value })
                  }
                />
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <ComponentCard title="* Wajib Diisi">
            <div className="space-y-6">
              <div>
                <Label>Wilayah *</Label>
                <Select
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="w-full"
                  size="large"
                  options={regions}
                  value={form.regionId}
                  onChange={(v: number) => setForm({ ...form, regionId: v })}
                />
              </div>

              <div>
                <Label>Kecamatan *</Label>
                <Select
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toString()
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="w-full"
                  size="large"
                  options={subdistricts}
                  value={form.subdistrictId}
                  onChange={(v: number) =>
                    setForm({ ...form, subdistrictId: v })
                  }
                />
              </div>

              <div>
                <Label>Kode Pos</Label>
                <Input
                  className="w-full"
                  size="large"
                  value={form.postalCode}
                  onChange={(e) =>
                    setForm({ ...form, postalCode: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Koordinat Rumah *</Label>
                <Input
                  className="w-full"
                  size="large"
                  value={form.homeCoordinate}
                  onChange={(e) =>
                    setForm({ ...form, homeCoordinate: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Status Aktif *</Label>
                <Select
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="w-full"
                  size="large"
                  options={[
                    { value: true, label: "Aktif" },
                    { value: false, label: "Tidak Aktif" },
                  ]}
                  value={form.isActive}
                  onChange={(v: boolean) => setForm({ ...form, isActive: v })}
                />
              </div>

              <div>
                <Label>Status Hidup *</Label>
                <Select
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="w-full"
                  size="large"
                  options={[
                    { value: true, label: "Hidup" },
                    { value: false, label: "Meninggal" },
                  ]}
                  value={form.isAlive}
                  onChange={(v: boolean) => setForm({ ...form, isAlive: v })}
                />
              </div>

              <div>
                <Label>Foto Pasangan</Label>
                <FileInput onChange={handleSelectFile} />
                {previewPict && (
                  <Image
                    src={previewPict}
                    alt="Error..."
                    className="mt-3 h-32 object-cover rounded-md"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button
                className="bg-gray-500 text-white"
                onClick={() => router.back()}
              >
                Kembali
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={submitLoading}
                className="px-4 py-2 text-white rounded bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {submitLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
