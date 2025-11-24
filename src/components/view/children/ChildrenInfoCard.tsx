"use client";

import React, { useEffect, useState } from "react";
import { Image, message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { API_CHILDRENS } from "@/lib/apiEndpoint";
import { useParams } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import camelcaseKeys from "camelcase-keys";
import { ApiResponseSingle } from "@/types/api-response";
import { InfoItem } from "../../helper/InfoItemHelper";
import { Children } from "@/types/children";

export default function ChildrenInfoCard() {
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState<Children | null>(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        if (!id) return;
        const res = await fetchWithAuth(`${API_CHILDRENS}/${id}`);
        if (!res.ok) throw new Error("Failed to fetch children details");
        const child: ApiResponseSingle<Children> = await res.json();
        const childrenData = camelcaseKeys(child?.data, { deep: true });
        setData(childrenData);
      } catch (error) {
        console.error("Error fetching children details:", error);
        messageApi.error({
          content: "Gagal mengambil data keluarga.",
          key: "save",
          duration: 2,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
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

      {/* Children List */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mt-6">
            <div
              className=""
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
                  <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                    <Image
                      width={80}
                      height={80}
                      src={data?.childrenPict || "/images/user/alt-user.png"}
                      alt={`Profile ${data?.childrenName}`}
                    />
                  </div>

                  <div>
                    <div className="flex">
                      <h5 className="text-lg flex font-semibold text-gray-800 dark:text-white/90 mb-3">
                        {data?.childrenName}
                      </h5>
                    </div>

                    <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                      <p className="text-md text-gray-500 dark:text-gray-400">
                        {data?.childrenGender === "M"
                          ? "Laki-laki"
                          : data?.childrenGender === "F"
                          ? "Perempuan"
                          : "-"}
                      </p>
                      <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <Badge color={data?.isActive ? "success" : "error"}>
                          {data?.isActive ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                      </p>

                      {!data?.isCondition ? (
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
                    <Button variant="outline">Edit</Button>
                  </div>
                </div>
              </div>

              {/* ====== Detail Info Anak ====== */}
              <div className="mt-2">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                  <InfoItem
                    label="Tanggal Lahir"
                    value={data?.childrenBirthdate || "-"}
                  />
                  <InfoItem
                    label="Alamat"
                    value={data?.childrenAddress || "-"}
                  />
                  <InfoItem
                    label="Nomor Telp"
                    value={data?.childrenPhone || "-"}
                  />
                  <InfoItem
                    label="Anak Ke"
                    value={data?.index?.toString() || "-"}
                  />
                  <InfoItem
                    label="Dibuat Pada"
                    value={
                      data?.createdAt
                        ? new Date(data?.createdAt).toLocaleString()
                        : "-"
                    }
                  />
                  <InfoItem
                    label="Diperbarui Pada"
                    value={
                      data?.updatedAt
                        ? new Date(data?.updatedAt).toLocaleString()
                        : "-"
                    }
                  />

                  <InfoItem label="Catatan" value={data?.notes || "-"} />
                </div>
              </div>
            </div>
      </div>
    </>
  );
}
