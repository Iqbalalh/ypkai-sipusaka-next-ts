"use client";

import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Space, Flex, Spin, InputRef } from "antd";
import {
  SearchOutlined,
  LoadingOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Highlighter from "react-highlight-words";
import Button from "@/components/ui/button/Button";
import { API_UMKM, API_REGIONS } from "@/lib/apiEndpoint";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";
import Link from "next/link";
import { Region } from "@/types/region";
import { ApiResponseList } from "@/types/api-response";
import { Umkm } from "@/types/umkm";
import { exportTableToExcel } from "@/lib/exportTableToExcel";

export default function UmkmTable() {
  const [data, setData] = useState<Umkm[]>([]);
  const [currentData, setCurrentData] = useState<Umkm[]>([]);
  const [count, setCount] = useState<number>(0);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  // Fetch UMKM
  useEffect(() => {
    const fetchUmkm = async () => {
      try {
        const res = await fetchWithAuth(API_UMKM);
        if (!res.ok) throw new Error("Failed to fetch UMKM");
        const json: ApiResponseList<Umkm> = await res.json();
        const items = camelcaseKeys(json.data, { deep: true }) as Umkm[];
        setData(items);
        setCount(items.length);
      } catch (error) {
        console.error("Error fetching UMKM:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUmkm();
  }, []);

  // Fetch Region
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await fetchWithAuth(API_REGIONS + "/list");
        if (!res.ok) throw new Error("Failed to fetch regions");
        const json: ApiResponseList<Region> = await res.json();
        const items = camelcaseKeys(json.data, { deep: true }) as Region[];
        setRegions(items);
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    };

    fetchRegions();
  }, []);

  useEffect(() => {
    setCurrentData(data);
  }, [data]);

  const handleExportExcel = () => {
    exportTableToExcel<Umkm>({
      data: currentData.length ? currentData : data,
      columns,
      filename: "data-umkm",
      sheetName: "UMKM",
    });
  };

  // SEARCH
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getColumnSearchProps = (dataIndex: keyof Umkm): any => ({
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
    onFilter: (value: string | number | boolean, record: Umkm) => {
      const v = record[dataIndex];
      return v
        ? String(v).toLowerCase().includes(String(value).toLowerCase())
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
    dataIndex: keyof Umkm
  ) => {
    confirm();
    setSearchText(String(selectedKeys[0]));
    setSearchedColumn(String(dataIndex));
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  // COLUMNS
  const columns: ColumnsType<Umkm> = [
    // {
    //   title: "ID",
    //   dataIndex: "id",
    //   key: "id",
    //   width: 60,
    // },
    {
      title: "Pemilik",
      dataIndex: "ownerName",
      key: "ownerName",
      ...getColumnSearchProps("ownerName"),
    },
    {
      title: "Nama UMKM",
      dataIndex: "businessName",
      key: "businessName",
      ...getColumnSearchProps("businessName"),
    },
    {
      title: "Produk",
      dataIndex: "products",
      key: "products",
      ...getColumnSearchProps("products"),
      render: (v) => v ?? "-",
    },
    {
      title: "Jenis Usaha",
      dataIndex: "businessType",
      key: "businessType",
      ...getColumnSearchProps("businessType"),
      render: (v) => v ?? "-",
    },
    {
      title: "Alamat",
      dataIndex: "businessAddress",
      key: "businessAddress",
      ...getColumnSearchProps("businessAddress"),
      render: (v) => v ?? "-",
    },
    {
      title: "Wilayah",
      dataIndex: "regionId",
      key: "regionId",
      filters: regions.map((r) => ({ text: r.regionName, value: r.regionId })),
      onFilter: (value, record) => String(record.regionId) === String(value),
      render: (v) => {
        const reg = regions.find((r) => r.regionId === v);
        return reg ? reg.regionName : v;
      },
    },
    {
      title: "Kecamatan",
      dataIndex: "subdistrictId",
      key: "subdistrictId",
      render: (v) => v ?? "-",
    },
    {
      title: "Kode Pos",
      dataIndex: "postalCode",
      key: "postalCode",
      ...getColumnSearchProps("postalCode"),
      render: (v) => v ?? "-",
    },
    {
      title: "Koordinat",
      dataIndex: "umkmCoordinate",
      key: "umkmCoordinate",
      render: (v) =>
        v ? (
          <a
            href={`https://www.google.com/maps?q=${encodeURIComponent(v)}`}
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            {v}
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "Dibuat",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => (v ? new Date(v).toLocaleString() : "-"),
    },
    {
      title: "Diperbarui",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (v) => (v ? new Date(v).toLocaleString() : "-"),
    },
    {
      title: "Aksi",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, item) => (
        <div className="flex gap-2 text-xs">
          <Link href={`umkm/view/${item.id}`}>
            <Button size="xs">
              <EyeOutlined />
            </Button>
          </Link>
          <Link href={`umkm/edit/${item.id}`}>
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
        Memuat data UMKM...
      </div>
    );

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center gap-4 mb-8">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Jumlah Data: {count}
        </h3>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleExportExcel}>
            Export Excel
          </Button>

          <Link href={"/umkm/create"}>
            <Button
              onClick={() => setLoading(true)}
              disabled={loading}
              size="sm"
            >
              +
            </Button>
          </Link>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 50, showSizeChanger: false }}
        bordered
        scroll={{ x: "max-content", y: 500 }}
        onChange={(pagination, filters, sorter, extra) => {
          setCurrentData(extra.currentDataSource as Umkm[]);
          setCount(extra.currentDataSource.length);
        }}
      />
    </div>
  );
}
