"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Highlighter from "react-highlight-words";
import camelcaseKeys from "camelcase-keys";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { API_CHILDRENS } from "@/lib/apiEndpoint";

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

import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";

import { Children } from "@/types/children";

export default function ChildrenTable() {
  const [data, setData] = useState<Children[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = React.useRef<InputRef>(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await fetchWithAuth(`${API_CHILDRENS}`);
        if (!res.ok) throw new Error("Failed to fetch children");
        const json = await res.json();
        const children = camelcaseKeys(json.data ?? json, {
          deep: true,
        }) as Children[];
        setData(children);
      } catch (error) {
        console.error("Error fetching children:", error);
        messageApi.error({
          content: "Gagal mengambil data anak.",
          key: "save",
          duration: 2,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [messageApi]);

  // =====================
  // SEARCH CONFIG
  // =====================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getColumnSearchProps = (dataIndex: keyof Children): any => ({
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
    onFilter: (value: string | number | boolean, record: Children) => {
      const field = record[dataIndex];
      return field
        ? String(field).toLowerCase().includes(String(value).toLowerCase())
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
    dataIndex: keyof Children
  ) => {
    confirm();
    setSearchText(String(selectedKeys[0]));
    setSearchedColumn(String(dataIndex));
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  // =====================
  // TABLE COLUMNS
  // =====================
  const columns: ColumnsType<Children> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (x) => x || "-",
      width: 70,
    },
    {
      title: "Foto",
      dataIndex: "childrenPict",
      key: "childrenPict",
      render: (_, child) =>
        child.childrenPict ? (
          <Image
            src={child.childrenPict}
            alt={"Kosong"}
            width={40}
            height={40}
            className="rounded-full object-cover w-10 h-10"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <Image
              src={"/images/user/alt-user.png"}
              alt={"N/A"}
              width={40}
              height={40}
            />
          </div>
        ),
      width: 80,
    },
    {
      title: "Nama Anak",
      dataIndex: "childrenName",
      key: "childrenName",
      ...getColumnSearchProps("childrenName"),
    },
    {
      title: "Home",
      dataIndex: "homeId",
      key: "homeId",
      width: 80,
      sorter: (a, b) => (a.homeId ?? 0) - (b.homeId ?? 0),
    },
    {
      title: "Yatim",
      dataIndex: "isFatherAlive",
      key: "isFatherAlive",
      width: 120,
      render: (v) => (
        <Badge size="sm" color={v ? "success" : "error"}>
          {v ? "Tidak" : "Ya"}
        </Badge>
      ),
    },
    {
      title: "Piatu",
      dataIndex: "isMotherAlive",
      key: "isMotherAlive",
      width: 120,
      render: (v) => (
        <Badge size="sm" color={v ? "success" : "error"}>
          {v ? "Tidak" : "Ya"}
        </Badge>
      ),
    },
    {
      title: "Jenis Kelamin",
      dataIndex: "childrenGender",
      key: "childrenGender",
      width: 100,
      filters: [
        { text: "Laki-laki", value: "M" },
        { text: "Perempuan", value: "F" },
      ],
      onFilter: (value, record) => record.childrenGender === value,
      render: (g) => (g === "M" ? "Laki-laki" : "Perempuan"),
    },
    {
      title: "ABK",
      dataIndex: "isCondition",
      key: "isCondition",
      width: 100,
      filters: [
        { text: "Normal", value: true },
        { text: "ABK", value: false },
      ],
      onFilter: (value, record) => record.isCondition === value,
      render: (v) => (
        <Badge size="sm" color={v ? "primary" : "warning"}>
          {v ? "Normal" : "ABK"}
        </Badge>
      ),
    },
    {
      title: "Aksi",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, child) => (
        <div className="flex gap-2 text-xs">
          <Link href={`children/view/${child.id}`}>
            <Button size="xs">
              <EyeOutlined />
            </Button>
          </Link>
          <Link href={`children/edit/${child.id}`}>
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

  // ======================
  // LOADING
  // ======================
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
          rowKey="id"
          bordered
          pagination={{ pageSize: 50, showSizeChanger: false }}
          scroll={{ x: "max-content", y: 500 }}
        />
      </div>
    </div>
  );
}
