/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import FileInput from "@/components/form/input/FileInput";
import Button from "@/components/ui/button/Button";
import { Option } from "@/components/form/Select";

import { Image, Select, Input, message, Flex, Spin, DatePicker } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { API_HOMES, API_CHILDRENS } from "@/lib/apiEndpoint";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";
import dayjs from "dayjs";
import InputPhone from "@/components/form/form-elements/InputPhone";

const { TextArea } = Input;

// ----------------------------
// Helpers
// ----------------------------
const toSnake = (str: string) =>
  str.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

// ----------------------------
// Component
// ----------------------------
export default function CreateChildren() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [homes, setHomes] = useState<Option[]>([]);
  const [previewPict, setPreviewPict] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    employeeId: null,
    partnerId: null,
    homeId: null,
    childrenName: "",
    childrenBirthdate: "",
    childrenAddress: "",
    childrenPhone: "",
    notes: "",
    isActive: true,
    isFatherAlive: true,
    isMotherAlive: true,
    childrenGender: "M",
    isCondition: false,
    index: 0,
    nik: "",
    childrenJob: "",
  });

  // ----------------------------
  // File validation
  // ----------------------------
  const validateFile = (file: File) => {
    if (!allowedImageTypes.includes(file.type)) {
      messageApi.error("Format foto tidak valid.");
      return false;
    }
    if (file.size > 1 * 1024 * 1024) {
      messageApi.error("Maksimal ukuran foto 1MB.");
      return false;
    }
    return true;
  };

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    setPhotoFile(file);
    setPreviewPict(URL.createObjectURL(file));
  };

  // ----------------------------
  // Submit
  // ----------------------------
  const handleSubmit = async () => {
    if (!form.childrenName.trim())
      return messageApi.error("Nama anak wajib diisi.");

    if (!form.homeId) return messageApi.error("Keluarga wajib dipilih.");

    setSubmitLoading(true);
    messageApi.loading({
      content: "Menyimpan data anak...",
      key: "save",
      duration: 0,
    });

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          fd.append(toSnake(key), String(value));
        }
      });

      if (photoFile) fd.append("photo", photoFile);

      const res = await fetchWithAuth(API_CHILDRENS, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error();

      messageApi.success({
        content: "Data anak berhasil dibuat!",
        key: "save",
      });

      router.push("/children");
    } catch (err) {
      console.error(err);
      messageApi.error({
        content: "Gagal menyimpan data anak.",
        key: "save",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // ----------------------------
  // Fetch Data (homes)
  // ----------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        const homeRes = await fetchWithAuth(`${API_HOMES}/list`);
        const homeData = camelcaseKeys((await homeRes.json()).data);

        setHomes(
          homeData.map((h: any) => ({
            value: h.id,
            label: `${h.employeeName} - ${h.partnerName}`,
            partnerId: h.partnerId,
            employeeId: h.employeeId,
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ----------------------------
  // Loading Screen
  // ----------------------------
  if (loading)
    return (
      <div className="flex gap-2">
        <Flex align="center" gap="middle">
          <Spin indicator={<LoadingOutlined spin />} size="small" />
        </Flex>
        Loading...
      </div>
    );

  // ----------------------------
  // JSX
  // ----------------------------
  return (
    <div>
      {contextHolder}
      <PageBreadcrumb pageTitle="Tambah Data Anak" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* LEFT */}
        <div className="space-y-6">
          <ComponentCard title="Isi Data Anak">
            <div className="space-y-6">
              {/* Nama Anak */}
              <div>
                <Label>Nama Anak *</Label>
                <Input
                  size="large"
                  value={form.childrenName}
                  onChange={(e) =>
                    setForm({ ...form, childrenName: e.target.value })
                  }
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <Label>Tanggal Lahir</Label>
                <DatePicker
                  size="large"
                  className="w-full"
                  value={
                    form.childrenBirthdate
                      ? dayjs(form.childrenBirthdate)
                      : null
                  }
                  onChange={(date) =>
                    setForm({
                      ...form,
                      childrenBirthdate: date ? date.format("YYYY-MM-DD") : "",
                    })
                  }
                />
              </div>

              {/* Nomor Telepon */}
              <div>
                <Label>No. Telepon</Label>
                <InputPhone
                  size="large"
                  value={form.childrenPhone}
                  onChange={(e) => setForm({ ...form, childrenPhone: e })}
                />
              </div>

              <div>
                <Label>NIK</Label>
                <Input
                  size="large"
                  type="number"
                  value={form.nik ?? ""}
                  onChange={(e) => setForm({ ...form, nik: e.target.value })}
                />
              </div>

              <div>
                <Label>Pekerjaan</Label>
                <Input
                  size="large"
                  value={form.childrenJob ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, childrenJob: e.target.value })
                  }
                />
              </div>

              {/* Alamat */}
              <div>
                <Label>Alamat</Label>
                <TextArea
                  size="large"
                  rows={3}
                  value={form.childrenAddress}
                  onChange={(e) =>
                    setForm({ ...form, childrenAddress: e.target.value })
                  }
                />
              </div>

              {/* Anak Ke- */}
              <div>
                <Label>Anak Ke-</Label>
                <Input
                  size="large"
                  type="number"
                  value={form.index}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      index: Number(e.target.value),
                    })
                  }
                />
              </div>

              {/* Status */}
              <div>
                <Label>Status</Label>
                <Select
                  size="large"
                  className="w-full"
                  value={form.isActive}
                  options={[
                    { value: true, label: "Aktif" },
                    { value: false, label: "Tidak Aktif" },
                  ]}
                  onChange={(v) => setForm({ ...form, isActive: v })}
                />
              </div>

              {/* Catatan */}
              <div>
                <Label>Catatan</Label>
                <TextArea
                  size="large"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <ComponentCard title="Data Tambahan">
            <div className="space-y-6">
              {/* Keluarga */}
              <div>
                <Label>Keluarga</Label>
                <Select
                  showSearch
                  size="large"
                  className="w-full"
                  options={homes}
                  value={form.homeId}
                  onChange={(value, option: any) =>
                    setForm({
                      ...form,
                      homeId: value,
                      partnerId: option?.partnerId ?? null,
                      employeeId: option?.employeeId ?? null,
                    })
                  }
                />
              </div>

              {/* Gender */}
              <div>
                <Label>Jenis Kelamin *</Label>
                <Select
                  size="large"
                  className="w-full"
                  value={form.childrenGender}
                  options={[
                    { value: "M", label: "Laki-laki" },
                    { value: "F", label: "Perempuan" },
                  ]}
                  onChange={(v) => setForm({ ...form, childrenGender: v })}
                />
              </div>

              {/* Ayah */}
              <div>
                <Label>Status Ayah *</Label>
                <Select
                  size="large"
                  className="w-full"
                  value={form.isFatherAlive}
                  options={[
                    { value: true, label: "Hidup" },
                    { value: false, label: "Meninggal" },
                  ]}
                  onChange={(v) => setForm({ ...form, isFatherAlive: v })}
                />
              </div>

              {/* Ibu */}
              <div>
                <Label>Status Ibu *</Label>
                <Select
                  size="large"
                  className="w-full"
                  value={form.isMotherAlive}
                  options={[
                    { value: true, label: "Hidup" },
                    { value: false, label: "Meninggal" },
                  ]}
                  onChange={(v) => setForm({ ...form, isMotherAlive: v })}
                />
              </div>

              {/* Kondisi */}
              <div>
                <Label>Kondisi *</Label>
                <Select
                  size="large"
                  className="w-full"
                  value={form.isCondition}
                  options={[
                    { value: true, label: "Normal" },
                    { value: false, label: "ABK" },
                  ]}
                  onChange={(v) => setForm({ ...form, isCondition: v })}
                />
              </div>

              {/* Foto */}
              <div>
                <Label>Foto Anak</Label>
                <FileInput onChange={handleSelectFile} />
                {previewPict && (
                  <Image
                    src={previewPict}
                    className="mt-3 h-32 object-cover rounded-md"
                    alt="Preview"
                  />
                )}
              </div>
            </div>

            {/* Buttons */}
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
