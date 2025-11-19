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
import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";

export default function CreateEmployee() {
  const [regions, setRegions] = useState<Option[]>([]);
  const [previewPict, setPreviewPict] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // ==============================================
  // FORM STATE
  // ==============================================
  const [form, setForm] = useState<any>({
    nipNipp: "",
    employeeName: "",
    deathCause: "",
    lastPosition: "",
    notes: "",
    regionId: "",
    employeeGender: "",
    isAccident: false,
  });

  // ==============================================
  // VALIDASI FILE
  // ==============================================
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

  // ==============================================
  // Handle Pilih Foto (Preview)
  // ==============================================
  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setPhotoFile(file);
    setPreviewPict(URL.createObjectURL(file));
  };

  // ==============================================
  // Utility: camelCase → snake_case
  // ==============================================
  const toSnake = (str: string) =>
    str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

  // ==============================================
  // SUBMIT CREATE DATA
  // ==============================================
  const handleSubmit = async () => {
    if (!form.employeeName) {
      message.error("Nama pegawai wajib diisi.");
      return;
    }

    setSubmitLoading(true);

    message.loading({
      content: "Membuat data pegawai...",
      key: "save",
      duration: 0,
    });

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        let finalValue = value;

        // convert boolean string → boolean OR angka
        if (key === "isAccident") {
          finalValue = value === true || value === "true" ? 1 : 0; // atau true/false sesuai kebutuhan backend
        }

        const snakeKey = toSnake(key);
        fd.append(snakeKey, String(finalValue));
      });

      if (photoFile) fd.append("photo", photoFile);

      const res = await fetchWithAuth(API_EMPLOYEES, {
        method: "POST",
        body: fd, // FormData
      });

      if (!res.ok) throw new Error("Gagal membuat pegawai");

      message.success({
        content: "Pegawai berhasil dibuat!",
        key: "save",
        duration: 2,
      });

      // Reset form
      setForm({
        nipNipp: "",
        employeeName: "",
        deathCause: "",
        lastPosition: "",
        notes: "",
        regionId: "",
        employeeGender: "",
        isAccident: false,
      });
      setPreviewPict(null);
      setPhotoFile(null);
    } catch (error) {
      console.error(error);
      message.error({
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

      setLoading(false);
    };

    loadRegions();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <PageBreadcrumb pageTitle="Tambah Pegawai Baru" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* LEFT FORM */}
        <div className="space-y-6">
          <ComponentCard title="Isi Form Pegawai">
            <div className="space-y-6">
              {/* NIP */}
              <div>
                <Label>NIP / NIPP</Label>
                <Input
                  type="text"
                  value={form.nipNipp}
                  onChange={(e) =>
                    setForm({ ...form, nipNipp: e.target.value })
                  }
                />
              </div>

              {/* Name */}
              <div>
                <Label>Nama Pegawai</Label>
                <Input
                  type="text"
                  value={form.employeeName}
                  onChange={(e) =>
                    setForm({ ...form, employeeName: e.target.value })
                  }
                />
              </div>

              {/* Death Cause */}
              <div>
                <Label>Penyebab Kematian</Label>
                <Input
                  type="text"
                  value={form.deathCause}
                  onChange={(e) =>
                    setForm({ ...form, deathCause: e.target.value })
                  }
                />
              </div>

              {/* Position */}
              <div>
                <Label>Posisi Terakhir</Label>
                <Input
                  type="text"
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
                  value={form.notes}
                  onChange={(value: any) => setForm({ ...form, notes: value })}
                  rows={6}
                />
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* RIGHT FORM */}
        <div className="space-y-6">
          <ComponentCard title="Detail Tambahan">
            <div className="space-y-6">
              {/* Region */}
              <div>
                <Label>Wilayah</Label>
                <Select
                  options={regions}
                  value={form.regionId}
                  onChange={(value: any) =>
                    setForm({ ...form, regionId: value })
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
                  value={form?.employeeGender}
                  onChange={(value: any) =>
                    setForm({ ...form, employeeGender: value })
                  }
                />
              </div>

              {/* isAccident */}
              <div>
                <Label>PLH / Non-PLH</Label>
                <Select
                  options={[
                    { value: true, label: "PLH" },
                    { value: false, label: "Non-PLH" },
                  ]}
                  value={form.isAccident}
                  onChange={(value: any) =>
                    setForm({ ...form, isAccident: value })
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
            <div className="pt-6">
              <Button
                onClick={handleSubmit}
                disabled={submitLoading}
                className="px-4 py-2 text-white rounded bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {submitLoading ? "Menyimpan..." : "Simpan Pegawai Baru"}
              </Button>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
