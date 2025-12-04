"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import FileInput from "@/components/form/input/FileInput";

import { Image, Select, Input, message, Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { API_EMPLOYEES, API_WALI } from "@/lib/apiEndpoint";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";
import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Employee } from "@/types/employee";
import { Wali } from "@/types/wali";
import { useRouter } from "next/navigation";

const { TextArea } = Input;

export default function CreateWali() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [previewPict, setPreviewPict] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // FORM STATE (sesuai interface)
  const [form, setForm] = useState<Partial<Wali>>({
    employeeId: undefined,
    waliName: "",
    relation: "",
    waliAddress: "",
    addressCoordinate: "",
    waliPhone: "",
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
    if (!form.employeeId) return messageApi.error("Pegawai wajib dipilih.");
    if (!form.waliName?.trim())
      return messageApi.error("Nama wali wajib diisi.");
    if (!form.waliAddress?.trim())
      return messageApi.error("Alamat wajib diisi.");
    if (!form.addressCoordinate?.trim())
      return messageApi.error("Koordinat alamat wajib diisi.");
    if (!form.waliPhone?.trim())
      return messageApi.error("Nomor telepon wajib diisi.");

    setSubmitLoading(true);
    messageApi.loading({
      content: "Membuat data wali...",
      key: "save",
      duration: 0,
    });

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (!value) return;
        fd.append(toSnake(key), String(value));
      });

      if (photoFile) fd.append("photo", photoFile);

      const res = await fetchWithAuth(API_WALI, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Gagal membuat wali");

      messageApi.success({
        content: "Wali berhasil dibuat!",
        key: "save",
        duration: 2,
      });

      router.push("/wali");
    } catch (error) {
      console.error(error);
      messageApi.error({
        content: "Gagal membuat wali.",
        key: "save",
        duration: 2,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // FETCH EMPLOYEES
  useEffect(() => {
    const loadData = async () => {
      const empRes = await fetchWithAuth(`${API_EMPLOYEES}/list`);

      const employeeData = camelcaseKeys((await empRes.json()).data, {
        deep: true,
      });

      setEmployees(
        employeeData.map((e: Employee) => ({
          value: e.id,
          label: `${e.employeeName}`,
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
      <PageBreadcrumb pageTitle="Tambah Data Wali" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* LEFT */}
        <div className="space-y-6">
          <ComponentCard title="Ubah Data Wali">
            <div className="space-y-6">
              <div>
                <Label>Pegawai</Label>
                <Select
                  className="w-full"
                  size="large"
                  options={employees}
                  value={form.employeeId}
                  onChange={(v) => setForm({ ...form, employeeId: v })}
                />
              </div>

              <div>
                <Label>Nama Wali</Label>
                <Input
                  size="large"
                  value={form.waliName}
                  onChange={(e) =>
                    setForm({ ...form, waliName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Hubungan</Label>
                <Input
                  size="large"
                  value={form.relation ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, relation: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Alamat Wali</Label>
                <TextArea
                  rows={3}
                  size="large"
                  value={form.waliAddress ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, waliAddress: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>No. Telepon Wali</Label>
                <Input
                  size="large"
                  value={form.waliPhone ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, waliPhone: e.target.value })
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
                <Label>Koordinat Alamat</Label>
                <Input
                  size="large"
                  value={form.addressCoordinate ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, addressCoordinate: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Foto Wali</Label>
                <FileInput onChange={handleSelectFile} />
                {previewPict && (
                  <Image
                    src={previewPict}
                    alt="Preview"
                    className="mt-3 h-32 rounded-md object-cover"
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
                className="bg-primary-600 text-white"
                disabled={submitLoading}
                onClick={handleSubmit}
              >
                {submitLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
