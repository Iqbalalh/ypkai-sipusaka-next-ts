"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import FileInput from "@/components/form/input/FileInput";

import { Image, Select, Input, message, Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import {
  API_UMKM,
  API_REGIONS,
  API_PARTNERS,
  API_EMPLOYEES,
  API_WALI,
  API_CHILDRENS,
  API_SUBDISTRICTS,
} from "@/lib/apiEndpoint";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";
import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Option } from "@/components/form/Select";
import { Region } from "@/types/region";
import { Subdistricts } from "@/types/subdistrict";
import { Partner } from "@/types/partner";
import { Employee } from "@/types/employee";
import { useParams, useRouter } from "next/navigation";
import { Umkm } from "@/types/umkm";
import { Wali } from "@/types/wali";
import { Children } from "@/types/children";

const { TextArea } = Input;

export default function UpdateUmkm() {
  const params = useParams();
  const router = useRouter();
  const umkmId = params.id;

  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [previewPict, setPreviewPict] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Select Options
  const [regions, setRegions] = useState<Option[]>([]);
  const [subdistricts, setSubdistricts] = useState<Option[]>([]);
  const [partners, setPartners] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<Option[]>([]);
  const [wali, setWali] = useState<Option[]>([]);
  const [childrens, setChildrens] = useState<Option[]>([]);

  // Form state
  const [form, setForm] = useState<Umkm | null>(null);

  const toSnake = (str: string) =>
    str.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);

  // FILE VALIDATION
  const validateFile = (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 1 * 1024 * 1024;

    if (!allowed.includes(file.type)) {
      messageApi.error("Format gambar tidak valid.");
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

  // =====================
  // FETCH DATA
  // =====================
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [regRes, subRes, partRes, empRes, waliRes, childRes, umkmRes] =
          await Promise.all([
            fetchWithAuth(API_REGIONS + "/list"),
            fetchWithAuth(API_SUBDISTRICTS + "/list"),
            fetchWithAuth(API_PARTNERS + "/list"),
            fetchWithAuth(API_EMPLOYEES + "/list"),
            fetchWithAuth(API_WALI + "/list"),
            fetchWithAuth(API_CHILDRENS + "/list"),
            fetchWithAuth(`${API_UMKM}/${umkmId}`),
          ]);

        const regionData = camelcaseKeys((await regRes.json()).data, {
          deep: true,
        });
        const subData = camelcaseKeys((await subRes.json()).data, {
          deep: true,
        });
        const partnerData = camelcaseKeys((await partRes.json()).data, {
          deep: true,
        });
        const employeeData = camelcaseKeys((await empRes.json()).data, {
          deep: true,
        });
        const waliData = camelcaseKeys((await waliRes.json()).data, {
          deep: true,
        });
        const childrenData = camelcaseKeys((await childRes.json()).data, {
          deep: true,
        });
        const umkmData = camelcaseKeys((await umkmRes.json()).data, {
          deep: true,
        });

        // Fill options
        setRegions(
          regionData.map((r: Region) => ({
            value: r.regionId,
            label: r.regionName,
          }))
        );

        setSubdistricts(
          subData.map((s: Subdistricts) => ({
            value: s.subdistrictId,
            label: s.subdistrictName,
          }))
        );

        setPartners(
          partnerData.map((p: Partner) => ({
            value: p.id,
            label: p.partnerName,
          }))
        );

        setEmployees(
          employeeData.map((e: Employee) => ({
            value: e.id,
            label: e.employeeName,
          }))
        );

        setWali(
          waliData.map((w: Wali) => ({
            value: w.id,
            label: w.waliName,
          }))
        );

        setChildrens(
          childrenData.map((c: Children) => ({
            value: c.id,
            label: c.childrenName,
          }))
        );

        // Set form default
        setForm({
          ...umkmData,
        });

        if (umkmData.photoUrl) {
          setPreviewPict(umkmData.photoUrl);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        messageApi.error("Gagal memuat data UMKM.");
      }
    };

    loadAll();
  }, [messageApi, umkmId]);

  if (loading || !form)
    return (
      <div className="flex gap-2">
        <Flex align="center" gap="middle">
          <Spin indicator={<LoadingOutlined spin />} size="small" />
        </Flex>{" "}
        Loading...
      </div>
    );

  // =====================
  // SUBMIT UPDATE
  // =====================
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

      const res = await fetchWithAuth(`${API_UMKM}/${umkmId}`, {
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
        content: "Gagal memperbarui UMKM.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // =====================
  // FORM UI
  // =====================
  return (
    <div>
      {contextHolder}
      <PageBreadcrumb pageTitle="Form Sunting UMKM" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* LEFT FORM */}
        <div className="space-y-6">
          <ComponentCard title="Ubah Data UMKM">
            <div className="space-y-6">
              <div>
                <Label>Pemilik *</Label>
                <Input
                  size="large"
                  value={form.ownerName}
                  onChange={(e) =>
                    setForm({ ...form, ownerName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Nama UMKM *</Label>
                <Input
                  size="large"
                  value={form.businessName}
                  onChange={(e) =>
                    setForm({ ...form, businessName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Alamat</Label>
                <TextArea
                  rows={3}
                  size="large"
                  value={form.businessAddress ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, businessAddress: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Jenis Usaha</Label>
                <Input
                  size="large"
                  value={form.businessType ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, businessType: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Produk</Label>
                <Input
                  size="large"
                  value={form.products ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, products: e.target.value })
                  }
                />
              </div>
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
                  value={form.postalCode ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, postalCode: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Koordinat UMKM *</Label>
                <Input
                  size="large"
                  value={form.umkmCoordinate ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, umkmCoordinate: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Pasangan (Opsional)</Label>
                <Select
                  size="large"
                  options={partners}
                  value={form.partnerId}
                  onChange={(v) => setForm({ ...form, partnerId: v })}
                />
              </div>

              <div>
                <Label>Pegawai (Opsional)</Label>
                <Select
                  size="large"
                  options={employees}
                  value={form.employeeId}
                  onChange={(v) => setForm({ ...form, employeeId: v })}
                />
              </div>

              <div>
                <Label>Wali (Opsional)</Label>
                <Select
                  size="large"
                  options={wali}
                  value={form.waliId}
                  onChange={(v) => setForm({ ...form, waliId: v })}
                />
              </div>

              <div>
                <Label>Anak (Opsional)</Label>
                <Select
                  size="large"
                  options={childrens}
                  value={form.childrenId}
                  onChange={(v) => setForm({ ...form, childrenId: v })}
                />
              </div>

              <div>
                <Label>Foto UMKM</Label>
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
