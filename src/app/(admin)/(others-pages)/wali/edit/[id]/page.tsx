"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import FileInput from "@/components/form/input/FileInput";

import { Image, Select, Input, message, Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { API_WALI, API_EMPLOYEES } from "@/lib/apiEndpoint";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";
import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Option } from "@/components/form/Select";
import { Employee } from "@/types/employee";
import { Wali } from "@/types/wali"; // <= pastikan ini ada
import { useParams, useRouter } from "next/navigation";

const { TextArea } = Input;

export default function UpdateWali() {
  const params = useParams();
  const router = useRouter();
  const waliId = params.id;

  const [employees, setEmployees] = useState<Option[]>([]);

  const [previewPict, setPreviewPict] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [form, setForm] = useState<Wali | null>(null);

  const validateFile = (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 1 * 1024 * 1024;

    if (!allowed.includes(file.type)) {
      messageApi.error("Format tidak valid.");
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

  const toSnake = (str: string) =>
    str.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [empRes, waliRes] = await Promise.all([
          fetchWithAuth(`${API_EMPLOYEES}/list`),
          fetchWithAuth(`${API_WALI}/${waliId}`),
        ]);

        const employeeData = camelcaseKeys((await empRes.json()).data, {
          deep: true,
        });
        const waliData = camelcaseKeys((await waliRes.json()).data, {
          deep: true,
        });

        setEmployees(
          employeeData.map((e: Employee) => ({
            value: e.id,
            label: e.employeeName,
          }))
        );

        setForm({ ...waliData });

        if (waliData.waliPict) setPreviewPict(waliData.waliPict);

        setLoading(false);
      } catch (err) {
        console.error(err);
        messageApi.error("Gagal memuat data.");
      }
    };

    loadAll();
  }, [messageApi, waliId]);

  if (loading || !form)
    return (
      <div className="flex gap-2">
        <Flex align="center" gap="middle">
          <Spin indicator={<LoadingOutlined spin />} size="small" />
        </Flex>
        Loading...
      </div>
    );

  const handleUpdate = async () => {
    setSubmitLoading(true);

    messageApi.loading({
      key: "update",
      content: "Menyimpan perubahan...",
      duration: 0,
    });

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        fd.append(toSnake(key), String(value));
      });

      if (photoFile) fd.append("photo", photoFile);

      const res = await fetchWithAuth(`${API_WALI}/${waliId}`, {
        method: "PATCH",
        body: fd,
      });

      if (!res.ok) throw new Error("Update gagal");

      messageApi.success({
        key: "update",
        content: "Berhasil diperbarui!",
      });

      router.back();
    } catch (err) {
      console.error(err);
      messageApi.error({
        key: "update",
        content: "Gagal menyimpan perubahan.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div>
      {contextHolder}
      <PageBreadcrumb pageTitle="Form Sunting Wali" />

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
              
              <div>
                <Label>Foto Lama</Label>
                {form.waliPict ? (
                  <Image
                    src={form?.waliPict || "/images/user/alt-user.png"}
                    alt="Preview Foto"
                    className="object-cover rounded-md max-h-32"
                  />
                ) : (
                  "Tidak Ada Foto Lama"
                )}
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
                onClick={handleUpdate}
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
