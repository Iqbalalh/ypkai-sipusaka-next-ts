"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Space,
  Flex,
  Image,
  Spin,
  InputRef,
  message,
} from "antd";
import {
  SearchOutlined,
  LoadingOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Highlighter from "react-highlight-words";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { API_HOMES, API_REGIONS } from "@/lib/apiEndpoint";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";
import Link from "next/link";
import { Region } from "@/types/region";
import { ApiResponseList } from "@/types/api-response";
import { HomeTable } from "@/types/home";

export default function FamilyTable({
  onCountChange,
}: {
  onCountChange?: (count: number) => void;
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState<HomeTable[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = React.useRef<InputRef>(null);

  useEffect(() => {
    const fetchHomes = async () => {
      try {
        const res = await fetchWithAuth(`${API_HOMES}`);
        if (!res.ok) throw new Error("Failed to fetch homes");
        const json: ApiResponseList<HomeTable> = await res.json();
        const homes = camelcaseKeys(json.data, { deep: true }) as HomeTable[];
        setData(homes);
        onCountChange?.(homes.length);
      } catch (error) {
        console.error("Error fetching homes:", error);
        messageApi.error({
          content: "Gagal mengambil data rumah.",
          key: "save",
          duration: 2,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHomes();
  }, [messageApi, onCountChange]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await fetchWithAuth(`${API_REGIONS}` + "/list");
        if (!res.ok) throw new Error("Failed to fetch regions");
        const json: ApiResponseList<Region> = await res.json();
        const regionsData = camelcaseKeys(json.data, {
          deep: true,
        }) as Region[];
        setRegions(regionsData);
      } catch (error) {
        console.error("Error fetching regions:", error);
        messageApi.error({
          content: "Gagal mengambil data wilayah.",
          key: "save",
          duration: 2,
        });
      }
    };

    fetchRegions();
  }, [messageApi]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getColumnSearchProps = (dataIndex: keyof HomeTable): any => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: {
      setSelectedKeys: (selectedKeys: React.Key[]) => void;
      selectedKeys: React.Key[];
      confirm: () => void;
      clearFilters: () => void;
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Cari ${String(dataIndex)}`}
          value={selectedKeys[0] as string}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <button
            className="text-white bg-blue-500 px-2 py-1 rounded"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          >
            Cari
          </button>
          <button
            className="text-gray-700 bg-gray-200 px-2 py-1 rounded"
            onClick={() => handleReset(clearFilters)}
          >
            Reset
          </button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (
      value: string | number | boolean,
      record: HomeTable
    ): boolean => {
      const fieldValue = record[dataIndex];
      return fieldValue
        ? String(fieldValue).toLowerCase().includes(String(value).toLowerCase())
        : false;
    },
    onOpenChange: (visible: boolean) => {
      if (visible) setTimeout(() => searchInput.current?.select(), 100);
    },
    render: (text: string) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (
    selectedKeys: React.Key[],
    confirm: () => void,
    dataIndex: keyof HomeTable
  ) => {
    confirm();
    setSearchText(String(selectedKeys[0]));
    setSearchedColumn(String(dataIndex));
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const columns: ColumnsType<HomeTable> = [
    {
      title: "Pegawai",
      dataIndex: "employeeName",
      key: "employeeName",
      ...getColumnSearchProps("employeeName"),
      render: (_, home) => (
        <div className="flex items-center gap-3">
          {home.employeePict ? (
            <Image
              src={home?.employeePict || "/images/user/alt-user.png"}
              alt={home.employeeName}
              width={40}
              height={40}
              className="rounded-full object-cover w-10 h-10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
              <Image
                src={"/images/user/alt-user.png"}
                alt={"N/A"}
                width={40}
                height={40}
              />
            </div>
          )}
          <div>
            <span className="block font-medium text-gray-800 dark:text-white/90">
              {home.employeeName}
            </span>
            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
              NIP/NIPP: {home.nipNipp}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Pasangan",
      dataIndex: "partnerName",
      key: "partnerName",
      ...getColumnSearchProps("partnerName"),
      render: (_, home) => (
        <div className="flex items-center gap-3">
          {home.partnerPict ? (
            <Image
              src={home?.partnerPict || "/images/user/alt-user.png"}
              alt={home.partnerName}
              width={40}
              height={40}
              className="rounded-full object-cover w-10 h-10"
            />
          ) : (
            <Image
              src={"/images/user/alt-user.png"}
              alt={"N/A"}
              width={40}
              height={40}
              className="rounded-full object-cover w-10 h-10"
            />
          )}
          <div>
            <span className="flex font-medium text-gray-800 dark:text-white/90">
              {home.partnerName} {!home.isAlive ? "(Alm)" : ""}{" "}
              {home.isUmkm ? (
                <p className="ml-1 border-3 rounded border-blue-400"></p>
              ) : null}
            </span>
            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
              Partner ID: {home.partnerId}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Wali",
      dataIndex: "waliName",
      key: "waliName",
      ...getColumnSearchProps("waliName"),
      render: (text) => text || "-",
    },
    {
      title: "Anak",
      dataIndex: "childrenCount",
      key: "childrenCount",
      align: "center",
    },
    {
      title: "Wilayah",
      dataIndex: "regionId",
      key: "regionId",
      filters: regions.map((r) => ({
        text: r.regionName,
        value: r.regionId,
      })),
      onFilter: (value, record) => record.regionId === value,
      render: (_, home) => {
        const region = regions.find((r) => r.regionId === home.regionId);
        return region ? region.regionName : "-";
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      filters: [
        { text: "Aktif", value: true },
        { text: "Tidak Aktif", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive: boolean) => (
        <Badge size="sm" color={isActive ? "success" : "error"}>
          {isActive ? "Aktif" : "Tidak Aktif"}
        </Badge>
      ),
    },
    {
      title: "Aksi",
      dataIndex: "homeId",
      key: "homeId",
      render: (_, home) => (
        <div className="flex gap-2 text-xs">
          <Link href={`family/view/${home.homeId}`}>
            <Button size="xs">
              <EyeOutlined />
            </Button>
          </Link>
          <Link href={`family/view/${home.homeId}`}>
            <Button size="xs">
              <EditOutlined />
            </Button>
          </Link>
          <Button size="xs">
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  if (loading)
    return (
      <div className="flex justify-center items-center gap-4 h-40 text-gray-500">
        <Flex align="center" gap="middle">
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </Flex>
        Memuat data...
      </div>
    );

  return (
    <div>
      {contextHolder}
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="homeId"
          pagination={{ pageSize: 50, showSizeChanger: false }}
          bordered
          scroll={{ x: "max-content", y: 500 }}
          onChange={(pagination, filters, sorter, extra) => {
            onCountChange?.(extra.currentDataSource.length);
          }}
        />
      </div>
    </div>
  );
}
