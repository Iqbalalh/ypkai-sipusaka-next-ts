/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Select, Input, message, Switch, Flex } from "antd";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { Family } from "@/types/home";
import { Option } from "@/components/form/Select";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  API_EMPLOYEES,
  API_HOMES,
  API_REGIONS,
  API_SUBDISTRICTS,
} from "@/lib/apiEndpoint";
import camelcaseKeys from "camelcase-keys";
import { Region } from "@/types/region";
import FileInput from "@/components/form/input/FileInput";
import { useRouter } from "next/navigation";
import { Children } from "@/types/children";
import { Subdistricts } from "@/types/subdistrict";
import { Employee } from "@/types/employee";

export default function CreateHome() {
  const [home, setHome] = useState({ regionId: null, postalCode: "" });
  const [messageApi, contextHolder] = message.useMessage();
  const [regions, setRegions] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<Option[]>([]);
  const [subdistricts, setSubdistricts] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [employeeMode, setEmployeeMode] = useState("existing");
  const [partnerMode, setPartnerMode] = useState("existing");
  const [waliMode, setWaliMode] = useState("none");
  const router = useRouter();
  const [children, setChildren] = useState<Children[]>([]);

  // ==============================================
  // FETCH REGIONS
  // ==============================================
  useEffect(() => {
    const loadData = async () => {
      const [regRes, empRes, subdRes] = await Promise.all([
        fetchWithAuth(API_REGIONS),
        fetchWithAuth(`${API_EMPLOYEES}/list`),
        fetchWithAuth(`${API_SUBDISTRICTS}`),
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

      setRegions(
        regionData.map((r: Region) => ({
          value: r.regionId,
          label: r.regionName,
        }))
      );

      setEmployees(
        employeeData.map((e: Employee) => ({
          value: e.id,
          label: `${e.employeeName}`,
        }))
      );

      setSubdistricts(
        subdistrictData.map((e: Subdistricts) => ({
          value: e.subdistrictId,
          label: `${e.subdistrictName}`,
        }))
      );

      setLoading(false);
    };

    loadData();
  }, []);

  const [form, setForm] = useState<Family>({
    id: null,
    partnerId: null,
    employeeId: null,
    waliId: null,
    regionId: null,
    postalCode: " ",
    employee: {
      nipNipp: "",
      employeeName: "",
      deathCause: "",
      regionId: null,
      lastPosition: "",
      employeeGender: "M",
      isAccident: false,
      employeePictFile: null,
    },
    partner: {
      partnerName: "",
      regionId: null,
      address: null,
      subdistrictId: null,
      postalCode: "",
      homeCoordinate: "",
      phoneNumberAlt: "",
      isActive: false,
      isAlive: false,
      partnerPictFile: null,
    },
    wali: {
      waliName: "",
      relation: null,
      waliAddress: null,
      addressCoordinate: null,
      waliPhone: null,
      waliPictFile: null,
    },
    childrens: [],
  });

  // ==============================================
  // camelCase → snake_case
  // ==============================================
  const toSnake = (str: string) =>
    str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

  // ==============================================
  // SUBMIT
  // ==============================================
  const handleSubmit = async () => {
    // ------------------------
    // VALIDASI MINIMAL
    // ------------------------
    if (!form.employee.nipNipp) {
      messageApi.error("NIP/NIPP wajib diisi.");
      return;
    }

    if (!form.employee.employeeName) {
      messageApi.error("Nama pegawai wajib diisi.");
      return;
    }

    if (!form.employee.regionId) {
      messageApi.error("Wilayah wajib diisi.");
      return;
    }

    if (!form.employee.employeeGender) {
      messageApi.error("Jenis kelamin wajib diisi.");
      return;
    }

    setLoading(true);

    messageApi.loading({
      content: "Membuat data keluarga...",
      key: "save",
      duration: 0,
    });

    try {
      const fd = new FormData();

      fd.append("region_id", String(home.regionId));
      fd.append("postal_code", home.postalCode ?? "");

      // ============================
      // 1. APPEND FIELD PARENT LEVEL
      // ============================
      Object.entries(form).forEach(([key]) => {
        if (
          key === "employee" ||
          key === "partner" ||
          key === "wali" ||
          key === "childrens"
        ) {
          return;
        }
      });

      // ============================
      // 2. APPEND EMPLOYEE FIELDS
      // ============================
      Object.entries(form.employee).forEach(([key, value]) => {
        if (key === "employeePictFile") return;
        if (value !== null && value !== undefined) {
          fd.append(`employee_${toSnake(key)}`, String(value));
        }
      });

      if (form.employee.employeePictFile) {
        fd.append("employee_pict", form.employee.employeePictFile);
      }

      // ============================
      // 3. APPEND PARTNER FIELDS
      // ============================
      Object.entries(form.partner).forEach(([key, value]) => {
        if (key === "partnerPictFile") return;
        if (value !== null && value !== undefined) {
          fd.append(`partner_${toSnake(key)}`, String(value));
        }
      });

      if (form.partner.partnerPictFile) {
        fd.append("partner_pict", form.partner.partnerPictFile);
      }

      // ============================
      // 4. APPEND WALI FIELDS
      // ============================
      Object.entries(form.wali).forEach(([key, value]) => {
        if (key === "waliPictFile") return;
        if (value !== null && value !== undefined) {
          fd.append(`wali_${toSnake(key)}`, String(value));
        }
      });

      if (form.wali.waliPictFile) {
        fd.append("wali_pict", form.wali.waliPictFile);
      }

      // ============================
      // 5. APPEND CHILDRENS[]
      // ============================
      (form.childrens ?? []).forEach((child, index) => {
        Object.entries(child).forEach(([key, value]) => {
          if (key === "childrenPictFile") return;

          if (value !== null && value !== undefined) {
            fd.append(`childrens[${index}][${toSnake(key)}]`, String(value));
          }
        });

        // File foto anak
        if (child.childrenPictFile) {
          fd.append(
            `childrens[${index}][children_pict]`,
            child.childrenPictFile
          );
        }
      });

      // ============================
      // 6. POST FORM DATA
      // ============================
      const res = await fetchWithAuth(API_HOMES, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Gagal membuat data keluarga");

      messageApi.success({
        content: "Data keluarga berhasil dibuat!",
        key: "save",
        duration: 2,
      });

      router.back();
    } catch (err) {
      console.error(err);
      messageApi.error({
        content: "Gagal membuat data keluarga.",
        key: "save",
        duration: 2,
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleUploadPhoto = (
    e: React.ChangeEvent<HTMLInputElement>,
    path: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) return;

    // update form
    setForm((prev) => {
      const updated = structuredClone(prev);
      const keys = path.split(".");
      let current: any = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = file;
      return updated;
    });
  };

  const updateEmployee = <K extends keyof Family["employee"]>(
    key: K,
    value: Family["employee"][K]
  ) => {
    setForm((prev) => ({
      ...prev,
      employee: {
        ...prev.employee,
        [key]: value,
      },
    }));
  };

  const updatePartner = <K extends keyof Family["partner"]>(
    key: K,
    value: Family["partner"][K]
  ) => {
    setForm((prev) => ({
      ...prev,
      partner: {
        ...prev.partner,
        [key]: value,
      },
    }));
  };

  const updateWali = <K extends keyof Family["wali"]>(
    key: K,
    value: Family["wali"][K]
  ) => {
    setForm((prev) => ({
      ...prev,
      wali: {
        ...prev.wali,
        [key]: value,
      },
    }));
  };

  const updateChild = (i: number, patch: Partial<Children>) => {
    setChildren((prev) => {
      const updated = [...prev];

      updated[i] = {
        ...updated[i],
        ...patch,
      };

      return updated;
    });
  };

  const addChild = () => {
    setChildren((prev) => [
      ...prev,
      {
        childrenName: "",
        notes: "",
        childrenGender: "M",
        isActive: false,
        childrenBirthdate: null,
        childrenAddress: null,
        childrenPhone: null,
        isFatherAlive: false,
        isMotherAlive: false,
        isCondition: false,
        childrenPictFile: null,
        index: 0,
      },
    ]);
  };

  const removeChild = (index: number) => {
    const arr = [...children];
    arr.splice(index, 1);
    setChildren(arr);
  };

  const handleUploadChildPhoto = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0] ?? null;

    updateChild(index, { childrenPictFile: file });
  };

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* HOME GROUP */}
      <ComponentCard title="Home">
        <div className="space-y-4">
          <div>
            <Label>Wilayah *</Label>
            <Select
              value={home.regionId}
              options={regions}
              size="large"
              className="w-full"
              onChange={(value) => setHome({ ...home, regionId: value })}
            />
          </div>
          <div>
            <Label>Kode Pos</Label>
            <Input
              size="large"
              value={home.postalCode}
              onChange={(e) => setHome({ ...home, postalCode: e.target.value })}
            />
          </div>
        </div>
      </ComponentCard>

      {/* EMPLOYEE GROUP */}
      <ComponentCard
        title="Pegawai (Wajib)"
        rightComponent={
          <Switch
            checked={employeeMode === "new"}
            onChange={(checked) =>
              setEmployeeMode(checked ? "new" : "existing")
            }
            checkedChildren="Buat Baru"
            unCheckedChildren="Sudah Ada"
          />
        }
      >
        <div>
          {employeeMode === "existing" ? (
            <div>
              <Label>Pilih Employee *</Label>
              <Select size="large" className="w-full" options={employees} />
            </div>
          ) : (
            <div className="space-y-6">
              {/* NIP */}
              <div>
                <Label>NIP / NIPP *</Label>
                <Input
                  className="w-full"
                  size="large"
                  type="number"
                  required
                  value={form.employee.nipNipp}
                  onChange={(e) => updateEmployee("nipNipp", e.target.value)}
                />
              </div>

              {/* Name */}
              <div>
                <Label>Nama Pegawai *</Label>
                <Input
                  className="w-full"
                  size="large"
                  required
                  value={form.employee.employeeName}
                  onChange={(e) =>
                    updateEmployee("employeeName", e.target.value)
                  }
                />
              </div>

              {/* Death Cause */}
              <div>
                <Label>Penyebab Kematian</Label>
                <Input
                  className="w-full"
                  size="large"
                  value={form.employee.deathCause}
                  onChange={(e) => updateEmployee("deathCause", e.target.value)}
                />
              </div>

              {/* Last Position */}
              <div>
                <Label>Posisi Terakhir</Label>
                <Input
                  className="w-full"
                  size="large"
                  value={form.employee.lastPosition}
                  onChange={(e) =>
                    updateEmployee("lastPosition", e.target.value)
                  }
                />
              </div>

              {/* Region */}
              <div>
                <Label>Wilayah *</Label>
                <Select
                  className="w-full"
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  options={regions}
                  value={form.employee.regionId ?? undefined}
                  onChange={(value) => updateEmployee("regionId", value)}
                />
              </div>

              {/* Gender */}
              <div>
                <Label>Jenis Kelamin *</Label>
                <Select
                  className="w-full"
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  options={[
                    { value: "F", label: "Perempuan" },
                    { value: "M", label: "Laki-laki" },
                  ]}
                  value={form.employee.employeeGender ?? "M"}
                  onChange={(value) => updateEmployee("employeeGender", value)}
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
                  value={form.employee.isAccident}
                  onChange={(value) => updateEmployee("isAccident", value)}
                />
              </div>

              {/* Notes */}
              <div>
                <Label>Catatan</Label>
                <TextArea
                  size="large"
                  rows={4}
                  value={form.employee.notes}
                  onChange={(e) => updateEmployee("notes", e.target.value)}
                />
              </div>

              {/* Foto */}
              <div>
                <Label>Foto Pegawai</Label>
                <FileInput
                  onChange={(e) =>
                    handleUploadPhoto(e, "employee.employeePictFile")
                  }
                />
              </div>
            </div>
          )}
        </div>
      </ComponentCard>

      {/* PARTNER GROUP */}
      <ComponentCard
        title="Partner (Wajib)"
        rightComponent={
          <Switch
            checked={partnerMode === "new"}
            onChange={(checked) => setPartnerMode(checked ? "new" : "existing")}
            checkedChildren="Buat Baru"
            unCheckedChildren="Sudah Ada"
          />
        }
      >
        <div className="space-y-4">
          {partnerMode === "existing" ? (
            <div>
              <Label>Pilih Partner *</Label>
              <Select size="large" style={{ width: "100%" }} />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Nama Pasangan *</Label>
                <Input
                  className="w-full"
                  size="large"
                  value={form?.partner.partnerName}
                  onChange={(e) => updatePartner("partnerName", e.target.value)}
                />
              </div>

              <div>
                <Label>Pekerjaan</Label>
                <Input
                  className="w-full"
                  size="large"
                  value={form.partner.partnerJob}
                  onChange={(e) => updatePartner("partnerJob", e.target.value)}
                />
              </div>

              <div>
                <Label>NIK</Label>
                <Input
                  className="w-full"
                  size="large"
                  value={form.partner.partnerNik}
                  onChange={(e) => updatePartner("partnerNik", e.target.value)}
                />
              </div>

              <div>
                <Label>Alamat *</Label>
                <TextArea
                  size="large"
                  value={form.partner.address}
                  rows={4}
                  onChange={(e) => updatePartner("address", e.target.value)}
                />
              </div>

              <div>
                <Label>Nomor Telepon *</Label>
                <Input
                  className="w-full"
                  size="large"
                  value={form.partner.phoneNumber}
                  onChange={(e) => updatePartner("phoneNumber", e.target.value)}
                />
              </div>

              <div>
                <Label>Nomor Telepon Alternatif</Label>
                <Input
                  className="w-full"
                  size="large"
                  type="number"
                  value={form.partner.phoneNumberAlt}
                  onChange={(e) =>
                    updatePartner("phoneNumberAlt", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Wilayah *</Label>
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
                  options={regions}
                  value={form.partner.regionId}
                  onChange={(v: number) =>
                    setForm({
                      ...form,
                      partner: { ...form.partner, regionId: v },
                    })
                  }
                />
              </div>

              <div>
                <Label>Kecamatan *</Label>
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
                  options={subdistricts}
                  value={form.partner.subdistrictId}
                  onChange={(v: number) =>
                    setForm({
                      ...form,
                      partner: { ...form.partner, subdistrictId: v },
                    })
                  }
                />
              </div>

              <div>
                <Label>Kode Pos</Label>
                <Input
                  className="w-full"
                  size="large"
                  value={form.partner.postalCode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      partner: { ...form.partner, postalCode: e.target.value },
                    })
                  }
                />
              </div>

              <div>
                <Label>Koordinat Rumah *</Label>
                <Input
                  className="w-full"
                  size="large"
                  value={form.partner.homeCoordinate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      partner: {
                        ...form.partner,
                        homeCoordinate: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div>
                <Label>Status Aktif *</Label>
                <Select
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="w-full"
                  size="large"
                  options={[
                    { value: true, label: "Aktif" },
                    { value: false, label: "Tidak Aktif" },
                  ]}
                  value={form.partner.isActive}
                  onChange={(v: boolean) =>
                    setForm({
                      ...form,
                      partner: { ...form.partner, isActive: v },
                    })
                  }
                />
              </div>

              <div>
                <Label>Status Hidup *</Label>
                <Select
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="w-full"
                  size="large"
                  options={[
                    { value: true, label: "Hidup" },
                    { value: false, label: "Meninggal" },
                  ]}
                  value={form.partner.isAlive}
                  onChange={(v: boolean) =>
                    setForm({
                      ...form,
                      partner: { ...form.partner, isAlive: v },
                    })
                  }
                />
              </div>

              {/* Foto */}
              <div>
                <Label>Foto Pasangan</Label>
                <FileInput
                  onChange={(e) =>
                    handleUploadPhoto(e, "partner.partnerPictFile")
                  }
                />
              </div>
            </div>
          )}
        </div>
      </ComponentCard>

      {/* WALI GROUP */}
      <ComponentCard
        title="Wali (Opsional)"
        rightComponent={
          <Select
            className="w-40"
            value={waliMode}
            onChange={setWaliMode}
            variant="underlined"
            options={[
              { label: "Tidak Ada", value: "none" },
              { label: "Sudah Ada", value: "existing" },
              { label: "Buat Baru", value: "new" },
            ]}
          />
        }
      >
        <div className="space-y-4">
          {waliMode === "existing" && (
            <div>
              <Label>Pilih Wali</Label>
              <Select size="large" />
            </div>
          )}

          {waliMode === "new" && (
            <div className="space-y-4">
              <div>
                <Label>Nama Wali</Label>
                <Input
                  size="large"
                  value={form.wali.waliName}
                  onChange={(e) => updateWali("waliName", e.target.value)}
                />
              </div>

              <div>
                <Label>Hubungan</Label>
                <Input
                  size="large"
                  value={form.wali.relation ?? ""}
                  onChange={(e) => updateWali("relation", e.target.value)}
                />
              </div>

              <div>
                <Label>Alamat Wali</Label>
                <TextArea
                  rows={3}
                  size="large"
                  value={form.wali.waliAddress ?? ""}
                  onChange={(e) => updateWali("waliAddress", e.target.value)}
                />
              </div>

              <div>
                <Label>No. Telepon Wali</Label>
                <Input
                  size="large"
                  value={form.wali.waliPhone ?? ""}
                  onChange={(e) => updateWali("waliPhone", e.target.value)}
                />
              </div>

              <div>
                <Label>Koordinat Alamat</Label>
                <Input
                  size="large"
                  value={form.wali.addressCoordinate ?? ""}
                  onChange={(e) =>
                    updateWali("addressCoordinate", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Foto Wali</Label>
                <FileInput
                  onChange={(e) => handleUploadPhoto(e, "wali.waliPictFile")}
                />
              </div>
            </div>
          )}
        </div>
      </ComponentCard>

      {/* CHILDREN GROUP */}
      <ComponentCard title="Children">
        <div className="space-y-4">
          <Button onClick={addChild}>Tambah Anak</Button>

          {children.map((child, index) => (
            <div key={index} className="border p-4 rounded space-y-3">
              <Flex justify="space-between" align="center">
                <strong>Anak #{index + 1}</strong>
                <Button onClick={() => removeChild(index)}>Hapus</Button>
              </Flex>

              <Label>Nama Anak</Label>
              <Input
                size="large"
                value={child.childrenName}
                onChange={(e) =>
                  updateChild(index, { childrenName: e.target.value })
                }
              />

              <Label>Anak-ke</Label>
              <Input
                size="large"
                type="number"
                value={child.index ?? ""}
                onChange={(e) =>
                  updateChild(index, { index: parseInt(e.target.value, 10) })
                }
              />

              <Label>Gender</Label>
              <Select
                size="large"
                value={child.childrenGender}
                options={[
                  { label: "Laki-laki", value: "M" },
                  { label: "Perempuan", value: "F" },
                ]}
                onChange={(v) => updateChild(index, { childrenGender: v })}
              />

              <Label>Tanggal Lahir</Label>
              <Input
                type="date"
                size="large"
                value={child.childrenBirthdate ?? ""}
                onChange={(e) =>
                  updateChild(index, { childrenBirthdate: e.target.value })
                }
              />

              <Label>Alamat Anak</Label>
              <Input
                size="large"
                value={child.childrenAddress ?? ""}
                onChange={(e) =>
                  updateChild(index, { childrenAddress: e.target.value })
                }
              />

              <Label>No. HP Anak</Label>
              <Input
                size="large"
                value={child.childrenPhone ?? ""}
                onChange={(e) =>
                  updateChild(index, { childrenPhone: e.target.value })
                }
              />

              <Label>Ayah Masih Hidup?</Label>
              <Select
                size="large"
                value={child.isFatherAlive}
                options={[
                  { label: "Ya", value: true },
                  { label: "Tidak", value: false },
                ]}
                onChange={(v) => updateChild(index, { isFatherAlive: v })}
              />

              <Label>Ibu Masih Hidup?</Label>
              <Select
                size="large"
                value={child.isMotherAlive}
                options={[
                  { label: "Ya", value: true },
                  { label: "Tidak", value: false },
                ]}
                onChange={(v) => updateChild(index, { isMotherAlive: v })}
              />

              <Label>Kondisi Khusus?</Label>
              <Select
                size="large"
                value={child.isCondition}
                options={[
                  { label: "Normal", value: true },
                  { label: "ABK", value: false },
                ]}
                onChange={(v) => updateChild(index, { isCondition: v })}
              />

              <Label>Catatan</Label>
              <TextArea
                rows={2}
                value={child.notes}
                onChange={(e) => updateChild(index, { notes: e.target.value })}
              />

              <Label>Foto Anak</Label>
              <Input
                size="large"
                type="file"
                onChange={(e) => handleUploadChildPhoto(e, index)}
              />
            </div>
          ))}
        </div>
      </ComponentCard>

      <div className="grid grid-cols-2 gap-8">
        <Button
          className="bg-gray-500 text-white"
          onClick={() => router.back()}
          type="reset"
        >
          Kembali
        </Button>

        <Button
          disabled={loading}
          onClick={() => {
            handleSubmit();
          }}
          variant="primary"
          className="w-full"
        >
          Simpan Home
        </Button>
      </div>
    </div>
  );
}
