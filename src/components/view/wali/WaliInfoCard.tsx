"use client";

import React, { useEffect, useState } from "react";
import { Image, message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { API_WALI } from "@/lib/apiEndpoint";
import { useParams } from "next/navigation";
import Button from "@/components/ui/button/Button";
import camelcaseKeys from "camelcase-keys";
import { ApiResponseSingle } from "@/types/api-response";
import { InfoItem } from "../../helper/InfoItemHelper";
import { Wali } from "@/types/wali";
import Link from "next/link";

export default function WaliInfoCard() {
  const [data, setData] = useState<Wali | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomes = async () => {
      try {
        if (!id) return;
        const res = await fetchWithAuth(`${API_WALI}/${id}`);
        if (!res.ok) throw new Error("Failed to fetch wali details");
        const wali: ApiResponseSingle<Wali> = await res.json();
        const waliData = camelcaseKeys(wali.data, { deep: true }) as Wali;
        setData(waliData);
      } catch (error) {
        console.error("Error fetching wali details:", error);
        messageApi.error({
          content: "Gagal mengambil data wali.",
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
      {/* Wali */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-6">
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
                    {data?.relation || "Relasi tidak diketahui"}
                  </p>
                </div>
              </div>

              <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
                <Link href={`/wali/edit/${data?.id}`}>
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* ====== Detail Info Wali ====== */}
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              <InfoItem label="Nomor Telp" value={data?.waliPhone || "-"} />
              <InfoItem label="Hubungan" value={data?.relation || "-"} />
              <InfoItem label="Alamat" value={data?.waliAddress} />
              <InfoItem
                label="Koordinat Alamat"
                value={
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(
                      String(data?.addressCoordinate || "-")
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {data?.addressCoordinate || "-"}
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
            </div>
          </div>
        </>
      </div>
    </>
  );
}
