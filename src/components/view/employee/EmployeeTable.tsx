/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Highlighter from "react-highlight-words";
import camelcaseKeys from "camelcase-keys";

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
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { API_EMPLOYEES, API_REGIONS } from "@/lib/apiEndpoint";
import type { ColumnsType } from "antd/es/table";

import { Employee } from "@/types/employee";
import { Region } from "@/types/region";
import { ApiResponseList } from "@/types/api-response";

export default function EmployeeTable({
  onCountChange,
}: {
  onCountChange?: (count: number) => void;
}) {
  // ==========================
  // STATE
  // ==========================
  const [data, setData] = useState<Employee[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const [messageApi, contextHolder] = message.useMessage();

  // ==========================
  // DELETE STATE
  // ==========================
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ==========================
  // FETCH REGIONS
  // ==========================
  const fetchRegions = useCallback(async () => {
    try {
      const res = await fetchWithAuth(API_REGIONS + "/list");
      if (!res.ok) throw new Error("Failed to fetch regions");

      const json: ApiResponseList<Region> = await res.json();
      const regionList = camelcaseKeys(json.data, { deep: true }) as Region[];

      setRegions(regionList);
    } catch (err) {
      console.error("Error fetching regions:", err);
    }
  }, []);

  // ==========================
  // FETCH EMPLOYEES
  // ==========================
  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetchWithAuth(API_EMPLOYEES);
      if (!res.ok) throw new Error("Failed to fetch employees");

      const json = await res.json();
      const employees = camelcaseKeys(json.data ?? json, {
        deep: true,
      }) as Employee[];

      setData(employees);
      onCountChange?.(employees.length);
    } catch (err) {
      console.error(err);
      messageApi.error("Gagal mengambil data pegawai");
    } finally {
      setLoading(false);
    }
  }, [onCountChange, messageApi]);

  useEffect(() => {
    fetchRegions();
    fetchEmployees();
  }, [fetchEmployees, fetchRegions]);

  // ==========================
  // DELETE HANDLER
  // ==========================
  const handleDelete = useCallback(async () => {
    if (!deleteId) return;

    setDeleteLoading(true);
    try {
      const res = await fetchWithAuth(`${API_EMPLOYEES}/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus");

      messageApi.success("Pegawai berhasil dihapus");
      setIsDeleteModalOpen(false);

      fetchEmployees();
    } catch (err) {
      console.error(err);
      messageApi.error("Gagal menghapus data pegawai");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteId, fetchEmployees, messageApi]);

  // ==========================
  // SEARCH CONFIG
  // ==========================
  const getColumnSearchProps = (dataIndex: string): any => ({
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
          onPressEnter={() =>
            handleSearch(selectedKeys, confirm, String(dataIndex))
          }
          style={{ marginBottom: 8, display: "block" }}
        />

        <Space>
          <button
            className="text-white bg-blue-500 px-2 py-1 rounded"
            onClick={() =>
              handleSearch(selectedKeys, confirm, String(dataIndex))
            }
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

    onFilter: (value: any, record: Employee) => {
      const field = (record as any)[dataIndex];
      return field
        ? String(field).toLowerCase().includes(String(value).toLowerCase())
        : false;
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

  // ==========================
  // TABLE COLUMNS
  // ==========================
  const columns: ColumnsType<Employee> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => text || "-",
    },
    {
      title: "Foto",
      dataIndex: "employeePict",
      key: "employeePict",
      render: (_, emp) =>
        emp.employeePict ? (
          <Image
            src={emp.employeePict}
            alt={emp.employeeName}
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
      title: "Nama Pegawai",
      dataIndex: "employeeName",
      key: "employeeName",
      ...getColumnSearchProps("employeeName"),
    },
    {
      title: "NIP/NIPP",
      dataIndex: "nipNipp",
      key: "nipNipp",
      ...getColumnSearchProps("nipNipp"),
    },
    {
      title: "Jabatan Terakhir",
      dataIndex: "lastPosition",
      key: "lastPosition",
      render: (text) => text || "-",
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
      render: (_, emp) => {
        const region = regions.find((r) => r.regionId === emp.regionId);
        return region ? region.regionName : "-";
      },
    },
    {
      title: "Jenis Kelamin",
      dataIndex: "employeeGender",
      key: "employeeGender",
      filters: [
        { text: "Laki-laki", value: "M" },
        { text: "Perempuan", value: "F" },
      ],
      onFilter: (value, record) => record.employeeGender === value,
      render: (gender: "M" | "F") =>
        gender === "M" ? "Laki-laki" : "Perempuan",
    },
    {
      title: "PLH/Non-PLH",
      dataIndex: "isAccident",
      key: "isAccident",
      filters: [
        { text: "PLH", value: true },
        { text: "Non-PLH", value: false },
      ],
      onFilter: (value, record) => record.isAccident === value,
      render: (isAccident: boolean) => (
        <Badge size="sm" color={isAccident ? "error" : "success"}>
          {isAccident ? "PLH" : "Non-PLH"}
        </Badge>
      ),
    },
    {
      title: "Penyebab Wafat",
      dataIndex: "deathCause",
      key: "deathCause",
      render: (text) => text || "-",
    },
    {
      title: "Keterangan",
      dataIndex: "notes",
      key: "notes",
      render: (text) => text || "-",
    },
    {
      title: "Dibuat Pada",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) =>
        text ? new Date(text).toLocaleDateString("id-ID") : "-",
    },
    {
      title: "Diperbarui Pada",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text) =>
        text ? new Date(text).toLocaleDateString("id-ID") : "-",
    },
    {
      title: "Aksi",
      key: "actions",
      fixed: "right",
      render: (_, emp) => (
        <div className="flex gap-2 text-xs">
          <Link href={`employee/view/${emp.id}`}>
            <Button size="xs">
              <EyeOutlined />
            </Button>
          </Link>

          <Link href={`employee/edit/${emp.id}`}>
            <Button size="xs">
              <EditOutlined />
            </Button>
          </Link>

          <Button
            size="xs"
            onClick={() => {
              if (!emp.id) return;
              setDeleteId(emp.id);
              setIsDeleteModalOpen(true);
            }}
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  // ==========================
  // LOADING
  // ==========================
  if (loading)
    return (
      <div className="flex justify-center items-center gap-4 h-40 text-gray-500">
        <Flex align="center" gap="middle">
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </Flex>
        Memuat data...
      </div>
    );

  // ==========================
  // RENDER
  // ==========================
  return (
    <div className="overflow-x-auto">
      {contextHolder}

      {/* DELETE MODAL */}
      <Modal
        title="Konfirmasi Hapus"
        open={isDeleteModalOpen}
        onOk={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText={deleteLoading ? "Menghapus..." : "Hapus"}
        okButtonProps={{ danger: true, loading: deleteLoading }}
      >
        <p>Apakah Anda yakin ingin menghapus pegawai ini?</p>
      </Modal>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        bordered
        pagination={{ pageSize: 50, showSizeChanger: false }}
        scroll={{ x: "max-content", y: 500 }}
        onChange={(pagination, filters, sorter, extra) =>
          onCountChange?.(extra.currentDataSource.length)
        }
      />
    </div>
  );
}
