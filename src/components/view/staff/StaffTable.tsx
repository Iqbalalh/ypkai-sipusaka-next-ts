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
  Modal,
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
import Button from "@/components/ui/button/Button";
// Pastikan endpoint ini ada di file apiEndpoint Anda
import { API_STAFF } from "@/lib/apiEndpoint";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";
import Link from "next/link";
// Pastikan type definition ini ada
import { Staff } from "@/types/staff";
import { ApiResponseList } from "@/types/api-response";

export default function StaffTable({
  onCountChange,
}: {
  onCountChange?: (count: number) => void;
}) {
  const [data, setData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState<keyof Staff | "">("");

  const searchInput = useRef<InputRef>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  // ============================================================
  // FETCH STAFFS (EMPLOYEES)
  // ============================================================
  const fetchStaffs = useCallback(async () => {
    try {
      const res = await fetchWithAuth(API_STAFF);
      if (!res.ok) throw new Error("Failed to fetch employees");

      const json: ApiResponseList<Staff> = await res.json();
      // Konversi snake_case dari DB ke camelCase untuk frontend
      const staffList = camelcaseKeys(json.data, { deep: true }) as Staff[];

      setData(staffList);
      onCountChange?.(staffList.length);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  // ============================================================
  // DELETE HANDLER
  // ============================================================
  const handleDelete = useCallback(async () => {
    if (!deleteId) return;

    setDeleteLoading(true);
    try {
      const res = await fetchWithAuth(`${API_STAFF}/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus");

      messageApi.success("Berhasil dihapus");
      setIsDeleteModalOpen(false);

      await fetchStaffs();
    } catch (err) {
      console.error(err);
      messageApi.error("Gagal menghapus data");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteId, fetchStaffs, messageApi]);

  // ============================================================
  // SEARCH UTILITY
  // ============================================================
  const getColumnSearchProps = (dataIndex: keyof Staff): any => ({
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
          value={(selectedKeys[0] as string) ?? ""}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />

        <Space>
          <button
            className="text-white bg-blue-500 px-2 py-1 rounded"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
          >
            Cari
          </button>

          <button
            className="text-gray-700 bg-gray-200 px-2 py-1 rounded"
            onClick={() => {
              clearFilters?.();
              handleReset();
            }}
          >
            Reset
          </button>
        </Space>
      </div>
    ),

    filterIcon: (filtered: any) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),

    onFilter: (value: any, record: { [x: string]: any }) => {
      const fieldValue = record[dataIndex];
      return fieldValue
        ? String(fieldValue).toLowerCase().includes(String(value).toLowerCase())
        : false;
    },

    onOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },

    render: (value: unknown) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={value ? String(value) : ""}
        />
      ) : (
        String(value ?? "")
      ),
  });

  const handleSearch = (
    selectedKeys: string[],
    confirm: () => void,
    dataIndex: keyof Staff
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = () => {
    setSearchText("");
  };

  // ============================================================
  // COLUMNS
  // ============================================================
  const columns: ColumnsType<Staff> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      render: (val) => val ?? "-",
    },
    {
      title: "Foto",
      dataIndex: "staffPict",
      render: (val, staff) => (
        <Image
          src={val || "/images/user/alt-user.png"}
          width={40}
          height={40}
          alt={staff.staffName}
          className="rounded-full object-cover w-10 h-10"
        />
      ),
    },
    {
      title: "Nama",
      dataIndex: "staffName",
      ...getColumnSearchProps("staffName"),
    },
    {
      title: "Jabatan",
      dataIndex: "roleId",
      ...getColumnSearchProps("staffName"),
    },
    {
      title: "NIK",
      dataIndex: "nik",
      ...getColumnSearchProps("nik"),
      render: (text) => text || "-",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      filters: [
        { text: "Laki-laki", value: "M" },
        { text: "Perempuan", value: "F" },
      ],
      onFilter: (value, staff) => staff.gender === value,
      render: (val) =>
        val === "M" ? "Laki-laki" : val === "F" ? "Perempuan" : "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      ...getColumnSearchProps("email"),
      render: (text) => text || "-",
    },
    {
      title: "No. Telp",
      dataIndex: "phoneNumber",
      ...getColumnSearchProps("phoneNumber"),
      render: (text) => text || "-",
    },
    {
      title: "Alamat",
      dataIndex: "address",
      ...getColumnSearchProps("address"),
      ellipsis: true, // Agar alamat panjang tidak merusak layout
      render: (text) => text || "-",
    },
    {
      title: "Aksi",
      fixed: "right",
      width: 120,
      render: (_, staff) => (
        <div className="flex gap-2 text-xs">
          <Link href={`employee/view/${staff.id}`}>
            <Button size="xs">
              <EyeOutlined />
            </Button>
          </Link>

          <Link href={`employee/edit/${staff.id}`}>
            <Button size="xs">
              <EditOutlined />
            </Button>
          </Link>

          <Button
            size="xs"
            onClick={() => {
              if (staff.id) {
                setDeleteId(staff.id);
                setIsDeleteModalOpen(true);
              }
            }}
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  // ============================================================
  // LOADING UI
  // ============================================================
  if (loading) {
    return (
      <div className="flex justify-center items-center gap-4 h-40 text-gray-500">
        <Flex align="center" gap="middle">
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </Flex>
        Memuat data karyawan...
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="overflow-x-auto">
      {contextHolder}

      {/* DELETE MODAL */}
      <Modal
        title="Konfirmasi Hapus"
        open={isDeleteModalOpen}
        onCancel={() => !deleteLoading && setIsDeleteModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            size="xs"
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={deleteLoading}
            className="mr-2"
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
        <p>Data karyawan yang sudah dihapus tidak dapat dipulihkan.</p>
      </Modal>

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
