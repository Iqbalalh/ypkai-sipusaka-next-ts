/* eslint-disable @typescript-eslint/no-explicit-any */
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { ColumnsType } from "antd/es/table";

/**
 * Generic Excel export for Ant Design Table
 * Safe, styled, and TypeScript strict-friendly
 */
type ExportOptions<T> = {
  data: T[];
  columns: ColumnsType<T>;
  filename?: string;
  sheetName?: string;
};

export async function exportTableToExcel<T>({
  data,
  columns,
  filename = "export",
  sheetName = "Sheet1",
}: ExportOptions<T>) {
  if (!data || data.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 1 }], // Freeze header
  });

  /**
   * Filter kolom:
   * - Harus punya dataIndex
   * - Bukan kolom aksi
   */
  const validColumns = columns.filter(
    (col: any) => col.dataIndex && col.key !== "actions" && col.title !== "Aksi"
  ) as any[];

  // =========================
  // HEADER
  // =========================
  worksheet.columns = validColumns.map((col) => ({
    header: typeof col.title === "string" ? col.title : String(col.key),
    key: col.dataIndex,
    width: 20,
  }));

  const headerRow = worksheet.getRow(1);
  headerRow.height = 24;

  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" }, // blue-600
    };
    cell.border = fullBorder();
  });

  // =========================
  // DATA ROWS
  // =========================
  data.forEach((row: any, index) => {
    const record: Record<string, any> = {};

    validColumns.forEach((col) => {
      let value: any;

      // 1️⃣ Jika ada exportRender → PAKAI
      if (typeof col.exportRender === "function") {
        value = col.exportRender(row[col.dataIndex], row, index);
      }
      // 2️⃣ Jika ada render → coba pakai render
      else if (typeof col.render === "function") {
        const rendered = col.render(row[col.dataIndex], row, index);

        // Jika render menghasilkan primitive
        if (typeof rendered === "string" || typeof rendered === "number") {
          value = rendered;
        } else {
          value = row[col.dataIndex];
        }
      }
      // 3️⃣ Default
      else {
        value = row[col.dataIndex];
      }

      // Boolean
      if (typeof value === "boolean") {
        value = value ? "Ya" : "Tidak";
      }

      // Date
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        value = new Date(value).toLocaleDateString("id-ID");
      }

      record[col.dataIndex] = value ?? "-";
    });

    const excelRow = worksheet.addRow(record);

    // Zebra striping
    if (index % 2 === 1) {
      excelRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF1F5F9" }, // slate-100
        };
      });
    }

    excelRow.eachCell((cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "left",
      };
      cell.border = fullBorder();
    });
  });

  // =========================
  // AUTO COLUMN WIDTH
  // =========================
  worksheet.columns?.forEach((column) => {
    if (!column || typeof column.eachCell !== "function") return;

    let maxLength = 10;

    column.eachCell({ includeEmpty: true }, (cell) => {
      const value = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, value.length);
    });

    column.width = maxLength + 4;
  });

  // =========================
  // EXPORT FILE
  // =========================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `${filename}.xlsx`);
}

// =========================
// BORDER HELPER (TYPE SAFE)
// =========================
function fullBorder(): Partial<ExcelJS.Borders> {
  return {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
}
