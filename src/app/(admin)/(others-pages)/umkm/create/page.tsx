"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import FileInput from "@/components/form/input/FileInput";

import { Image, Select, Input, message, Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import {
  API_REGIONS,
  API_SUBDISTRICTS,
  API_EMPLOYEES,
  API_PARTNERS,
  API_CHILDRENS,
  API_WALI,
  API_UMKM,
} from "@/lib/apiEndpoint";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";
import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Option } from "@/components/form/Select";
import { useRouter } from "next/navigation";
import { Region } from "@/types/region";
import { Subdistricts } from "@/types/subdistrict";
import { Employee } from "@/types/employee";
import { Partner } from "@/types/partner";
import { Children } from "@/types/children";
import { Wali } from "@/types/wali";

const { TextArea } = Input;

export default function CreateUmkm() {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const [regions, setRegions] = useState<Option[]>([]);
  const [subdistricts, setSubdistricts] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<Option[]>([]);
  const [partners, setPartners] = useState<Option[]>([]);
  const [childrens, setChildrens] = useState<Option[]>([]);
  const [wali, setWali] = useState<Option[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Preview photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewPict, setPreviewPict] = useState<string | null>(null);

  const validateFile = (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      messageApi.error("Format gambar harus JPG/PNG/WEBP.");
      return false;
    }
    if (file.size > 1 * 1024 * 1024) {
      messageApi.error("Ukuran maksimal 1MB.");
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

  // FORM STATE (mengikuti interface Umkm)
  const [form, setForm] = useState({
    partnerId: null as number | null,
    ownerName: "",
    businessName: "",
    businessAddress: "",
    regionId: null as number | null,
    subdistrictId: null as number | null,
    postalCode: "",
    umkmCoordinate: "",
    businessType: "",
    products: "",
    employeeId: null as number | null,
    waliId: null as number | null,
    childrenId: null as number | null,
    umkmPict: null,
  });

  const toSnake = (str: string) =>
    str.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);

  const handleSubmit = async () => {
    if (!form.ownerName) return messageApi.error("Nama pemilik wajib diisi.");
    if (!form.businessName) return messageApi.error("Nama usaha wajib diisi.");
    if (!form.regionId) return messageApi.error("Wilayah wajib dipilih.");
    if (!form.subdistrictId)
      return messageApi.error("Kecamatan wajib dipilih.");
    if (!form.umkmCoordinate.trim())
      return messageApi.error("Koordinat UMKM wajib diisi.");

    setSubmitLoading(true);
    messageApi.loading({
      content: "Membuat UMKM...",
      key: "save",
      duration: 0,
    });

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        fd.append(toSnake(key), String(value));
      });

      if (photoFile) fd.append("photo", photoFile);

      const res = await fetchWithAuth(API_UMKM, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Gagal membuat UMKM");

      messageApi.success({ content: "UMKM berhasil dibuat!", key: "save" });
      router.push("/umkm");
    } catch (err) {
      console.error(err);
      messageApi.error({ content: "Gagal membuat UMKM", key: "save" });
    } finally {
      setSubmitLoading(false);
    }
  };

  // FETCH ALL SELECT OPTIONS
  useEffect(() => {
    const load = async () => {
      try {
        const [reg, subd, emp, prt, chd, wl] = await Promise.all([
          fetchWithAuth(API_REGIONS + "/list"),
          fetchWithAuth(API_SUBDISTRICTS + "/list"),
          fetchWithAuth(`${API_EMPLOYEES}/list`),
          fetchWithAuth(`${API_PARTNERS}` + "/list"),
          fetchWithAuth(`${API_CHILDRENS}` + "/list"),
          fetchWithAuth(`${API_WALI}` + "/list"),
        ]);

        setRegions(
          camelcaseKeys((await reg.json()).data).map((v: Region) => ({
            label: v.regionName,
            value: v.regionId,
          }))
        );

        setSubdistricts(
          camelcaseKeys((await subd.json()).data).map((v: Subdistricts) => ({
            label: v.subdistrictName,
            value: v.subdistrictId,
          }))
        );

        setEmployees(
          camelcaseKeys((await emp.json()).data).map((v: Employee) => ({
            label: v.employeeName,
            value: v.id,
          }))
        );

        setPartners(
          camelcaseKeys((await prt.json()).data).map((v: Partner) => ({
            label: v.partnerName,
            value: v.id,
          }))
        );

        setChildrens(
          camelcaseKeys((await chd.json()).data).map((v: Children) => ({
            label: v.childrenName,
            value: v.id,
          }))
        );

        setWali(
          camelcaseKeys((await wl.json()).data).map((v: Wali) => ({
            label: v.waliName,
            value: v.id,
          }))
        );
      } catch (e) {
        console.error(e);
        messageApi.error("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [messageApi]);

  if (loading)
    return (
      <div className="flex gap-2">
        <Flex align="center" gap="middle">
          <Spin indicator={<LoadingOutlined spin />} size="small" />
        </Flex>
        Loading...
      </div>
    );

  return (
    <div>
      {contextHolder}
      <PageBreadcrumb pageTitle="Tambah Data UMKM" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* LEFT FORM */}
        <div className="space-y-6">
          <ComponentCard title="Data UMKM">
            <div className="space-y-6">
              <div>
                <Label>Nama Pemilik *</Label>
                <Input
                  size="large"
                  value={form.ownerName}
                  onChange={(e) =>
                    setForm({ ...form, ownerName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Nama Usaha *</Label>
                <Input
                  size="large"
                  value={form.businessName}
                  onChange={(e) =>
                    setForm({ ...form, businessName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Alamat Usaha</Label>
                <TextArea
                  rows={4}
                  value={form.businessAddress ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, businessAddress: e.target.value })
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
            </div>
          </ComponentCard>
        </div>

        {/* RIGHT FORM */}
        <div className="space-y-6">
          <ComponentCard title="Detail Lokasi & Relasi">
            <div className="space-y-6">
              <div>
                <Label>Wilayah *</Label>
                <Select
                  size="large"
                  className="w-full"
                  options={regions}
                  value={form.regionId}
                  onChange={(v) => setForm({ ...form, regionId: v })}
                />
              </div>

              <div>
                <Label>Kecamatan *</Label>
                <Select
                  size="large"
                  className="w-full"
                  options={subdistricts}
                  value={form.subdistrictId}
                  onChange={(v) => setForm({ ...form, subdistrictId: v })}
                />
              </div>

              <div>
                <Label>Kode Pos</Label>
                <Input
                  size="large"
                  value={form.postalCode}
                  onChange={(e) =>
                    setForm({ ...form, postalCode: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Koordinat UMKM *</Label>
                <Input
                  size="large"
                  value={form.umkmCoordinate}
                  onChange={(e) =>
                    setForm({ ...form, umkmCoordinate: e.target.value })
                  }
                />
              </div>

              {/* RELATIONS */}
              <div>
                <Label>Pegawai (Optional)</Label>
                <Select
                  size="large"
                  className="w-full"
                  allowClear
                  options={employees}
                  value={form.employeeId}
                  onChange={(v) => setForm({ ...form, employeeId: v })}
                />
              </div>

              <div>
                <Label>Pasangan (Optional)</Label>
                <Select
                  size="large"
                  className="w-full"
                  allowClear
                  options={partners}
                  value={form.partnerId}
                  onChange={(v) => setForm({ ...form, partnerId: v })}
                />
              </div>

              <div>
                <Label>Wali (Optional)</Label>
                <Select
                  size="large"
                  className="w-full"
                  allowClear
                  options={wali}
                  value={form.waliId}
                  onChange={(v) => setForm({ ...form, waliId: v })}
                />
              </div>

              <div>
                <Label>Anak (Optional)</Label>
                <Select
                  size="large"
                  className="w-full"
                  allowClear
                  options={childrens}
                  value={form.childrenId}
                  onChange={(v) => setForm({ ...form, childrenId: v })}
                />
              </div>

              {/* PHOTO */}
              <div>
                <Label>Foto UMKM (Opsional)</Label>
                <FileInput onChange={handleSelectFile} />
                {previewPict && (
                  <Image
                    src={previewPict}
                    alt="preview"
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
