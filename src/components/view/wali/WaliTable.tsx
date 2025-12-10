/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Table,
  Input,
  Space,
  Flex,
  Spin,
  InputRef,
  Image,
  message,
  Modal,
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
import Button from "@/components/ui/button/Button";
import { API_WALI } from "@/lib/apiEndpoint";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";
import Link from "next/link";
import { ApiResponseList } from "@/types/api-response";
import { Wali } from "@/types/wali";

export default function WaliTable({
  onCountChange,
}: {
  onCountChange?: (count: number) => void;
}) {
  const [data, setData] = useState<Wali[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  // ======================================
  // FETCH DATA WALI
  // ======================================
  const fetchWalis = useCallback(async () => {
    try {
      const res = await fetchWithAuth(API_WALI);
      if (!res.ok) throw new Error("Failed to fetch wali");

      const json: ApiResponseList<Wali> = await res.json();
      const waliData = camelcaseKeys(json.data, { deep: true }) as Wali[];

      setData(waliData);
      onCountChange?.(waliData.length);
    } catch (error) {
      console.error("Error fetching wali:", error);
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    fetchWalis();
  }, [fetchWalis]);

  // ======================================
  // DELETE DATA
  // ======================================
  const handleDelete = useCallback(async () => {
    if (!deleteId) return;

    setDeleteLoading(true);
    try {
      const res = await fetchWithAuth(`${API_WALI}/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus");

      messageApi.success("Berhasil dihapus");
      setIsDeleteModalOpen(false);

      await fetchWalis(); // refresh data setelah delete
    } catch (err) {
      console.error(err);
      messageApi.error("Gagal menghapus data");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteId, fetchWalis, messageApi]);

  // ======================================
  // SEARCH FILTER TABLE
  // ======================================
  const getColumnSearchProps = (dataIndex: keyof Wali): any => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: any) => (
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

    onFilter: (value: string, record: Wali) =>
      String(record[dataIndex] || "")
        .toLowerCase()
        .includes(value.toLowerCase()),

    onOpenChange: (visible: boolean) => {
      if (visible) setTimeout(() => searchInput.current?.select(), 100);
    },

    render: (text: string) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text || ""}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (
    selectedKeys: React.Key[],
    confirm: () => void,
    dataIndex: keyof Wali
  ) => {
    confirm();
    setSearchText(String(selectedKeys[0]));
    setSearchedColumn(String(dataIndex));
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  // ======================================
  // TABLE COLUMNS
  // ======================================
  const columns: ColumnsType<Wali> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      render: (val) => val ?? "-",
    },
    {
      title: "Foto",
      dataIndex: "waliPict",
      render: (val, wali) => (
        <Image
          src={val || "/images/user/alt-user.png"}
          alt={wali.waliName}
          width={40}
          height={40}
          className="rounded-full object-cover w-10 h-10"
        />
      ),
    },
    {
      title: "Nama Wali",
      dataIndex: "waliName",
      ...getColumnSearchProps("waliName"),
    },
    {
      title: "Relasi",
      dataIndex: "relation",
      ...getColumnSearchProps("relation"),
      render: (text) => text || "-",
    },
    {
      title: "Alamat",
      dataIndex: "waliAddress",
      ...getColumnSearchProps("waliAddress"),
      render: (text) => text || "-",
    },
    {
      title: "Koordinat",
      dataIndex: "addressCoordinate",
      render: (text) =>
        text ? (
          <a
            href={`https://www.google.com/maps?q=${encodeURIComponent(text)}`}
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
      title: "No. Telepon",
      dataIndex: "waliPhone",
      ...getColumnSearchProps("waliPhone"),
      render: (text) => text || "-",
    },
    {
      title: "Dibuat",
      dataIndex: "createdAt",
      sorter: (a, b) =>
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime(),
      render: (val) => (val ? new Date(val).toLocaleString() : "-"),
    },
    {
      title: "Diperbarui",
      dataIndex: "updatedAt",
      sorter: (a, b) =>
        new Date(a.updatedAt || 0).getTime() -
        new Date(b.updatedAt || 0).getTime(),
      render: (val) => (val ? new Date(val).toLocaleString() : "-"),
    },
    {
      title: "Aksi",
      fixed: "right",
      width: 120,
      render: (_, wali) => (
        <div className="flex gap-2 text-xs">
          <Link href={`wali/view/${wali.id}`}>
            <Button size="xs">
              <EyeOutlined />
            </Button>
          </Link>

          <Link href={`wali/edit/${wali.id}`}>
            <Button size="xs">
              <EditOutlined />
            </Button>
          </Link>

          <Button
            size="xs"
            onClick={() => {
              if (!wali.id) {
                return;
              }
              setDeleteId(wali.id);
              setIsDeleteModalOpen(true);
            }}
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  // ======================================
  // LOADING UI
  // ======================================
  if (loading)
    return (
      <div className="flex justify-center items-center gap-4 h-40 text-gray-500">
        <Flex align="center" gap="middle">
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </Flex>
        Memuat data...
      </div>
    );

  // ======================================
  // RENDER
  // ======================================
  return (
    <div className="overflow-x-auto">
      {contextHolder}

      {/* MODAL DELETE */}
      <Modal
        title="Konfirmasi Hapus"
        open={isDeleteModalOpen}
        onCancel={() => !deleteLoading && setIsDeleteModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            size="xs"
            className="mr-2"
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={deleteLoading}
          >
            Batal
          </Button>,
          <Button
            key="delete"
            size="xs"
            className="bg-red-500"
            disabled={deleteLoading}
            onClick={handleDelete}
          >
            Hapus
          </Button>,
        ]}
      >
        <p>Item yang sudah dihapus tidak dapat dipulihkan.</p>
      </Modal>

      {/* TABLE */}
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
  );
}
