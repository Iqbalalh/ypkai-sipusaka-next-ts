"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Image, message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { API_UMKM } from "@/lib/apiEndpoint";
import { useParams } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";
import camelcaseKeys from "camelcase-keys";
import { ApiResponseSingle } from "@/types/api-response";
import { InfoItem } from "../../helper/InfoItemHelper";
import Link from "next/link";
import { Umkm } from "@/types/umkm";

export default function UmkmInfoCard() {
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState<Umkm | null>(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUmkm = async () => {
      try {
        if (!id) return;
        const res = await fetchWithAuth(`${API_UMKM}/${id}`);
        if (!res.ok) throw new Error("Failed to fetch UMKM details");

        const umkm: ApiResponseSingle<Umkm> = await res.json();

        const umkmData = camelcaseKeys(umkm.data, { deep: true }) as Umkm;
        setData(umkmData);
      } catch (error) {
        console.error("Error fetching UMKM details:", error);
        messageApi.error({
          content: "Gagal mengambil data UMKM.",
          key: "save",
          duration: 2,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUmkm();
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

      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image
                width={80}
                height={80}
                src={data?.pi || "/images/user/alt-user.png"}
                alt="Logo UMKM"
              />
            </div>

            <div>
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {data?.businessName}
              </h4>

              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-md text-gray-500 dark:text-gray-400">
                  {data?.businessType || "Jenis Usaha Tidak Tersedia"}
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
              <Link href={`/umkm/edit/${data?.id}`}>
                <Button variant="outline">Edit</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ============ Detail UMKM ============ */}
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">

            <InfoItem label="Nama Usaha" value={data?.businessName || "-"} />
            <InfoItem label="Nama Pemilik" value={data?.ownerName || "-"} />
            <InfoItem label="NIB" value={data?.nib || "-"} />
            <InfoItem label="Jenis Usaha" value={data?.businessType || "-"} />

            <InfoItem 
              label="Alamat" 
              value={data?.address || "-"} 
            />

            {/* Link ke WA */}
            <InfoItem
              label="Nomor Telp"
              value={
                data?.phoneNumber ? (
                  <a
                    href={`https://wa.me/${data.phoneNumber
                      .replace(/^\+?62/, "")
                      .replace(/^0/, "")
                      .replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {data?.phoneNumber}
                  </a>
                ) : (
                  "-"
                )
              }
            />

            {/* Maps link */}
            <InfoItem
              label="Koordinat Lokasi"
              value={
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(
                    String(data?.locationCoordinate || "-")
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {data?.locationCoordinate || "-"}
                </a>
              }
            />

            <InfoItem
              label="Wilayah ID"
              value={data?.regionId?.toString() || "-"}
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

            <InfoItem label="Catatan" value={data?.notes || "-"} />
          </div>
        </div>
      </div>
    </>
  );
}
