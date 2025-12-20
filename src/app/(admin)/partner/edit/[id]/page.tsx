"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import FileInput from "@/components/form/input/FileInput";

import {
  Image,
  Select,
  Input,
  message,
  Flex,
  Spin,
  Popconfirm,
  Button as AButton,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import {
  API_PARTNERS,
  API_REGIONS,
  API_EMPLOYEES,
  API_SUBDISTRICTS,
  API_DELETE_PICTURE,
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
import { useParams, useRouter } from "next/navigation";
import { extractKeyFromUrl } from "@/lib/extractKey";

const { TextArea } = Input;

export default function UpdatePartner() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params.id;

  const [regions, setRegions] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<Option[]>([]);
  const [subdistricts, setSubdistricts] = useState<Option[]>([]);

  const [previewPict, setPreviewPict] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // FORM STATE
  const [form, setForm] = useState<Partner | null>(null);

  // VALIDASI FILE
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

  // ============================
  // FETCH DATA
  // ============================
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [regRes, empRes, subdRes, parRes] = await Promise.all([
          fetchWithAuth(API_REGIONS + "/list"),
          fetchWithAuth(`${API_EMPLOYEES}/list`),
          fetchWithAuth(API_SUBDISTRICTS + "/list"),
          fetchWithAuth(`${API_PARTNERS}/${partnerId}`),
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
        const partnerData = camelcaseKeys((await parRes.json()).data, {
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
            label: e.employeeName,
          }))
        );

        setSubdistricts(
          subdistrictData.map((e: Subdistricts) => ({
            value: e.subdistrictId,
            label: e.subdistrictName,
          }))
        );

        // Set form default
        setForm({
          ...partnerData,
        });

        if (partnerData.photoUrl) {
          setPreviewPict(partnerData.photoUrl);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        messageApi.error("Gagal memuat data.");
      }
    };

    loadAll();
  }, [messageApi, partnerId]);

  if (loading || !form)
    return (
      <div className="flex gap-2">
        <Flex align="center" gap="middle">
          <Spin indicator={<LoadingOutlined spin />} size="small" />
        </Flex>{" "}
        Loading...
      </div>
    );

  // Handle Delete
  const handleDeletePartnerPhoto = async () => {
    if (!form.partnerPict) {
      messageApi.error("Tidak ada foto untuk dihapus.");
      return;
    }

    try {
      messageApi.loading({
        content: "Menghapus foto...",
        key: "delete-partner-photo",
        duration: 0,
      });

      const keyObject = extractKeyFromUrl(form.partnerPict);

      const res = await fetchWithAuth(API_DELETE_PICTURE, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyObject }),
      });

      if (!res.ok) throw new Error("Gagal menghapus foto");

      setForm((prev) => ({
        ...prev!,
        partnerPict: null,
      }));
      setPhotoFile(null);

      messageApi.success({
        content: "Foto berhasil dihapus!",
        key: "delete-partner-photo",
        duration: 2,
      });
      handleUpdate()
    } catch (err) {
      console.error(err);
      messageApi.error({
        content: "Gagal menghapus foto.",
        key: "delete-partner-photo",
        duration: 2,
      });
    }
  };

  // ============================
  // SUBMIT UPDATE
  // ============================
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

        let finalVal = value;
        if (key === "isActive" || key === "isAlive") {
          finalVal = value ? 1 : 0;
        }

        fd.append(toSnake(key), String(finalVal));
      });

      if (photoFile) fd.append("photo", photoFile);

      const res = await fetchWithAuth(`${API_PARTNERS}/${partnerId}`, {
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

  // ============================
  // RENDER
  // ============================
  return (
    <div>
      {contextHolder}
      <PageBreadcrumb pageTitle="Form Sunting Pasangan" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* LEFT FORM */}
        <div className="space-y-6">
          <ComponentCard title="Ubah Data Pasangan">
            <div className="space-y-6">
              {/* EMPLOYEE */}
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
                  onChange={(v) => setForm({ ...form, employeeId: v })}
                />
              </div>

              <div>
                <Label>Nama Pasangan *</Label>
                <Input
                  value={form.partnerName}
                  size="large"
                  onChange={(e) =>
                    setForm({ ...form, partnerName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Pekerjaan</Label>
                <Input
                  value={form.partnerJob}
                  size="large"
                  onChange={(e) =>
                    setForm({ ...form, partnerJob: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>NIK</Label>
                <Input
                  size="large"
                  type="number"
                  value={form.partnerNik}
                  onChange={(e) =>
                    setForm({ ...form, partnerNik: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Alamat *</Label>
                <TextArea
                  rows={3}
                  size="large"
                  value={form.address ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Nomor Telepon *</Label>
                <Input
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
                  size="large"
                  value={form.phoneNumberAlt}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumberAlt: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Foto Lama</Label>

              {form.partnerPict ? (
                <div className="flex items-start gap-3">
                  <Image
                    src={form.partnerPict || "/images/user/alt-user.png"}
                    alt="Preview Foto"
                    className="object-cover rounded-md max-h-32"
                  />

                  <Popconfirm
                    title="Hapus Foto?"
                    description="Foto ini akan dihapus dari server."
                    onConfirm={handleDeletePartnerPhoto}
                    okText="Ya, Hapus"
                    cancelText="Batal"
                  >
                    <AButton>Hapus Foto</AButton>
                  </Popconfirm>
                </div>
              ) : (
                <div className="text-gray-500 italic">Tidak Ada Foto Lama</div>
              )}
            </div>
          </ComponentCard>
        </div>

        {/* RIGHT FORM */}
        <div className="space-y-6">
          <ComponentCard title="* Wajib Diisi">
            <div className="space-y-6">
              <div>
                <Label>Wilayah *</Label>
                <Select
                  className="w-full"
                  size="large"
                  options={regions}
                  value={form.regionId}
                  onChange={(v) => setForm({ ...form, regionId: v })}
                />
              </div>

              <div>
                <Label>Kecamatan *</Label>
                <Select
                  className="w-full"
                  size="large"
                  options={subdistricts}
                  value={form.subdistrictId}
                  onChange={(v) => setForm({ ...form, subdistrictId: v })}
                />
              </div>

              <div>
                <Label>Kode Pos</Label>
                <Input
                  size="large"
                  type="number"
                  value={form.postalCode}
                  onChange={(e) =>
                    setForm({ ...form, postalCode: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Koordinat Rumah *</Label>
                <Input
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

              <div>
                <Label>Status Hidup *</Label>
                <Select
                  size="large"
                  className="w-full"
                  value={form.isAlive}
                  options={[
                    { value: true, label: "Hidup" },
                    { value: false, label: "Meninggal" },
                  ]}
                  onChange={(v) => setForm({ ...form, isAlive: v })}
                />
              </div>

              <div>
                <Label>Foto Pasangan</Label>
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
