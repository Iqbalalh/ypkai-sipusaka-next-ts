"use client";

import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Image, message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { API_EMPLOYEES } from "@/lib/apiEndpoint";
import { useParams } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";
import { InfoItem } from "../../helper/InfoItemHelper";
import Link from "next/link";
import { Employee } from "@/types/employee";
import { fetchDataInfo } from "@/lib/fetchDataInfo";

export default function EmployeeInfoCard() {
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState<Employee | null>(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomes = async () => {
      if (!id) return;
      fetchDataInfo<Employee>({
        url: `${API_EMPLOYEES}/${id}`,
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
      {/* Employee */}
      {contextHolder}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
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
                {data?.employeeName} ({data?.nipNipp})
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-md text-gray-500 dark:text-gray-400">
                  {data?.employeeGender === "M" ? "Laki-laki" : "Perempuan"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <Badge>{data?.isAccident ? "PLH" : "Non-PLH"}</Badge>
                </p>
              </div>
            </div>

            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <Link href={`/employee/edit/${data?.id}`}>
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
              value={data?.isAccident ? "Kecelakaan" : "Meninggal"}
            />
            <InfoItem
              label="Penyebab Kematian"
              value={data?.deathCause || "-"}
            />
            <InfoItem
              label="Posisi Terakhir"
              value={data?.lastPosition || "-"}
            />
            <InfoItem
              label="Wilayah"
              value={data?.regionName?.toString() || "-"}
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
