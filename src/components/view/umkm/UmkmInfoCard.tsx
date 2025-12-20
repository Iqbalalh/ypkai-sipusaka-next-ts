"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Image, message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { API_UMKM } from "@/lib/apiEndpoint";
import { useParams } from "next/navigation";
import { InfoItem } from "../../helper/InfoItemHelper";
import Link from "next/link";
import { Umkm } from "@/types/umkm";
import { fetchDataInfo } from "@/lib/fetchDataInfo";

export default function UmkmInfoCard() {
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState<Umkm | null>(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUmkm = async () => {
      if (!id) return;
      fetchDataInfo<Umkm>({
        url: `${API_UMKM}/${id}`,
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
        {/* Header */}
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            {/* Picture */}

            {/* Name */}
            <div>
              <div className="w-full flex overflow-hidden">
                <Image
                  width={500}
                  height={200}
                  src={data?.umkmPict || "/images/user/alt-user.png"}
                  alt="UMKM"
                />
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <Link href={`/umkm/edit/${data?.id}`}>
                <Button variant="outline">Edit</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ====== Detail Info ====== */}
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <InfoItem label="Nama Pemilik" value={data?.ownerName || "-"} />
            <InfoItem
              label="Relasi"
              value={
                data?.partnerId ? "Pasangan" : data?.waliId ? "Wali" : "Anak"
              }
            />
            <InfoItem label="Nama Usaha" value={data?.businessName || "-"} />
            <InfoItem
              label="Alamat Usaha"
              value={data?.businessAddress || "-"}
            />
            <InfoItem label="Jenis Usaha" value={data?.businessType || "-"} />
            <InfoItem label="Produk" value={data?.products || "-"} />

            <InfoItem
              label="Region ID"
              value={data?.regionId?.toString() || "-"}
            />
            <InfoItem
              label="Subdistrict ID"
              value={data?.subdistrictId?.toString() || "-"}
            />
            <InfoItem label="Kode Pos" value={data?.postalCode || "-"} />

            <InfoItem
              label="Koordinat UMKM"
              value={
                data?.umkmCoordinate ? (
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(
                      String(data?.umkmCoordinate)
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {data?.umkmCoordinate}
                  </a>
                ) : (
                  "-"
                )
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
          </div>
        </div>
      </div>
    </>
  );
}
