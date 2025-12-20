"use client";

import React, { useEffect, useState } from "react";
import { Image, message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { API_HOMES } from "@/lib/apiEndpoint";
import { useParams } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { HomeDetails } from "@/types/home";
import { InfoItem } from "../../helper/InfoItemHelper";
import Link from "next/link";
import { fetchDataInfo } from "@/lib/fetchDataInfo";

export default function FamilyInfoCard() {
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState<HomeDetails | null>(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomes = async () => {
      if (!id) return;
      fetchDataInfo<HomeDetails>({
        url: `${API_HOMES}/detail/${id}`,
        onSuccess: setData,
        setLoading,
        errorMessage: "Gagal mengambil data.",
        onErrorPopup: (msg) =>
          messageApi.error({
            content: msg,
            key: "fetch",
            duration: 2,
          }),
      });
    };

    fetchHomes();
  }, [id, messageApi]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      {/* Home Info */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mb-6">
        <h4 className="text-2xl gap-4 flex font-semibold text-gray-800 dark:text-white/90">
          Data Keluarga{" "}
          <div>
            <Badge>
              {data?.homeDetails.selectedRegionName || "Tidak ada data"}
            </Badge>
          </div>
        </h4>
      </div>

      {/* Employee */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-4">
          Pegawai
        </h4>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image
                width={80}
                height={80}
                src={
                  data?.homeDetails.employee.employeePict ||
                  "/images/user/alt-user.png"
                }
                alt={"Profile"}
              />
            </div>

            <div>
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {data?.homeDetails.employee.employeeName} (
                {data?.homeDetails.employee.nipNipp})
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-md text-gray-500 dark:text-gray-400">
                  {data?.homeDetails.employee.employeeGender === "M"
                    ? "Laki-laki"
                    : "Perempuan"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Badge>
                    {data?.homeDetails.employee.isAccident ? "PLH" : "Non-PLH"}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <Link href={`/employee/edit/${data?.homeDetails.employeeId}`}>
                <Button variant="outline">Edit</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ====== Detail Info ====== */}
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <InfoItem
              label="Kecelakaan/Meninggal"
              value={
                data?.homeDetails.employee.isAccident
                  ? "Kecelakaan"
                  : "Meninggal"
              }
            />
            <InfoItem
              label="Penyebab Kematian"
              value={data?.homeDetails.employee.deathCause || "-"}
            />
            <InfoItem
              label="Posisi Terakhir"
              value={data?.homeDetails.employee.lastPosition || "-"}
            />
            <InfoItem
              label="Catatan"
              value={data?.homeDetails.employee.notes || "-"}
            />
            {/* <InfoItem
              label="Wilayah"
              value={data?.homeDetails.employeeRegionName?.toString() || "-"}
            /> */}
            <InfoItem
              label="Dibuat Pada"
              value={
                data?.homeDetails.employee.createdAt
                  ? new Date(
                      data.homeDetails.employee.createdAt
                    ).toLocaleString()
                  : "-"
              }
            />
            <InfoItem
              label="Diperbarui Pada"
              value={
                data?.homeDetails.employee.updatedAt
                  ? new Date(
                      data.homeDetails.employee.updatedAt
                    ).toLocaleString()
                  : "-"
              }
            />
          </div>
        </div>
      </div>

      {/* Partner */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <h4 className="text-2xl font-semibold flex text-gray-800 dark:text-white/90 mb-4 gap-4">
          Pasangan{" "}
          <div>
            {data?.homeDetails.partner.isUmkm ? (
              <Badge color="info">UMKM</Badge>
            ) : (
              ""
            )}
          </div>
        </h4>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image
                width={80}
                height={80}
                src={
                  data?.homeDetails.partner.partnerPict ||
                  "/images/user/alt-user.png"
                }
                alt={"Profile"}
              />
            </div>

            <div>
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {data?.homeDetails.partner.isAlive == false ? "Alm. " : ""}
                {data?.homeDetails.partner.partnerName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-md text-gray-500 dark:text-gray-400">
                  {data?.homeDetails.partner.partnerJob || "Tidak Bekerja"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Badge
                    color={
                      data?.homeDetails.partner.isActive ? "success" : "error"
                    }
                  >
                    {data?.homeDetails.partner.isActive
                      ? "Aktif"
                      : "Tidak Aktif"}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <Link href={`/partner/edit/${data?.homeDetails.partnerId}`}>
                <Button variant="outline">Edit</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ====== Detail Info ====== */}
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <InfoItem
              label="Alamat"
              value={data?.homeDetails.partner.address || ""}
            />
            <InfoItem
              label="NIK"
              value={data?.homeDetails.partner.partnerNik || "-"}
            />
            <InfoItem
              label="Nomor Telp"
              value={
                data?.homeDetails.partner.phoneNumber ? (
                  <a
                    href={`https://wa.me/${
                      data?.homeDetails.partner.phoneNumber
                        ?.replace(/^\+?62/, "") // hapus +62 atau 62 di depan jika ada
                        ?.replace(/^0/, "") // hapus 0 di depan
                        ?.replace(/\D/g, "") // hapus karakter non-angka
                        ? `62${data.homeDetails.partner.phoneNumber
                            .replace(/^\+?62/, "")
                            .replace(/^0/, "")
                            .replace(/\D/g, "")}`
                        : ""
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {data?.homeDetails.partner.phoneNumber}
                  </a>
                ) : (
                  "-"
                )
              }
            />
            <InfoItem
              label="Nomor Telp Alt"
              value={data?.homeDetails.partner.phoneNumberAlt || "-"}
            />
            {/* <InfoItem
              label="Status Aktif"
              value={data?.homeDetails.partnerIsActive ? "Aktif" : "Tidak Aktif"}
            /> */}
            <InfoItem
              label="Status Hidup"
              value={data?.homeDetails.partner.isAlive ? "Hidup" : "Meninggal"}
            />
            {/* <InfoItem
              label="Wilayah ID"
              value={data?.homeDetails.partnerRegionName?.toString() || "-"}
            /> */}
            {/* <InfoItem
              label="Subdistrict ID"
              value={data?.homeDetails.partnerSubdistrictId?.toString() || "-"}
            /> */}
            <InfoItem
              label="Koordinat Rumah"
              value={
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(
                    String(data?.homeDetails.partner.homeCoordinate || "-")
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {data?.homeDetails.partner.homeCoordinate || "-"}
                </a>
              }
            />
            <InfoItem
              label="Dibuat Pada"
              value={
                data?.homeDetails.partner.createdAt
                  ? new Date(
                      data.homeDetails.partner.createdAt
                    ).toLocaleString()
                  : "-"
              }
            />
            <InfoItem
              label="Diperbarui Pada"
              value={
                data?.homeDetails.partner.updatedAt
                  ? new Date(
                      data.homeDetails.partner.updatedAt
                    ).toLocaleString()
                  : "-"
              }
            />
          </div>
        </div>
      </div>

      {/* Wali */}
      {data?.homeDetails.waliId && (
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-6">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Wali
          </h4>

          <>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                  <Image
                    width={80}
                    height={80}
                    src={
                      data?.homeDetails.wali.waliPict ||
                      "/images/user/alt-user.png"
                    }
                    alt={`Profile Wali ${
                      data?.homeDetails.wali.waliName || ""
                    }`}
                  />
                </div>

                <div>
                  <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                    {data?.homeDetails.wali.waliName}
                  </h4>
                  <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                    <p className="text-md text-gray-500 dark:text-gray-400">
                      {data?.homeDetails.wali.relation ||
                        "Relasi tidak diketahui"}
                    </p>
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <Badge>
                        {data?.homeDetails.selectedRegionName ||
                          "Region tidak ada"}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
                  <Link href={`/wali/edit/${data?.homeDetails.waliId}`}>
                    <Button variant="outline">Edit</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* ====== Detail Info Wali ====== */}
            <div className="mt-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                <InfoItem
                  label="Nomor Telp"
                  value={data?.homeDetails.wali.waliPhone || "-"}
                />
                <InfoItem
                  label="Hubungan"
                  value={data?.homeDetails.wali.relation || "-"}
                />
                <InfoItem
                  label="Alamat"
                  value={data?.homeDetails.wali.waliAddress}
                />
                <InfoItem
                  label="Koordinat Alamat"
                  value={data?.homeDetails.wali.addressCoordinate || "-"}
                />
                <InfoItem
                  label="Dibuat Pada"
                  value={
                    data?.homeDetails.wali.createdAt
                      ? new Date(
                          data.homeDetails.wali.createdAt
                        ).toLocaleString()
                      : "-"
                  }
                />
                <InfoItem
                  label="Diperbarui Pada"
                  value={
                    data?.homeDetails.wali.updatedAt
                      ? new Date(
                          data.homeDetails.wali.updatedAt
                        ).toLocaleString()
                      : "-"
                  }
                />
              </div>
            </div>
          </>
        </div>
      )}

      {/* Children List */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-6">
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-4">
          Anak Tertanggung ({data?.homeDetails.childrens?.length || 0})
        </h4>
        {data?.homeDetails.childrens &&
        data.homeDetails.childrens.length > 0 ? (
          data.homeDetails.childrens.map((child, index) => (
            <div
              key={child.id || index}
              className={`border-t border-gray-200 dark:border-gray-700 py-4 ${
                index > 0 ? "mt-2" : ""
              }`}
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                  <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                    <Image
                      width={80}
                      height={80}
                      src={child.childrenPict || "/images/user/alt-user.png"}
                      alt={`Profile ${child.childrenName}`}
                    />
                  </div>

                  <div>
                    <div className="flex">
                      <h5 className="text-lg flex font-semibold text-gray-800 dark:text-white/90 mb-3">
                        {child.childrenName}
                      </h5>
                    </div>

                    <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                      <p className="text-md text-gray-500 dark:text-gray-400">
                        {child.childrenGender === "M"
                          ? "Laki-laki"
                          : child.childrenGender === "F"
                          ? "Perempuan"
                          : "-"}
                      </p>
                      <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <Badge color={child.isActive ? "success" : "error"}>
                          {child.isActive ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </p>

                      {!child.isCondition ? (
                        <>
                          <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                          <Badge size="sm" color="warning">
                            ABK
                          </Badge>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
                    <Link href={`/children/edit/${child.id}`}>
                      <Button variant="outline">Edit</Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* ====== Detail Info Anak ====== */}
              <div className="mt-2">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                  <InfoItem
                    label="Tanggal Lahir"
                    value={child?.childrenBirthdate || "-"}
                  />
                  <InfoItem label="NIK" value={child?.nik || "-"} />
                  <InfoItem
                    label="Pekerjaan"
                    value={child?.childrenJob || "-"}
                  />
                  <InfoItem
                    label="Alamat"
                    value={child?.childrenAddress || "-"}
                  />
                  <InfoItem
                    label="Nomor Telp"
                    value={child?.childrenPhone || "-"}
                  />
                  <InfoItem
                    label="Anak Ke"
                    value={child?.index?.toString() || "-"}
                  />
                  <InfoItem
                    label="Dibuat Pada"
                    value={
                      child?.createdAt
                        ? new Date(child.createdAt).toLocaleString()
                        : "-"
                    }
                  />
                  <InfoItem
                    label="Diperbarui Pada"
                    value={
                      child?.updatedAt
                        ? new Date(child.updatedAt).toLocaleString()
                        : "-"
                    }
                  />

                  <InfoItem label="Catatan" value={child?.notes || "-"} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Tidak ada data anak yang tercatat.
          </p>
        )}
      </div>
    </>
  );
}
