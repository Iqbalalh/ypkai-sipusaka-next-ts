"use client";

import React, { useEffect, useState } from "react";
import { Image, message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { API_HOMES_DETAILS } from "@/lib/apiEndpoint";
import { useParams } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import camelcaseKeys from "camelcase-keys";
import { ApiResponseSingle } from "@/types/api-response";
import { HomeDetail } from "@/types/home";
import { InfoItem } from "../../helper/InfoItemHelper";
import Link from "next/link";

export default function FamilyInfoCard() {
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState<HomeDetail | null>(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomes = async () => {
      try {
        if (!id) return;
        const res = await fetchWithAuth(`${API_HOMES_DETAILS}/${id}`);
        if (!res.ok) throw new Error("Failed to fetch home details");
        const home: ApiResponseSingle<HomeDetail> = await res.json();
        const homeData = camelcaseKeys(home.data, { deep: true }) as HomeDetail;
        setData(homeData);
      } catch (error) {
        console.error("Error fetching home details:", error);
        messageApi.error({
          content: "Gagal mengambil data keluarga.",
          key: "save",
          duration: 2,
        });
      } finally {
        setLoading(false);
      }
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
            <Badge>{data?.selectedRegionName || "Tidak ada data"}</Badge>
          </div>
        </h4>
        {/* <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <InfoItem label="ID" value={data?.homeId?.toString() || "-"} />
          <InfoItem
            label="Kode Pos"
            value={data?.homePostalCode || data?.selectedPostalCode || "-"}
          />
          <InfoItem
            label="Dibuat Pada"
            value={
              data?.homeCreatedAt
                ? new Date(data.homeCreatedAt).toLocaleString()
                : "-"
            }
          />
          <InfoItem
            label="Diperbarui Pada"
            value={
              data?.homeUpdatedAt
                ? new Date(data.homeUpdatedAt).toLocaleString()
                : "-"
            }
          />
        </div> */}
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
                src={data?.employeePict || "/images/user/alt-user.png"}
                alt={"Profile"}
              />
            </div>

            <div>
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {data?.employeeName} ({data?.employeeNipNipp})
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-md text-gray-500 dark:text-gray-400">
                  {data?.employeeGender === "M" ? "Laki-laki" : "Perempuan"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Badge>{data?.employeeIsAccident ? "PLH" : "Non-PLH"}</Badge>
                </p>
              </div>
            </div>

            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <Link href={`/employee/edit/${data?.employeeId}`}>
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
              value={data?.employeeIsAccident ? "Kecelakaan" : "Meninggal"}
            />
            <InfoItem
              label="Penyebab Kematian"
              value={data?.employeeDeathCause || "-"}
            />
            <InfoItem
              label="Posisi Terakhir"
              value={data?.employeeLastPosition || "-"}
            />
            <InfoItem label="Catatan" value={data?.employeeNotes || "-"} />
            {/* <InfoItem
              label="Wilayah"
              value={data?.employeeRegionName?.toString() || "-"}
            /> */}
            <InfoItem
              label="Dibuat Pada"
              value={
                data?.employeeCreatedAt
                  ? new Date(data.employeeCreatedAt).toLocaleString()
                  : "-"
              }
            />
            <InfoItem
              label="Diperbarui Pada"
              value={
                data?.employeeUpdatedAt
                  ? new Date(data.employeeUpdatedAt).toLocaleString()
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
          <div>{data?.isUmkm ? <Badge color="info">UMKM</Badge> : ""}</div>
        </h4>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image
                width={80}
                height={80}
                src={data?.partnerPict || "/images/user/alt-user.png"}
                alt={"Profile"}
              />
            </div>

            <div>
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {data?.partnerIsAlive == false ? "Alm. " : ""}
                {data?.partnerName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-md text-gray-500 dark:text-gray-400">
                  {data?.partnerJob || "Tidak Bekerja"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Badge color={data?.partnerIsActive ? "success" : "error"}>
                    {data?.partnerIsActive ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <Link href={`/partner/edit/${data?.partnerId}`}>
                <Button variant="outline">Edit</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ====== Detail Info ====== */}
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <InfoItem label="Alamat" value={data?.partnerAddress || ""} />
            <InfoItem label="NIK" value={data?.partnerNik || "-"} />
            <InfoItem
              label="Nomor Telp"
              value={
                data?.partnerPhoneNumber ? (
                  <a
                    href={`https://wa.me/${
                      data?.partnerPhoneNumber
                        ?.replace(/^\+?62/, "") // hapus +62 atau 62 di depan jika ada
                        ?.replace(/^0/, "") // hapus 0 di depan
                        ?.replace(/\D/g, "") // hapus karakter non-angka
                        ? `62${data.partnerPhoneNumber
                            .replace(/^\+?62/, "")
                            .replace(/^0/, "")
                            .replace(/\D/g, "")}`
                        : ""
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {data?.partnerPhoneNumber}
                  </a>
                ) : (
                  "-"
                )
              }
            />
            <InfoItem
              label="Nomor Telp Alt"
              value={data?.partnerPhoneNumberAlt || "-"}
            />
            {/* <InfoItem
              label="Status Aktif"
              value={data?.partnerIsActive ? "Aktif" : "Tidak Aktif"}
            /> */}
            <InfoItem
              label="Status Hidup"
              value={data?.partnerIsAlive ? "Hidup" : "Meninggal"}
            />
            {/* <InfoItem
              label="Wilayah ID"
              value={data?.partnerRegionName?.toString() || "-"}
            /> */}
            {/* <InfoItem
              label="Subdistrict ID"
              value={data?.partnerSubdistrictId?.toString() || "-"}
            /> */}
            <InfoItem
              label="Koordinat Rumah"
              value={
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(
                    String(data?.partnerHomeCoordinate || "-")
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {data?.partnerHomeCoordinate || "-"}
                </a>
              }
            />
            <InfoItem
              label="Dibuat Pada"
              value={
                data?.partnerCreatedAt
                  ? new Date(data.partnerCreatedAt).toLocaleString()
                  : "-"
              }
            />
            <InfoItem
              label="Diperbarui Pada"
              value={
                data?.partnerUpdatedAt
                  ? new Date(data.partnerUpdatedAt).toLocaleString()
                  : "-"
              }
            />
          </div>
        </div>
      </div>

      {/* Wali */}
      {data?.waliId && (
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
                    src={data?.waliPict || "/images/user/alt-user.png"}
                    alt={`Profile Wali ${data?.waliName || ""}`}
                  />
                </div>

                <div>
                  <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                    {data?.waliName}
                  </h4>
                  <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                    <p className="text-md text-gray-500 dark:text-gray-400">
                      {data?.waliRelation || "Relasi tidak diketahui"}
                    </p>
                    <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <Badge>
                        {data?.selectedRegionName || "Region tidak ada"}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
                  <Link href={`/wali/edit/${data?.waliId}`}>
                    <Button variant="outline">Edit</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* ====== Detail Info Wali ====== */}
            <div className="mt-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                <InfoItem label="Nomor Telp" value={data?.waliPhone || "-"} />
                <InfoItem label="Hubungan" value={data?.waliRelation || "-"} />
                <InfoItem label="Alamat" value={data?.waliAddress} />
                <InfoItem
                  label="Koordinat Alamat"
                  value={data?.waliAddressCoordinate || "-"}
                />
                <InfoItem
                  label="Dibuat Pada"
                  value={
                    data?.waliCreatedAt
                      ? new Date(data.waliCreatedAt).toLocaleString()
                      : "-"
                  }
                />
                <InfoItem
                  label="Diperbarui Pada"
                  value={
                    data?.waliUpdatedAt
                      ? new Date(data.waliUpdatedAt).toLocaleString()
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
          Anak Tertanggung ({data?.childrenData?.length || 0})
        </h4>
        {data?.childrenData && data.childrenData.length > 0 ? (
          data.childrenData.map((child, index) => (
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
