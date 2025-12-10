/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
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
import { API_PARTNERS, API_REGIONS } from "@/lib/apiEndpoint";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import camelcaseKeys from "camelcase-keys";
import Link from "next/link";
import { Region } from "@/types/region";
import { Partner } from "@/types/partner";
import { ApiResponseList } from "@/types/api-response";
import Badge from "@/components/ui/badge/Badge";

export default function PartnerTable({
  onCountChange,
}: {
  onCountChange?: (count: number) => void;
}) {
  const [data, setData] = useState<Partner[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState<keyof Partner | "">("");

  const searchInput = useRef<InputRef>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  // ============================================================
  // FETCH PARTNERS
  // ============================================================
  const fetchPartners = useCallback(async () => {
    try {
      const res = await fetchWithAuth(API_PARTNERS);
      if (!res.ok) throw new Error("Failed to fetch partners");

      const json: ApiResponseList<Partner> = await res.json();
      const partners = camelcaseKeys(json.data, { deep: true }) as Partner[];

      setData(partners);
      onCountChange?.(partners.length);
    } catch (err) {
      console.error("Error fetching partners:", err);
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  // ============================================================
  // FETCH REGIONS
  // ============================================================
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

  useEffect(() => {
    fetchPartners();
    fetchRegions();
  }, [fetchPartners, fetchRegions]);

  // ============================================================
  // DELETE HANDLER
  // ============================================================
  const handleDelete = useCallback(async () => {
    if (!deleteId) return;

    setDeleteLoading(true);
    try {
      const res = await fetchWithAuth(`${API_PARTNERS}/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus");

      messageApi.success("Berhasil dihapus");
      setIsDeleteModalOpen(false);

      await fetchPartners();
    } catch (err) {
      console.error(err);
      messageApi.error("Gagal menghapus data");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteId, fetchPartners, messageApi]);

  // ============================================================
  // SEARCH UTILITY
  // ============================================================
  const getColumnSearchProps = (
    dataIndex: keyof Partner
  ): any => ({
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

    onFilter: (value: any, record: { [x: string]: any; }) => {
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
    dataIndex: keyof Partner
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
  const columns: ColumnsType<Partner> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      render: (val) => val ?? "-",
    },
    {
      title: "Foto",
      dataIndex: "partnerPict",
      render: (val, partner) => (
        <Image
          src={val || "/images/user/alt-user.png"}
          width={40}
          height={40}
          alt={partner.partnerName}
          className="rounded-full object-cover w-10 h-10"
        />
      ),
    },
    {
      title: "Nama",
      dataIndex: "partnerName",
      ...getColumnSearchProps("partnerName"),
    },
    {
      title: "Pekerjaan",
      dataIndex: "partnerJob",
      render: (text) => text || "-",
    },
    {
      title: "NIK",
      dataIndex: "partnerNik",
      ...getColumnSearchProps("partnerNik"),
      render: (text) => text || "-",
    },
    {
      title: "Wilayah",
      dataIndex: "regionId",
      filters: regions.map((r) => ({
        text: r.regionName,
        value: r.regionId,
      })),
      onFilter: (value, partner) =>
        String(partner.regionId) === String(value),
      render: (_, partner) => {
        const region = regions.find(
          (r) => r.regionId === partner.regionId
        );
        return region ? region.regionName : "-";
      },
    },
    {
      title: "Kecamatan",
      dataIndex: "subdistrictId",
      render: (val) => val ?? "-",
    },
    {
      title: "Alamat",
      dataIndex: "address",
      ...getColumnSearchProps("address"),
      render: (text) => text || "-",
    },
    {
      title: "Kode Pos",
      dataIndex: "postalCode",
      ...getColumnSearchProps("postalCode"),
      render: (text) => text || "-",
    },
    {
      title: "Koordinat Rumah",
      dataIndex: "homeCoordinate",
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
      ...getColumnSearchProps("phoneNumber"),
      render: (text) => text || "-",
    },
    {
      title: "No. Telp Alt",
      dataIndex: "phoneNumberAlt",
      ...getColumnSearchProps("phoneNumberAlt"),
      render: (text) => text || "-",
    },
    {
      title: "Status Aktif",
      dataIndex: "isActive",
      filters: [
        { text: "Aktif", value: true },
        { text: "Tidak Aktif", value: false },
      ],
      onFilter: (value, partner) => partner.isActive === value,
      render: (val: boolean) => (
        <Badge size="sm" color={val ? "success" : "error"}>
          {val ? "Aktif" : "Tidak Aktif"}
        </Badge>
      ),
    },
    {
      title: "Status Hidup",
      dataIndex: "isAlive",
      filters: [
        { text: "Hidup", value: true },
        { text: "Meninggal", value: false },
      ],
      onFilter: (value, partner) => partner.isAlive === value,
      render: (val: boolean) => (
        <Badge size="sm" color={val ? "success" : "error"}>
          {val ? "Hidup" : "Meninggal"}
        </Badge>
      ),
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

          <Button
            size="xs"
            onClick={() => {
              if (partner.id) {
                setDeleteId(partner.id);
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
        Memuat data...
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
        <p>Item yang sudah dihapus tidak dapat dipulihkan.</p>
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
