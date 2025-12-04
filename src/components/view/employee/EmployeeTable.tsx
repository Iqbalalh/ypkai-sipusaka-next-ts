"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Highlighter from "react-highlight-words";
import camelcaseKeys from "camelcase-keys";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

import { API_EMPLOYEES, API_REGIONS } from "@/lib/apiEndpoint";

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

import { Region } from "@/types/region";
import { ApiResponseList } from "@/types/api-response";
import { Employee } from "@/types/employee";

export default function EmployeeTable({
  onCountChange,
}: {
  onCountChange?: (count: number) => void;
}) {
  const [data, setData] = useState<Employee[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = React.useRef<InputRef>(null);
  const [messageApi, contextHolder] = message.useMessage();

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
        onCountChange?.(employees.length);
      } catch (error) {
        console.error("Error fetching employees:", error);
        messageApi.error({
          content: "Gagal mengambil data pegawai.",
          key: "save",
          duration: 2,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
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
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
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
          rowKey="id"
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
