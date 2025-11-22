"use client";

import React, { useEffect, useState } from "react";
import { Table, Input, Space, Flex, Image, Spin, InputRef } from "antd";
import {
  SearchOutlined,
  LoadingOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Highlighter from "react-highlight-words";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { API_EMPLOYEES, API_REGIONS } from "@/lib/apiEndpoint";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";
import Link from "next/link";
import { Region } from "@/types/region";
import { ApiResponseList } from "@/types/api-response";
import { Employee } from "@/types/employee";

export default function EmployeeTable() {
  const [data, setData] = useState<Employee[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = React.useRef<InputRef>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetchWithAuth(`${API_EMPLOYEES}`);
        if (!res.ok) throw new Error("Failed to fetch employees");
        const json: ApiResponseList<Employee> = await res.json();
        const employees = camelcaseKeys(json.data, {
          deep: true,
        }) as Employee[];
        setData(employees);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await fetchWithAuth(`${API_REGIONS}`);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getColumnSearchProps = (dataIndex: keyof Employee): any => ({
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
    onFilter: (value: string | number | boolean, record: Employee): boolean => {
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
    dataIndex: keyof Employee
  ) => {
    confirm();
    setSearchText(String(selectedKeys[0]));
    setSearchedColumn(String(dataIndex));
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const columns: ColumnsType<Employee> = [
    {
      title: "No.",
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
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
            N/A
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
      title: "Kecelakaan",
      dataIndex: "isAccident",
      key: "isAccident",
      filters: [
        { text: "Ya", value: true },
        { text: "Tidak", value: false },
      ],
      onFilter: (value, record) => record.isAccident === value,
      render: (isAccident: boolean) => (
        <Badge size="sm" color={isAccident ? "error" : "success"}>
          {isAccident ? "Ya" : "Tidak"}
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
