"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import FileInput from "@/components/form/input/FileInput";

import {
  Image,
  message,
  Input,
  Select,
  Flex,
  Spin,
  Popconfirm,
  Button as AButton,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import TextArea from "antd/es/input/TextArea";

import {
  API_DELETE_PICTURE,
  API_EMPLOYEES,
  API_REGIONS,
} from "@/lib/apiEndpoint";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";
import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Option } from "@/components/form/Select";
import { Employee } from "@/types/employee";
import { Region } from "@/types/region";
import { useParams, useRouter } from "next/navigation";
import { extractKeyFromUrl } from "@/lib/extractKey";

export default function UpdateEmployee() {
  const { id } = useParams();
  const router = useRouter();

  const [regions, setRegions] = useState<Option[]>([]);
  const [previewPict, setPreviewPict] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  // ============================================================
  // FORM
  // ============================================================
  const [form, setForm] = useState<Employee>({
    nipNipp: "",
    employeeName: "",
    deathCause: "",
    lastPosition: "",
    notes: "",
    regionId: null,
    employeeGender: "M",
    isAccident: false,
    employeePict: "",
  });

  // ============================================================
  // VALIDASI FILE
  // ============================================================
  const validateFile = (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 1 * 1024 * 1024;

    if (!allowed.includes(file.type)) {
      messageApi.error("Format tidak valid. Hanya JPG, PNG, WEBP.");
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
    str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

  // ============================================================
  // SUBMIT / PATCH
  // ============================================================
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
      content: "Menyimpan perubahan...",
      key: "save",
      duration: 0,
    });

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        let finalValue = value;
        if (key === "isAccident") {
          finalValue = value ? 1 : 0;
        }

        fd.append(toSnake(key), String(finalValue));
      });

      if (photoFile) fd.append("photo", photoFile);

      const res = await fetchWithAuth(`${API_EMPLOYEES}/${id}`, {
        method: "PATCH",
        body: fd,
      });

      if (!res.ok) throw new Error("Gagal update pegawai");

      messageApi.success({
        content: "Berhasil mengubah data pegawai!",
        key: "save",
        duration: 2,
      });
      router.back();
    } catch (error) {
      console.error(error);
      messageApi.error({
        content: "Gagal mengubah data.",
        key: "save",
        duration: 2,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete Photo
  const handleDeletePhoto = async () => {
  if (!form.employeePict) {
    messageApi.error("Tidak ada foto untuk dihapus.");
    return;
  }

  const keyObject = extractKeyFromUrl(form.employeePict);
  if (!keyObject) {
    messageApi.error("Gagal memproses URL foto.");
    return;
  }

  console.log(keyObject)

  try {
    messageApi.loading({
      content: "Menghapus foto...",
      key: "delete-photo",
      duration: 0,
    });

    const res = await fetchWithAuth(API_DELETE_PICTURE, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyObject }),
    });

    if (!res.ok) throw new Error("Gagal menghapus foto");

    setForm((prev) => ({
      ...prev,
      employeePict: null,
    }));
    setPhotoFile(null);

    messageApi.success({
      content: "Foto berhasil dihapus!",
      key: "delete-photo",
      duration: 2,
    });
    handleSubmit()
  } catch (err) {
    console.error(err);
    messageApi.error({
      content: "Gagal menghapus foto.",
      key: "delete-photo",
      duration: 2,
    });
  }
};


  // ============================================================
  // FETCH EMPLOYEE + REGIONS
  // ============================================================
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // 1. Fetch Regions
        const regRes = await fetchWithAuth(API_REGIONS + "/list");
        const regData = camelcaseKeys((await regRes.json()).data, {
          deep: true,
        });

        setRegions(
          regData.map((r: Region) => ({
            value: r.regionId,
            label: r.regionName,
          }))
        );

        // 2. Fetch Employee Existing Data
        const empRes = await fetchWithAuth(`${API_EMPLOYEES}/${id}`);
        const empData = camelcaseKeys((await empRes.json()).data, {
          deep: true,
        });

        setForm({
          nipNipp: empData.nipNipp ?? "",
          employeeName: empData.employeeName ?? "",
          deathCause: empData.deathCause ?? "",
          lastPosition: empData.lastPosition ?? "",
          notes: empData.notes ?? "",
          regionId: empData.regionId ?? null,
          employeeGender: empData.employeeGender ?? "M",
          isAccident: empData.isAccident === 1,
          employeePict: empData.employeePict ?? undefined,
        });

        if (empData.photoUrl) {
          setPreviewPict(empData.photoUrl);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        messageApi.error("Gagal memuat data.");
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id, messageApi]);

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
      <PageBreadcrumb pageTitle="Form Sunting Pegawai" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* LEFT FORM */}
        <div className="space-y-6">
          <ComponentCard title="Ubah Data Pegawai">
            <div className="space-y-6">
              {/* NIP */}
              <div>
                <Label>NIP / NIPP *</Label>
                <Input
                  size="large"
                  type="number"
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
                  size="large"
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
                  size="large"
                  value={form.deathCause}
                  onChange={(e) =>
                    setForm({ ...form, deathCause: e.target.value })
                  }
                />
              </div>

              {/* Last Position */}
              <div>
                <Label>Posisi Terakhir</Label>
                <Input
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

            <div>
              <Label>Foto Lama</Label>

              {form.employeePict ? (
                <div className="flex flex-col gap-2">
                  {/* Foto tetap berdiri sendiri */}
                  <Image
                    src={form.employeePict}
                    alt="Preview Foto"
                    className="object-cover rounded-md max-h-32"
                  />

                  <Popconfirm
                    title="Hapus Foto?"
                    description="Apakah Anda yakin ingin menghapus foto ini?"
                    okText="Hapus"
                    cancelText="Batal"
                    onConfirm={handleDeletePhoto}
                  >
                    <AButton>Hapus Foto</AButton>
                  </Popconfirm>
                </div>
              ) : (
                "Tidak Ada Foto Lama"
              )}
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
                  style={{ width: "100%" }}
                  optionFilterProp="label"
                  options={regions}
                  value={form.regionId}
                  onChange={(v) => setForm({ ...form, regionId: v })}
                />
              </div>

              {/* Gender */}
              <div>
                <Label>Jenis Kelamin *</Label>
                <Select
                  size="large"
                  className="w-full"
                  options={[
                    { value: "F", label: "Perempuan" },
                    { value: "M", label: "Laki-laki" },
                  ]}
                  value={form.employeeGender}
                  onChange={(v) => setForm({ ...form, employeeGender: v })}
                />
              </div>

              {/* isAccident */}
              <div>
                <Label>PLH / Non-PLH *</Label>
                <Select
                  size="large"
                  className="w-full"
                  options={[
                    { value: true, label: "PLH" },
                    { value: false, label: "Non-PLH" },
                  ]}
                  value={form.isAccident}
                  onChange={(v) => setForm({ ...form, isAccident: v })}
                />
              </div>

              {/* Foto */}
              <div>
                <Label>Foto Pegawai *</Label>
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
                {submitLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
