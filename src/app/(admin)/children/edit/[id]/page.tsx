/* eslint-disable @typescript-eslint/no-explicit-any */
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
  DatePicker,
  Popconfirm,
  Button as AButton,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import {
  API_HOMES,
  API_CHILDRENS,
  API_DELETE_PICTURE,
} from "@/lib/apiEndpoint";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

import camelcaseKeys from "camelcase-keys";
import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Option } from "@/components/form/Select";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { extractKeyFromUrl } from "@/lib/extractKey";

const { TextArea } = Input;

export default function UpdateChildren() {
  const { id } = useParams();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [homes, setHomes] = useState<Option[]>([]);
  const [previewPict, setPreviewPict] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // ==========================
  // FORM STATE (with nullable values)
  // ==========================
  const [form, setForm] = useState({
    employeeId: null,
    partnerId: null,
    homeId: null,

    childrenName: "",
    childrenBirthdate: null as string | null,
    childrenAddress: "",
    childrenPhone: "",
    notes: "",
    index: null as number | null,
    nik: null as string | null,
    childrenJob: null as string | null,

    isActive: true,
    isFatherAlive: true,
    isMotherAlive: true,
    childrenGender: "M",
    isCondition: false,

    childrenPict: null,
  });

  // ==========================
  // VALIDASI FOTO
  // ==========================
  const validateFile = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      messageApi.error("Format foto tidak valid.");
      return false;
    }
    if (file.size > 1 * 1024 * 1024) {
      messageApi.error("Maksimum ukuran foto 1MB.");
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

  // ==========================
  // SUBMIT PATCH
  // ==========================
  const handleSubmit = async () => {
    if (!form.childrenName.trim()) {
      messageApi.error("Nama anak wajib diisi.");
      return;
    }

    if (!form.homeId) {
      messageApi.error("Keluarga wajib dipilih.");
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
        if (value === undefined) return;

        // kirim null sebagai string "null"
        fd.append(toSnake(key), value === null ? "null" : String(value));
      });

      if (photoFile) fd.append("photo", photoFile);

      const res = await fetchWithAuth(`${API_CHILDRENS}/${id}`, {
        method: "PATCH",
        body: fd,
      });

      if (!res.ok) throw new Error("Gagal update data anak");

      messageApi.success({
        content: "Data anak berhasil diperbarui!",
        key: "save",
      });
      router.back();
    } catch (e) {
      console.error(e);
      messageApi.error({ content: "Gagal menyimpan perubahan.", key: "save" });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteChildrenPhoto = async () => {
    if (!form.childrenPict) {
      messageApi.error("Tidak ada foto untuk dihapus.");
      return;
    }

    try {
      messageApi.loading({
        content: "Menghapus foto...",
        key: "delete-partner-photo",
        duration: 0,
      });

      const keyObject = extractKeyFromUrl(form.childrenPict);

      const res = await fetchWithAuth(API_DELETE_PICTURE, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyObject }),
      });

      if (!res.ok) throw new Error("Gagal menghapus foto");

      setForm((prev) => ({
        ...prev!,
        childrenPict: null,
      }));
      setPhotoFile(null);

      messageApi.success({
        content: "Foto berhasil dihapus!",
        key: "delete-partner-photo",
        duration: 2,
      });
      handleSubmit();
    } catch (err) {
      console.error(err);
      messageApi.error({
        content: "Gagal menghapus foto.",
        key: "delete-partner-photo",
        duration: 2,
      });
    }
  };

  // ==========================
  // FETCH INITIAL DATA
  // ==========================
  useEffect(() => {
    const loadData = async () => {
      try {
        // FETCH homes
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

        // FETCH children
        const childRes = await fetchWithAuth(`${API_CHILDRENS}/${id}`);
        const childData = camelcaseKeys((await childRes.json()).data, {
          deep: true,
        });

        setForm({
          employeeId: childData.employeeId,
          partnerId: childData.partnerId,
          homeId: childData.homeId,

          childrenName: childData.childrenName ?? "",
          childrenBirthdate: childData.childrenBirthdate ?? null,
          childrenAddress: childData.childrenAddress ?? "",
          childrenPhone: childData.childrenPhone ?? "",
          notes: childData.notes ?? "",
          index: childData.index ?? null,
          nik: childData.nik ?? null,
          childrenJob: childData.childrenJob ?? null,

          isActive: childData.isActive === true,
          isFatherAlive: childData.isFatherAlive === true,
          isMotherAlive: childData.isMotherAlive === true,
          childrenGender: childData.childrenGender ?? "M",
          isCondition: childData.isCondition === true,

          childrenPict: childData.childrenPict ?? "",
        });

        if (childData.photoUrl) setPreviewPict(childData.photoUrl);

        setLoading(false);
      } catch (err) {
        console.error(err);
        messageApi.error("Gagal memuat data.");
        setLoading(false);
      }
    };

    loadData();
  }, [id, messageApi]);

  if (loading)
    return (
      <div className="flex gap-2">
        <Flex align="center" gap="middle">
          <Spin indicator={<LoadingOutlined spin />} size="small" />
        </Flex>
        Loading...
      </div>
    );

  // ========================
  // RENDER FORM
  // ========================
  return (
    <div>
      {contextHolder}
      <PageBreadcrumb pageTitle="Form Sunting Data Anak" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* LEFT */}
        <div className="space-y-6">
          <ComponentCard title="Ubah Data Anak">
            <div className="space-y-6">
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
                  onChange={(d) =>
                    setForm({
                      ...form,
                      childrenBirthdate: d ? d.format("YYYY-MM-DD") : null,
                    })
                  }
                />
              </div>

              <div>
                <Label>No Telepon</Label>
                <Input
                  size="large"
                  type="number"
                  value={form.childrenPhone ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, childrenPhone: e.target.value })
                  }
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

              <div>
                <Label>Alamat</Label>
                <TextArea
                  rows={3}
                  size="large"
                  value={form.childrenAddress ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, childrenAddress: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Anak Ke-</Label>
                <Input
                  size="large"
                  type="number"
                  value={form.index ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      index: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>

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

              <div>
                <Label>Catatan</Label>
                <TextArea
                  rows={3}
                  size="large"
                  value={form.notes ?? ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Foto Lama</Label>

              {form.childrenPict ? (
                <div className="flex items-start gap-3">
                  <Image
                    src={form.childrenPict || "/images/user/alt-user.png"}
                    alt="Preview Foto"
                    className="object-cover rounded-md max-h-32"
                  />

                  <Popconfirm
                    title="Hapus Foto?"
                    description="Foto ini akan dihapus dari server."
                    onConfirm={handleDeleteChildrenPhoto}
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

        {/* RIGHT */}
        <div className="space-y-6">
          <ComponentCard title="Data Tambahan">
            <div className="space-y-6">
              <div>
                <Label>Keluarga</Label>
                <Select
                  size="large"
                  className="w-full"
                  showSearch
                  value={form.homeId}
                  options={homes}
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

              <div>
                <Label>Status Ayah</Label>
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

              <div>
                <Label>Status Ibu</Label>
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

              <div>
                <Label>Kondisi</Label>
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

              <div>
                <Label>Foto Baru</Label>
                <FileInput onChange={handleSelectFile} />
                {previewPict && (
                  <Image
                    src={previewPict}
                    alt="Preview"
                    className="object-cover mt-3 rounded-md h-32"
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
                className="px-4 py-2 text-white rounded bg-primary-600 hover:bg-primary-700"
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
