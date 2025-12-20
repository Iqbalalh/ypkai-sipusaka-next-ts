"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import FileInput from "@/components/form/input/FileInput";

import { Image, message, Input, Select, Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import TextArea from "antd/es/input/TextArea";

import { API_EMPLOYEES, API_REGIONS } from "@/lib/apiEndpoint";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";
import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Option } from "@/components/form/Select";
import { Employee } from "@/types/employee";
import { Region } from "@/types/region";
import { useRouter } from "next/navigation";

export default function CreateEmployee() {
  const router = useRouter();

  const [regions, setRegions] = useState<Option[]>([]);
  const [previewPict, setPreviewPict] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  // ==============================================
  // FORM DATA
  // ==============================================
  const [form, setForm] = useState<Employee>({
    nipNipp: "",
    employeeName: "",
    deathCause: "",
    lastPosition: "",
    notes: "",
    regionId: null,
    employeeGender: "M",
    isAccident: false,
  });

  // ==============================================
  // VALIDATE FILE
  // ==============================================
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

  // ==============================================
  // HANDLE FOTO SELECT
  // ==============================================
  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setPhotoFile(file);
    setPreviewPict(URL.createObjectURL(file));
  };

  // ==============================================
  // camelCase → snake_case
  // ==============================================
  const toSnake = (str: string) =>
    str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

  // ==============================================
  // SUBMIT
  // ==============================================
  const handleSubmit = async () => {
    if (!form.nipNipp) {
      messageApi.error("NIP/NIPP wajib diisi.");
      return;
    }

    if (!form.employeeName) {
      messageApi.error("Nama pegawai wajib diisi.");
      return;
    }

    if (!form.regionId) {
      messageApi.error("Wilayah wajib diisi.");
      return;
    }

    if (!form.employeeGender) {
      messageApi.error("Jenis kelamin wajib diisi.");
      return;
    }

    if (form.isAccident === null || form.isAccident === undefined) {
      messageApi.error("PLH / Non-PLH wajib dipilih.");
      return;
    }

    setSubmitLoading(true);

    messageApi.loading({
      content: "Membuat data pegawai...",
      key: "save",
      duration: 0,
    });

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        let finalValue = value;

        if (key === "isAccident") {
          finalValue = value === true || value === "true" ? 1 : 0;
        }

        const snakeKey = toSnake(key);
        fd.append(snakeKey, String(finalValue));
      });

      if (photoFile) fd.append("photo", photoFile);

      const res = await fetchWithAuth(API_EMPLOYEES, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Gagal membuat pegawai");

      messageApi.success({
        content: "Pegawai berhasil dibuat!",
        key: "save",
        duration: 2,
      });
      router.push("/employee");
    } catch (error) {
      console.error(error);
      messageApi.error({
        content: "Gagal membuat pegawai.",
        key: "save",
        duration: 2,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // ==============================================
  // FETCH REGIONS
  // ==============================================
  useEffect(() => {
    const loadRegions = async () => {
      const regRes = await fetchWithAuth(API_REGIONS+"/list");
      const regionData = camelcaseKeys((await regRes.json()).data, {
        deep: true,
      });

      setRegions(
        regionData.map((r: Region) => ({
          value: r.regionId,
          label: r.regionName,
        }))
      );

      setLoading(false);
    };

    loadRegions();
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
      <PageBreadcrumb pageTitle="Tambah Data Pegawai" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* LEFT FORM */}
        <div className="space-y-6">
          <ComponentCard title="Isi Data Pegawai">
            <div className="space-y-6">
              {/* NIP */}
              <div>
                <Label>NIP / NIPP *</Label>
                <Input
                  className="w-full"
                  size="large"
                  type="number"
                  required={true}
                  value={form.nipNipp}
                  onChange={(e) =>
                    setForm({ ...form, nipNipp: e.target.value })
                  }
                />
              </div>

              {/* Name */}
              <div>
                <Label>Nama Pegawai *</Label>
                <Input
                  className="w-full"
                  size="large"
                  required
                  value={form.employeeName}
                  onChange={(e) =>
                    setForm({ ...form, employeeName: e.target.value })
                  }
                />
              </div>

              {/* isAccident */}
              <div>
                <Label>PLH / Non-PLH *</Label>
                <Select
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  style={{ width: "100%" }}
                  options={[
                    { value: true, label: "PLH" },
                    { value: false, label: "Non-PLH" },
                  ]}
                  value={form.isAccident}
                  onChange={(value) => setForm({ ...form, isAccident: value })}
                />
              </div>

              {/* Last Position */}
              <div>
                <Label>Posisi Terakhir</Label>
                <Input
                  className="w-full"
                  size="large"
                  value={form.lastPosition}
                  onChange={(e) =>
                    setForm({ ...form, lastPosition: e.target.value })
                  }
                />
              </div>

              {/* Notes */}
              <div>
                <Label>Catatan</Label>
                <TextArea
                  size="large"
                  rows={4}
                  value={form.notes ?? ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* RIGHT FORM */}
        <div className="space-y-6">
          <ComponentCard title="* Wajib Diisi">
            <div className="space-y-6">
              {/* Region */}
              <div>
                <Label>Wilayah *</Label>
                <Select
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  style={{ width: "100%" }}
                  options={regions}
                  value={form.regionId}
                  onChange={(value) => setForm({ ...form, regionId: value })}
                />
              </div>

              {/* Gender */}
              <div>
                <Label>Jenis Kelamin *</Label>
                <Select
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  style={{ width: "100%" }}
                  options={[
                    { value: "F", label: "Perempuan" },
                    { value: "M", label: "Laki-laki" },
                  ]}
                  value={form.employeeGender}
                  onChange={(value) =>
                    setForm({ ...form, employeeGender: value })
                  }
                />
              </div>

              {/* Death Cause */}
              <div>
                <Label>Penyebab Kematian</Label>
                <Input
                  className="w-full"
                  size="large"
                  value={form.deathCause}
                  onChange={(e) =>
                    setForm({ ...form, deathCause: e.target.value })
                  }
                />
              </div>

              {/* Foto */}
              <div>
                <Label>Foto Pegawai</Label>

                <FileInput onChange={handleSelectFile} />

                {previewPict && (
                  <Image
                    src={previewPict}
                    alt="Preview Foto"
                    className="object-cover mt-3 rounded-md h-32"
                  />
                )}
              </div>
            </div>

            {/* SUBMIT */}
            <div className="flex justify-between pt-6">
              <Button
                className="bg-gray-500 text-white"
                onClick={() => router.back()}
                type="reset"
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
