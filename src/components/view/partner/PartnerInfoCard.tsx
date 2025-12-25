"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Image, message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { API_IMAGE, API_PARTNERS } from "@/lib/apiEndpoint";
import { useParams } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";
import { InfoItem } from "../../helper/InfoItemHelper";
import Link from "next/link";
import { Partner } from "@/types/partner";
import { fetchDataInfo } from "@/lib/fetchDataInfo";
import { extractKeyFromPresignedUrl } from "@/lib/extractKeyFromPresignedUrl";
import { handlePrintPartner } from "@/lib/pdf-modules/partner.pdf";

export default function PartnerInfoCard() {
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState<Partner | null>(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartner = async () => {
      if (!id) return;
      fetchDataInfo<Partner>({
        url: `${API_PARTNERS}/${id}`,
        onSuccess: setData,
        setLoading,
        errorMessage: "Gagal mengambil data.",
        onErrorPopup: (msg: string) =>
          messageApi.error({
            content: msg,
            key: "fetch",
            duration: 2,
          }),
      });
    };

    fetchPartner();
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
      {/* Partner */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
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
              <h4 className="mb-2 text-lg flex items-center font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {data?.isAlive == false ? "Alm. " : ""}
                {data?.partnerName}{" "}
                <div className="m-4">
                  {data?.isUmkm ? <Badge color="info">UMKM</Badge> : ""}
                </div>
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-md text-gray-500 dark:text-gray-400">
                  {data?.partnerJob || "Tidak Bekerja"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Badge color={data?.isActive ? "success" : "error"}>
                    {data?.isActive ? "Aktif" : "Tidak Aktif"}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <Button
                variant="outline"
                onClick={() =>
                  handlePrintPartner(
                    data,
                    `${API_IMAGE}/?keyObject=${extractKeyFromPresignedUrl(
                      data?.partnerPict
                    )}`
                  )
                }
              >
                Print
              </Button>
              <Link href={`/partner/edit/${data?.id}`}>
                <Button variant="outline">Edit</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ====== Detail Info ====== */}
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <InfoItem label="Alamat" value={data?.address || ""} />
            <InfoItem label="NIK" value={data?.partnerNik || "-"} />
            <InfoItem
              label="Nomor Telp"
              value={
                data?.phoneNumber ? (
                  <Link
                    href={`https://wa.me/${
                      data?.phoneNumber
                        ?.replace(/^\+?62/, "") // hapus +62 atau 62 di depan jika ada
                        ?.replace(/^0/, "") // hapus 0 di depan
                        ?.replace(/\D/g, "") // hapus karakter non-angka
                        ? `62${data.phoneNumber
                            .replace(/^\+?62/, "")
                            .replace(/^0/, "")
                            .replace(/\D/g, "")}`
                        : ""
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {data?.phoneNumber}
                  </Link>
                ) : (
                  "-"
                )
              }
            />
            <InfoItem
              label="Nomor Telp Alt"
              value={data?.phoneNumberAlt || "-"}
            />
            <InfoItem
              label="Status Aktif"
              value={data?.isActive ? "Aktif" : "Tidak Aktif"}
            />
            <InfoItem
              label="Status Hidup"
              value={data?.isAlive ? "Hidup" : "Meninggal"}
            />
            <InfoItem
              label="Wilayah"
              value={data?.regionName?.toString() || "-"}
            />
            <InfoItem
              label="Kecamatan"
              value={data?.subdistrictId?.toString() || "-"}
            />
            <InfoItem
              label="Koordinat Rumah"
              value={
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(
                    String(data?.homeCoordinate || "-")
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {data?.homeCoordinate || "-"}
                </a>
              }
            />
            <InfoItem
              label="Dibuat Pada"
              value={
                data?.createdAt
                  ? new Date(data.createdAt).toLocaleString()
                  : "-"
              }
            />
            <InfoItem
              label="Diperbarui Pada"
              value={
                data?.updatedAt
                  ? new Date(data.updatedAt).toLocaleString()
                  : "-"
              }
            />
            <InfoItem label="Catatan" value={data?.partnerJob || "-"} />
          </div>
        </div>
      </div>
    </>
  );
}
