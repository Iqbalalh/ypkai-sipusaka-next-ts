"use client";

import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Space, Flex, Spin, InputRef, Image } from "antd";
import {
  SearchOutlined,
  LoadingOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Highlighter from "react-highlight-words";
import Button from "@/components/ui/button/Button";
import { API_PARTNERS, API_REGIONS } from "@/lib/apiEndpoint";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";
import Link from "next/link";
import { Region } from "@/types/region";
import { ApiResponseList } from "@/types/api-response";
import { Partner } from "@/types/partner";
import Badge from "@/components/ui/badge/Badge";

export default function PartnerTable() {
  const [data, setData] = useState<Partner[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  // Fetch Partner Data
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await fetchWithAuth(`${API_PARTNERS}`);
        if (!res.ok) throw new Error("Failed to fetch partners");
        const json: ApiResponseList<Partner> = await res.json();
        const partners = camelcaseKeys(json.data, { deep: true }) as Partner[];
        setData(partners);
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Fetch Region Data
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await fetchWithAuth(`${API_REGIONS}`+"/list");
        if (!res.ok) throw new Error("Failed to fetch regions");
        const json: ApiResponseList<Region> = await res.json();
        const regionsData = camelcaseKeys(json.data, {
          deep: true,
        }) as Region[];
        setRegions(regionsData);
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    };

    fetchRegions();
  }, []);

  // Search helper

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getColumnSearchProps = (dataIndex: keyof Partner): any => ({
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
    onFilter: (value: string | number | boolean, record: Partner): boolean => {
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
    dataIndex: keyof Partner
  ) => {
    confirm();
    setSearchText(String(selectedKeys[0]));
    setSearchedColumn(String(dataIndex));
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  // Kolom tabel
  const columns: ColumnsType<Partner> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (val) => val ?? "-",
    },
    {
      title: "Foto",
      dataIndex: "partnerPict",
      key: "partnerPict",
      render: (val, partner) =>
        val ? (
          <Image
            src={val || "/images/user/alt-user.png"}
            width={40}
            height={40}
            alt={partner.partnerName}
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
        ),
    },
    {
      title: "Nama",
      dataIndex: "partnerName",
      key: "partnerName",
      ...getColumnSearchProps("partnerName"),
    },
    {
      title: "Pekerjaan",
      dataIndex: "partnerJob",
      key: "partnerJob",
      render: (text) => text || "-",
    },
    {
      title: "NIK",
      dataIndex: "partnerNik",
      key: "partnerNik",
      ...getColumnSearchProps("partnerNik"),
      render: (text) => text || "-",
    },
    {
      title: "Wilayah",
      dataIndex: "regionId",
      key: "regionId",
      filters: regions.map((r) => ({ text: r.regionName, value: r.regionId })),
      onFilter: (value, record) =>
        String(record.regionId ?? "") === String(value),
      render: (_, partner) => {
        const region = regions.find((r) => r.regionId === partner.regionId);
        return region ? region.regionName : partner.regionId ?? "-";
      },
    },
    {
      title: "Kecamatan",
      dataIndex: "subdistrictId",
      key: "subdistrictId",
      render: (val) => val ?? "-",
    },
    {
      title: "Alamat",
      dataIndex: "address",
      key: "address",
      ...getColumnSearchProps("address"),
      render: (text) => text || "-",
    },
    {
      title: "Kode Pos",
      dataIndex: "postalCode",
      key: "postalCode",
      ...getColumnSearchProps("postalCode"),
      render: (text) => text || "-",
    },
    {
      title: "Koordinat Rumah",
      dataIndex: "homeCoordinate",
      key: "homeCoordinate",
      render: (text) =>
        text ? (
          <a
            href={`https://www.google.com/maps?q=${encodeURIComponent(
              String(text)
            )}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline"
          >
            {text}
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "No. Telp",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      ...getColumnSearchProps("phoneNumber"),
      render: (text) => text || "-",
    },
    {
      title: "No. Telp Alt",
      dataIndex: "phoneNumberAlt",
      key: "phoneNumberAlt",
      ...getColumnSearchProps("phoneNumberAlt"),
      render: (text) => text || "-",
    },
    {
      title: "Status Aktif",
      dataIndex: "isActive",
      key: "isActive",
      filters: [
        { text: "Aktif", value: true },
        { text: "Tidak Aktif", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (val: boolean) => (
        <Badge size="sm" color={val ? "success" : "error"}>
          {val ? "Aktif" : "Tidak Aktif"}
        </Badge>
      ),
    },
    {
      title: "Status Hidup",
      dataIndex: "isAlive",
      key: "isAlive",
      filters: [
        { text: "Hidup", value: true },
        { text: "Meninggal", value: false },
      ],
      onFilter: (value, record) => record.isAlive === value,
      render: (val: boolean) => (
        <Badge size="sm" color={val ? "success" : "error"}>
          {val ? "Hidup" : "Meninggal"}
        </Badge>
      ),
    },
    {
      title: "Dibuat Pada",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) =>
        (new Date(a.createdAt ?? 0).getTime() || 0) -
        (new Date(b.createdAt ?? 0).getTime() || 0),
      render: (val) => (val ? new Date(val).toLocaleString() : "-"),
    },
    {
      title: "Diperbarui Pada",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: (a, b) =>
        (new Date(a.updatedAt ?? 0).getTime() || 0) -
        (new Date(b.updatedAt ?? 0).getTime() || 0),
      render: (val) => (val ? new Date(val).toLocaleString() : "-"),
    },
    {
      title: "Aksi",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, partner) => (
        <div className="flex gap-2 text-xs">
          <Link href={`partner/view/${partner.id}`}>
            <Button size="xs">
              <EyeOutlined />
            </Button>
          </Link>
          <Link href={`partner/edit/${partner.id}`}>
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
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{ pageSize: 50, showSizeChanger: false }}
          bordered
          scroll={{ x: "max-content", y: 500 }}
        />
      </div>
    </div>
  );
}
