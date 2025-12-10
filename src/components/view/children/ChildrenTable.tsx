/* eslint-disable @typescript-eslint/no-explicit-any */
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

export default function ChildrenTable({
  onCountChange,
}: {
  onCountChange?: (count: number) => void;
}) {
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
        onCountChange?.(children.length);
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
  }, [messageApi, onCountChange]);

  // =====================
  // SEARCH CONFIG
  // =====================
  const getColumnSearchProps = (dataIndex: string): any => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: {
      setSelectedKeys: (keys: React.Key[]) => void;
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
      // Kolom "orangtua"
      if (dataIndex === "orangtua") {
        const combined = `${record.employeeName ?? ""} ${
          record.partnerName ?? ""
        }`.toLowerCase();
        return combined.includes(String(value).toLowerCase());
      }

      const field = (record as any)[dataIndex];
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
    dataIndex: string
  ) => {
    confirm();
    setSearchText(String(selectedKeys[0]));
    setSearchedColumn(dataIndex);
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
      width: 80,
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
    },
    {
      title: "Nama Anak",
      dataIndex: "childrenName",
      key: "childrenName",
      ...getColumnSearchProps("childrenName"),
    },

    // ==========================
    // ORANGTUA (employee - partner)
    // ==========================
    {
      title: "Orangtua",
      key: "orangtua",
      dataIndex: "orangtua",
      width: 200,

      ...getColumnSearchProps("orangtua"),

      sorter: (a, b) => {
        const x = `${a.employeeName ?? ""} ${
          a.partnerName ?? ""
        }`.toLowerCase();
        const y = `${b.employeeName ?? ""} ${
          b.partnerName ?? ""
        }`.toLowerCase();
        return x.localeCompare(y);
      },

      render: (_, row) => {
        const text = `${row.employeeName ?? "-"} - ${row.partnerName ?? "-"}`;

        return searchedColumn === "orangtua" ? (
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text}
          />
        ) : (
          text
        );
      },
    },

    // ==========================
    // Yatim / Piatu
    // ==========================
    {
      title: "Yatim/Piatu",
      key: "yatimStatus",
      width: 150,

      filters: [
        { text: "Yatim", value: "yatim" },
        { text: "Piatu", value: "piatu" },
        { text: "Yatim Piatu", value: "yatim-piatu" },
      ],

      onFilter: (value, record) => {
        const father = record.isFatherAlive;
        const mother = record.isMotherAlive;

        if (!father && mother && value === "yatim") return true;
        if (father && !mother && value === "piatu") return true;
        if (!father && !mother && value === "yatim-piatu") return true;

        return false;
      },

      render: (_, record) => {
        const father = record.isFatherAlive;
        const mother = record.isMotherAlive;

        let label = "";
        let color: "success" | "error" | "warning" | "info" = "success";

        if (!father && mother) {
          label = "Yatim";
          color = "warning";
        } else if (father && !mother) {
          label = "Piatu";
          color = "warning";
        } else if (!father && !mother) {
          label = "Yatim Piatu";
          color = "error";
        } else {
          label = "Tidak";
          color = "success";
        }

        return (
          <Badge size="sm" color={color}>
            {label}
          </Badge>
        );
      },
    },

    {
      title: "Nama Wali",
      dataIndex: "waliName",
      key: "waliName",
      ...getColumnSearchProps("waliName"),
      render: (_, record) => (record.waliName ? record.waliName : "-"),
    },

    {
      title: "Status Aktif",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      filters: [
        { text: "Aktif", value: true },
        { text: "Tidak Aktif", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (a) => (a === true ? "Aktif" : "Tidak Aktif"),
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
      title: "Kondisi",
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

  // LOADING
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
          onChange={(pagination, filters, sorter, extra) => {
            onCountChange?.(extra.currentDataSource.length);
          }}
        />
      </div>
    </div>
  );
}
