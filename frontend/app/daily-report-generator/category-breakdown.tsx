"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Upload,
  Download,
  Trash2,
  Layers,
  Table,
  Sparkles,
  SlidersHorizontal,
  FileSpreadsheet,
  FileText,
  EyeOff,
  Image as ImageIcon,
  ArrowUpDown,
  Filter,
  BarChart3,
  RotateCcw,
} from "lucide-react";
import * as xlsx from "xlsx";
import Papa from "papaparse";

export interface CategoryRow {
  category: string;
  count: number;
  percentage: number;
  cumulativePercentage: number;
  isOther?: boolean;
}

export interface HeaderConfig {
  category: string;
  count: string;
  percentage: string;
  cumulative?: string;
}

export interface TableTheme {
  id: string;
  name: string;
  headerBg: string;
  headerText: string;
  accentColor: string;
  borderColor: string;
  zebraBg: string;
}

export const SALESFORCE_BLUE_THEME: TableTheme = {
  id: "salesforce-blue",
  name: "Salesforce Blue",
  headerBg: "#0176D3",
  headerText: "#FFFFFF",
  accentColor: "#0176D3",
  borderColor: "#000000",
  zebraBg: "#F0F7FD",
};

export const EXCEL_THEMES: TableTheme[] = [SALESFORCE_BLUE_THEME];

export const SAMPLE_IMAGE_2 = `Data update
Data update
Data update
Data update
Bug
Awareness issue`;

export const SAMPLE_IMAGE_1 = `Data update
Data update
Data update
Data update
Bug
Awareness issue
Bug
Awareness issue
Data update
Bug
Data update
Awareness issue
Data update
Data update
Data update
Awareness issue
Data update
Data update
Data update
Data update
Data updated`;

export const SAMPLE_MULTI_COL = `Case Number,Category,Status,Priority
5001,Data Update,Closed,High
5002,Data Update,In Progress,Medium
5003,Bug,Open,Critical
5004,Awareness Issue,Closed,Low
5005,Data Update,Closed,Medium
5006,Data Update,Closed,High
5007,Bug,In Progress,Critical
5008,Awareness Issue,Closed,Medium
5009,Data Update,Open,Low
5010,Bug,Closed,High
5011,Data Update,Closed,Low
5012,Access Issue,Open,High`;

export const VARIATION_MAP: Record<string, string> = {
  "data update": "Data Update",
  "data updated": "Data Update",
  "data updates": "Data Update",
  "data-update": "Data Update",
  "awareness issue": "Awareness Issue",
  "awareness issues": "Awareness Issue",
  "user awareness": "Awareness Issue",
  "user awareness issue": "Awareness Issue",
  "awareness": "Awareness Issue",
  "bug": "Bug",
  "bugs": "Bug",
  "software bug": "Bug",
  "bug fix": "Bug",
  "access issue": "Access Issue",
  "access issues": "Access Issue",
  "query": "Query",
  "queries": "Query",
  "configuration": "Configuration Issue",
  "configuration issue": "Configuration Issue",
  "enhancement": "Enhancement",
  "enhancements": "Enhancement",
};

export const COMMON_HEADERS = new Set([
  "category",
  "categories",
  "issue type",
  "issue-type",
  "issuetype",
  "sub category",
  "sub-category",
  "subcategory",
  "type",
  "status",
  "issues",
]);

export function toTitleCase(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
    .join(" ");
}

export function parseCategories(
  rawInput: string,
  options: {
    autoTitleCase: boolean;
    normalizeVariations: boolean;
    skipHeaderRow: boolean;
    sortBy: "count-desc" | "count-asc" | "alpha-asc" | "original";
    excludedCategories?: Set<string>;
    groupOthersThreshold?: number; // e.g. 5 for < 5%
    selectedColumnIndex?: number;
  }
): {
  rows: CategoryRow[];
  total: number;
  rawCount: number;
  detectedHeaders: string[];
} {
  if (!rawInput.trim()) {
    return { rows: [], total: 0, rawCount: 0, detectedHeaders: [] };
  }

  let lines = rawInput
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { rows: [], total: 0, rawCount: 0, detectedHeaders: [] };
  }

  let detectedHeaders: string[] = [];
  let colIndex = options.selectedColumnIndex ?? 0;

  // Check if dataset is multi-column CSV/TSV
  const firstLine = lines[0];
  const isDelimited = firstLine ? firstLine.includes(",") || firstLine.includes("\t") : false;

  let parsedItems: string[] = [];

  if (isDelimited) {
    const delimiter = firstLine && firstLine.includes("\t") ? "\t" : ",";
    const parsedCsv = Papa.parse<string[]>(lines.join("\n"), {
      delimiter,
      skipEmptyLines: true,
    });

    if (parsedCsv.data.length > 0) {
      const headerRow = parsedCsv.data[0];
      if (headerRow && Array.isArray(headerRow)) {
        detectedHeaders = headerRow.map((h) => String(h || "").trim());

        // Auto-detect best category column if default colIndex 0 was passed
        if (options.selectedColumnIndex === undefined || options.selectedColumnIndex === 0) {
          const autoFound = detectedHeaders.findIndex((h) =>
            /category|issue|sub|type|status/i.test(h)
          );
          if (autoFound !== -1) {
            colIndex = autoFound;
          }
        }
      }

      const dataRows = options.skipHeaderRow ? parsedCsv.data.slice(1) : parsedCsv.data;
      parsedItems = dataRows
        .map((row) => (Array.isArray(row) && row[colIndex] !== undefined ? String(row[colIndex]).trim() : ""))
        .filter((val) => val.length > 0);
    }
  } else {
    // Single column list
    let workLines = lines;
    const checkFirst = workLines[0];
    if (checkFirst && options.skipHeaderRow) {
      const firstLower = checkFirst.toLowerCase().trim();
      if (COMMON_HEADERS.has(firstLower) || firstLower.includes("category")) {
        workLines = workLines.slice(1);
      }
    }
    parsedItems = workLines;
  }

  const rawCount = parsedItems.length;
  if (rawCount === 0) {
    return { rows: [], total: 0, rawCount: 0, detectedHeaders };
  }

  const excluded = options.excludedCategories || new Set<string>();
  const countMap = new Map<string, number>();
  const firstSeenOrder: string[] = [];

  let activeTotal = 0;

  for (const item of parsedItems) {
    let clean = item.replace(/^["']|["']$/g, "").trim();
    if (!clean) continue;

    const lower = clean.toLowerCase();
    if (options.normalizeVariations && VARIATION_MAP[lower]) {
      clean = VARIATION_MAP[lower]!;
    } else if (options.autoTitleCase) {
      clean = toTitleCase(clean);
    }

    if (excluded.has(clean)) {
      continue;
    }

    if (!countMap.has(clean)) {
      countMap.set(clean, 0);
      firstSeenOrder.push(clean);
    }
    countMap.set(clean, countMap.get(clean)! + 1);
    activeTotal++;
  }

  if (activeTotal === 0) {
    return { rows: [], total: 0, rawCount, detectedHeaders };
  }

  // Sort keys
  const sortedKeys = [...firstSeenOrder];
  if (options.sortBy === "count-desc") {
    sortedKeys.sort((a, b) => {
      const diff = countMap.get(b)! - countMap.get(a)!;
      return diff !== 0 ? diff : a.localeCompare(b);
    });
  } else if (options.sortBy === "count-asc") {
    sortedKeys.sort((a, b) => {
      const diff = countMap.get(a)! - countMap.get(b)!;
      return diff !== 0 ? diff : a.localeCompare(b);
    });
  } else if (options.sortBy === "alpha-asc") {
    sortedKeys.sort((a, b) => a.localeCompare(b));
  }

  let finalRows: CategoryRow[] = [];
  const threshold = options.groupOthersThreshold || 0;

  let othersCount = 0;
  let othersCategoryCount = 0;

  for (const cat of sortedKeys) {
    const count = countMap.get(cat) || 0;
    const percentage = (count / activeTotal) * 100;

    if (threshold > 0 && percentage < threshold && sortedKeys.length > 3) {
      othersCount += count;
      othersCategoryCount++;
    } else {
      finalRows.push({
        category: cat,
        count,
        percentage,
        cumulativePercentage: 0,
      });
    }
  }

  if (othersCount > 0) {
    finalRows.push({
      category: `Other Issues (${othersCategoryCount} categories)`,
      count: othersCount,
      percentage: (othersCount / activeTotal) * 100,
      cumulativePercentage: 0,
      isOther: true,
    });
  }

  // Compute cumulative percentages
  let runningSum = 0;
  finalRows = finalRows.map((row) => {
    runningSum += row.percentage;
    return {
      ...row,
      cumulativePercentage: Math.min(100, runningSum),
    };
  });

  return { rows: finalRows, total: activeTotal, rawCount, detectedHeaders };
}

export function generateCategoryTableHtml(
  rows: CategoryRow[],
  total: number,
  headers: HeaderConfig = {
    category: "Category",
    count: "No. of Issues",
    percentage: "Percentage",
    cumulative: "Cumulative %",
  },
  options: {
    theme?: TableTheme;
    decimalPlaces?: number;
    showCumulative?: boolean;
    showDataBars?: boolean;
    bandedRows?: boolean;
    categoryAlign?: "center" | "left";
    numberAlign?: "center" | "right";
  } = {}
): string {
  const theme = options.theme || EXCEL_THEMES[0]!;
  const decimals = options.decimalPlaces ?? 2;
  const showCumulative = options.showCumulative ?? false;
  const showDataBars = options.showDataBars ?? false;
  const bandedRows = options.bandedRows ?? false;
  const catAlign = options.categoryAlign ?? "center";
  const numAlign = options.numberAlign ?? "center";

  const numCols = showCumulative ? 4 : 3;
  const catWidth = showCumulative ? "38%" : "44%";
  const numWidth = showCumulative ? "20%" : "28%";

  return `<table style="border-collapse: collapse; width: 100%; max-width: ${showCumulative ? "520px" : "460px"}; font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 14px; border: 1px solid ${theme.borderColor}; text-align: center; margin: 12px auto; background-color: #ffffff;">
  <thead>
    <tr style="background-color: ${theme.headerBg}; color: ${theme.headerText}; font-weight: bold; border: 1px solid ${theme.borderColor};">
      <th style="border: 1px solid ${theme.borderColor}; padding: 8px 14px; text-align: ${catAlign}; font-weight: bold; color: ${theme.headerText}; width: ${catWidth};">${headers.category}</th>
      <th style="border: 1px solid ${theme.borderColor}; padding: 8px 14px; text-align: ${numAlign}; font-weight: bold; color: ${theme.headerText}; width: ${numWidth};">${headers.count}</th>
      <th style="border: 1px solid ${theme.borderColor}; padding: 8px 14px; text-align: ${numAlign}; font-weight: bold; color: ${theme.headerText}; width: ${numWidth};">${headers.percentage}</th>
      ${showCumulative ? `<th style="border: 1px solid ${theme.borderColor}; padding: 8px 14px; text-align: ${numAlign}; font-weight: bold; color: ${theme.headerText}; width: ${numWidth};">${headers.cumulative || "Cumulative %"}</th>` : ""}
    </tr>
  </thead>
  <tbody>
    ${rows
      .map((r, idx) => {
        const rowBg = bandedRows && idx % 2 === 1 ? theme.zebraBg : "#ffffff";
        return `
    <tr style="background-color: ${rowBg}; color: #000000; border: 1px solid ${theme.borderColor};">
      <td style="border: 1px solid ${theme.borderColor}; padding: 7px 14px; text-align: ${catAlign}; color: #000000;">${r.category}</td>
      <td style="border: 1px solid ${theme.borderColor}; padding: 7px 14px; text-align: ${numAlign}; color: #000000;">${r.count}</td>
      <td style="border: 1px solid ${theme.borderColor}; padding: 7px 14px; text-align: ${numAlign}; color: #000000; position: relative;">
        ${
          showDataBars
            ? `<div style="background: linear-gradient(to right, ${theme.accentColor}33 ${r.percentage}%, transparent ${r.percentage}%); padding: 2px 4px; border-radius: 2px;">${r.percentage.toFixed(decimals)}%</div>`
            : `${r.percentage.toFixed(decimals)}%`
        }
      </td>
      ${showCumulative ? `<td style="border: 1px solid ${theme.borderColor}; padding: 7px 14px; text-align: ${numAlign}; color: #000000;">${r.cumulativePercentage.toFixed(decimals)}%</td>` : ""}
    </tr>`;
      })
      .join("")}
    <tr style="background-color: #ffffff; color: #000000; font-weight: bold; border: 1px solid ${theme.borderColor};">
      <td style="border: 1px solid ${theme.borderColor}; padding: 8px 14px; text-align: ${catAlign}; font-weight: bold; color: #000000;">Total</td>
      <td style="border: 1px solid ${theme.borderColor}; padding: 8px 14px; text-align: ${numAlign}; font-weight: bold; color: #000000;">${total}</td>
      <td style="border: 1px solid ${theme.borderColor}; padding: 8px 14px; text-align: ${numAlign}; font-weight: bold; color: #000000;">100.00%</td>
      ${showCumulative ? `<td style="border: 1px solid ${theme.borderColor}; padding: 8px 14px; text-align: ${numAlign}; font-weight: bold; color: #000000;">100.00%</td>` : ""}
    </tr>
  </tbody>
</table>`;
}

interface CategoryBreakdownModuleProps {
  onAppendToDailyEmail?: (htmlTable: string) => void;
}

export function CategoryBreakdownModule({ onAppendToDailyEmail }: CategoryBreakdownModuleProps) {
  const [input, setInput] = React.useState<string>("");
  const [autoTitleCase, setAutoTitleCase] = React.useState<boolean>(true);
  const [normalizeVariations, setNormalizeVariations] = React.useState<boolean>(true);
  const [skipHeaderRow, setSkipHeaderRow] = React.useState<boolean>(true);
  const [sortBy, setSortBy] = React.useState<"count-desc" | "count-asc" | "alpha-asc" | "original">("count-desc");
  const [decimalPlaces, setDecimalPlaces] = React.useState<number>(2);

  // Excel Table Enhancements
  const [bandedRows, setBandedRows] = React.useState<boolean>(false);
  const [showDataBars, setShowDataBars] = React.useState<boolean>(true);
  const [showCumulative, setShowCumulative] = React.useState<boolean>(false);
  const [groupOthersThreshold, setGroupOthersThreshold] = React.useState<number>(0);
  const [categoryAlign, setCategoryAlign] = React.useState<"center" | "left">("center");
  const [numberAlign, setNumberAlign] = React.useState<"center" | "right">("center");
  const [excludedCategories, setExcludedCategories] = React.useState<string[]>([]);
  const [selectedColumnIndex, setSelectedColumnIndex] = React.useState<number>(0);
  const [tableSearchFilter, setTableSearchFilter] = React.useState<string>("");

  const [headerCategory, setHeaderCategory] = React.useState<string>("Category");
  const [headerCount, setHeaderCount] = React.useState<string>("No. of Issues");
  const [headerPercentage, setHeaderPercentage] = React.useState<string>("Percentage");
  const [headerCumulative, setHeaderCumulative] = React.useState<string>("Cumulative %");

  const [copiedType, setCopiedType] = React.useState<"html" | "tsv" | "md" | "csv" | "img" | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const tableRef = React.useRef<HTMLDivElement>(null);

  const currentTheme = SALESFORCE_BLUE_THEME;

  const excludedSet = React.useMemo(() => new Set(excludedCategories), [excludedCategories]);

  const parsed = React.useMemo(() => {
    return parseCategories(input, {
      autoTitleCase,
      normalizeVariations,
      skipHeaderRow,
      sortBy,
      excludedCategories: excludedSet,
      groupOthersThreshold,
      selectedColumnIndex,
    });
  }, [
    input,
    autoTitleCase,
    normalizeVariations,
    skipHeaderRow,
    sortBy,
    excludedSet,
    groupOthersThreshold,
    selectedColumnIndex,
  ]);

  const filteredRows = React.useMemo(() => {
    if (!tableSearchFilter.trim()) return parsed.rows;
    const term = tableSearchFilter.toLowerCase();
    return parsed.rows.filter((r) => r.category.toLowerCase().includes(term));
  }, [parsed.rows, tableSearchFilter]);

  const headersConfig = React.useMemo<HeaderConfig>(
    () => ({
      category: headerCategory.trim() || "Category",
      count: headerCount.trim() || "No. of Issues",
      percentage: headerPercentage.trim() || "Percentage",
      cumulative: headerCumulative.trim() || "Cumulative %",
    }),
    [headerCategory, headerCount, headerPercentage, headerCumulative]
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    try {
      if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        const workbook = xlsx.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (sheetName) {
          const sheet = workbook.Sheets[sheetName];
          if (sheet) {
            const csv = xlsx.utils.sheet_to_csv(sheet);
            setInput(csv);
            setSelectedColumnIndex(0);
            toast.success(`Loaded Excel workbook ${file.name}`);
          }
        }
      } else {
        const text = await file.text();
        setInput(text);
        setSelectedColumnIndex(0);
        toast.success(`Loaded ${file.name}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to read file ${file.name}`);
    }
    e.target.value = "";
  };

  const handleCopyFormattedTable = async () => {
    if (parsed.rows.length === 0) {
      toast.error("No category data to copy!");
      return;
    }

    const html = generateCategoryTableHtml(parsed.rows, parsed.total, headersConfig, {
      theme: currentTheme,
      decimalPlaces,
      showCumulative,
      showDataBars,
      bandedRows,
      categoryAlign,
      numberAlign,
    });

    const tsvCols = [headersConfig.category, headersConfig.count, headersConfig.percentage];
    if (showCumulative) tsvCols.push(headersConfig.cumulative || "Cumulative %");

    const tsv = [
      tsvCols.join("\t"),
      ...parsed.rows.map((r) => {
        const row = [r.category, r.count, `${r.percentage.toFixed(decimalPlaces)}%`];
        if (showCumulative) row.push(`${r.cumulativePercentage.toFixed(decimalPlaces)}%`);
        return row.join("\t");
      }),
      [`Total`, parsed.total, `100.00%`, ...(showCumulative ? ["100.00%"] : [])].join("\t"),
    ].join("\n");

    try {
      if (typeof window !== "undefined" && window.ClipboardItem) {
        const data = [
          new window.ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([tsv], { type: "text/plain" }),
          }),
        ];
        await navigator.clipboard.write(data);
        setCopiedType("html");
        toast.success("Formatted table copied! Paste into Outlook, Word, or Excel.");
      } else {
        await navigator.clipboard.writeText(tsv);
        setCopiedType("tsv");
        toast.success("Table data copied to clipboard.");
      }
    } catch {
      await navigator.clipboard.writeText(tsv);
      setCopiedType("tsv");
      toast.success("Table data copied as text to clipboard.");
    }
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyTsv = async () => {
    if (parsed.rows.length === 0) return;
    const tsvCols = [headersConfig.category, headersConfig.count, headersConfig.percentage];
    if (showCumulative) tsvCols.push(headersConfig.cumulative || "Cumulative %");

    const tsv = [
      tsvCols.join("\t"),
      ...parsed.rows.map((r) => {
        const row = [r.category, r.count, `${r.percentage.toFixed(decimalPlaces)}%`];
        if (showCumulative) row.push(`${r.cumulativePercentage.toFixed(decimalPlaces)}%`);
        return row.join("\t");
      }),
      [`Total`, parsed.total, `100.00%`, ...(showCumulative ? ["100.00%"] : [])].join("\t"),
    ].join("\n");

    await navigator.clipboard.writeText(tsv);
    setCopiedType("tsv");
    toast.success("TSV copied! Ready to paste into Excel cells.");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadCsv = () => {
    if (parsed.rows.length === 0) return;
    const csvRows = [
      [headersConfig.category, headersConfig.count, headersConfig.percentage, ...(showCumulative ? [headersConfig.cumulative || "Cumulative %"] : [])],
      ...parsed.rows.map((r) => [r.category, r.count, `${r.percentage.toFixed(decimalPlaces)}%`, ...(showCumulative ? [`${r.cumulativePercentage.toFixed(decimalPlaces)}%`] : [])]),
      ["Total", parsed.total, "100.00%", ...(showCumulative ? ["100.00%"] : [])],
    ];

    const csvContent = Papa.unparse(csvRows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Category_Summary_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV file downloaded!");
  };

  const handleDownloadExcel = () => {
    if (parsed.rows.length === 0) {
      toast.error("No category data to export!");
      return;
    }
    try {
      // Build Excel Sheet with native formulas
      const numRows = parsed.rows.length;
      const aoa: any[][] = [
        [headersConfig.category, headersConfig.count, headersConfig.percentage, ...(showCumulative ? [headersConfig.cumulative || "Cumulative %"] : [])],
      ];

      parsed.rows.forEach((r, idx) => {
        const rowNum = idx + 2; // 1-indexed Excel row
        const row: any[] = [
          r.category,
          r.count,
          { t: "n", f: `B${rowNum}/$B$${numRows + 2}`, z: "0.00%" },
        ];
        if (showCumulative) {
          row.push({ t: "n", f: `SUM($C$2:C${rowNum})`, z: "0.00%" });
        }
        aoa.push(row);
      });

      // Total Row with Excel SUM formulas
      const totalRow: any[] = [
        "Total",
        { t: "n", f: `SUM(B2:B${numRows + 1})`, z: "#,##0" },
        { t: "n", f: `SUM(C2:C${numRows + 1})`, z: "0.00%" },
      ];
      if (showCumulative) {
        totalRow.push({ t: "n", v: 1, z: "0.00%" });
      }
      aoa.push(totalRow);

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.aoa_to_sheet(aoa);

      ws["!cols"] = [
        { wch: 30 },
        { wch: 18 },
        { wch: 18 },
        ...(showCumulative ? [{ wch: 20 }] : []),
      ];

      xlsx.utils.book_append_sheet(wb, ws, "Category Breakdown");
      const today = new Date().toISOString().slice(0, 10);
      xlsx.writeFile(wb, `Category_Summary_${today}.xlsx`);
      toast.success("Excel (.xlsx) downloaded with native formulas!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate Excel file.");
    }
  };

  const handleDownloadImage = () => {
    if (parsed.rows.length === 0) return;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const scale = 2; // Retina sharpness
      const rowHeight = 36;
      const headerHeight = 44;
      const totalRows = parsed.rows.length + 1; // data + total
      const tableHeight = headerHeight + totalRows * rowHeight;
      const tableWidth = showCumulative ? 600 : 500;
      const padding = 30;

      canvas.width = (tableWidth + padding * 2) * scale;
      canvas.height = (tableHeight + padding * 2) * scale;
      ctx.scale(scale, scale);

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, tableWidth + padding * 2, tableHeight + padding * 2);

      const startX = padding;
      const startY = padding;

      const colWidths = showCumulative
        ? [tableWidth * 0.4, tableWidth * 0.2, tableWidth * 0.2, tableWidth * 0.2]
        : [tableWidth * 0.46, tableWidth * 0.27, tableWidth * 0.27];

      // Draw Header
      ctx.fillStyle = currentTheme.headerBg;
      ctx.fillRect(startX, startY, tableWidth, headerHeight);

      ctx.strokeStyle = currentTheme.borderColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(startX, startY, tableWidth, headerHeight);

      ctx.fillStyle = currentTheme.headerText;
      ctx.font = "bold 14px Calibri, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const headers = [headersConfig.category, headersConfig.count, headersConfig.percentage];
      if (showCumulative) headers.push(headersConfig.cumulative || "Cumulative %");

      let currX = startX;
      headers.forEach((h, i) => {
        const w = colWidths[i] || 100;
        ctx.fillText(h, currX + w / 2, startY + headerHeight / 2);
        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(currX, startY);
          ctx.lineTo(currX, startY + headerHeight);
          ctx.stroke();
        }
        currX += w;
      });

      // Draw Rows
      ctx.font = "14px Calibri, Arial, sans-serif";
      parsed.rows.forEach((r, idx) => {
        const y = startY + headerHeight + idx * rowHeight;
        ctx.fillStyle = bandedRows && idx % 2 === 1 ? currentTheme.zebraBg : "#ffffff";
        ctx.fillRect(startX, y, tableWidth, rowHeight);

        // Data bars if enabled
        if (showDataBars) {
          const barW = (colWidths[2] || 100) * (r.percentage / 100);
          const barX = startX + (colWidths[0] || 0) + (colWidths[1] || 0);
          ctx.fillStyle = `${currentTheme.accentColor}33`;
          ctx.fillRect(barX + 4, y + 4, Math.max(0, barW - 8), rowHeight - 8);
        }

        ctx.strokeStyle = currentTheme.borderColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, y, tableWidth, rowHeight);

        ctx.fillStyle = "#000000";
        let cellX = startX;
        const cellVals = [r.category, String(r.count), `${r.percentage.toFixed(decimalPlaces)}%`];
        if (showCumulative) cellVals.push(`${r.cumulativePercentage.toFixed(decimalPlaces)}%`);

        cellVals.forEach((val, i) => {
          const w = colWidths[i] || 100;
          ctx.textAlign = i === 0 && categoryAlign === "left" ? "left" : "center";
          const textX = i === 0 && categoryAlign === "left" ? cellX + 12 : cellX + w / 2;
          ctx.fillText(val, textX, y + rowHeight / 2);
          if (i > 0) {
            ctx.beginPath();
            ctx.moveTo(cellX, y);
            ctx.lineTo(cellX, y + rowHeight);
            ctx.stroke();
          }
          cellX += w;
        });
      });

      // Total Row
      const totalY = startY + headerHeight + parsed.rows.length * rowHeight;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(startX, totalY, tableWidth, rowHeight);
      ctx.strokeStyle = currentTheme.borderColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(startX, totalY, tableWidth, rowHeight);

      ctx.fillStyle = "#000000";
      ctx.font = "bold 14px Calibri, Arial, sans-serif";

      let cellX = startX;
      const totalVals = ["Total", String(parsed.total), "100.00%"];
      if (showCumulative) totalVals.push("100.00%");

      totalVals.forEach((val, i) => {
        const w = colWidths[i] || 100;
        ctx.textAlign = i === 0 && categoryAlign === "left" ? "left" : "center";
        const textX = i === 0 && categoryAlign === "left" ? cellX + 12 : cellX + w / 2;
        ctx.fillText(val, textX, totalY + rowHeight / 2);
        if (i > 0) {
          ctx.beginPath();
          ctx.moveTo(cellX, totalY);
          ctx.lineTo(cellX, totalY + rowHeight);
          ctx.stroke();
        }
        cellX += w;
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Table_Image_${new Date().toISOString().slice(0, 10)}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("High-res table image downloaded!");
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate image.");
    }
  };

  const handleCopyMarkdown = async () => {
    if (parsed.rows.length === 0) return;
    const mdHeaders = [headersConfig.category, headersConfig.count, headersConfig.percentage];
    if (showCumulative) mdHeaders.push(headersConfig.cumulative || "Cumulative %");

    const md = [
      `| ${mdHeaders.join(" | ")} |`,
      `| ${mdHeaders.map(() => ":---:").join(" | ")} |`,
      ...parsed.rows.map((r) => {
        const row = [r.category, String(r.count), `${r.percentage.toFixed(decimalPlaces)}%`];
        if (showCumulative) row.push(`${r.cumulativePercentage.toFixed(decimalPlaces)}%`);
        return `| ${row.join(" | ")} |`;
      }),
      `| **Total** | **${parsed.total}** | **100.00%** |${showCumulative ? " **100.00%** |" : ""}`,
    ].join("\n");

    await navigator.clipboard.writeText(md);
    setCopiedType("md");
    toast.success("Markdown table copied to clipboard!");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const toggleExcludeCategory = (cat: string) => {
    setExcludedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto w-full">
      {/* ── Left Column: Input & Excel Controls ── */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-slate-200/60 shadow-sm dark:border-white/[0.1] dark:bg-slate-900/40 backdrop-blur-xl">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Layers className="h-4.5 w-4.5 text-blue-500" />
                Category Dataset
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput("")}
                  disabled={!input}
                  className="h-7 px-2 text-[11px] font-semibold text-slate-500 hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Clear
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 px-2.5 text-[11px] font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20"
                >
                  <Upload className="h-3 w-3 mr-1" /> Import Excel/CSV
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv,.xlsx,.xls,.txt"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {/* Quick Sample Loaders */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" /> Quick Samples:
              </span>
              <button
                type="button"
                onClick={() => {
                  setInput(SAMPLE_IMAGE_2);
                  setSelectedColumnIndex(0);
                  toast.info("Loaded 6-item sample from Image 2");
                }}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
              >
                Sample 1 (Image 2)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInput(SAMPLE_IMAGE_1);
                  setSelectedColumnIndex(0);
                  toast.info("Loaded 21-item full list from Image 1");
                }}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
              >
                Sample 2 (Image 1)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInput(SAMPLE_MULTI_COL);
                  setSelectedColumnIndex(1);
                  toast.info("Loaded multi-column Excel sample! Try changing the Grouping Column below.");
                }}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 transition-colors border border-indigo-200 dark:border-indigo-800"
              >
                Multi-Col Excel
              </button>
            </div>

            {/* Multi-Column Pivot Selector (If multi-column detected) */}
            {parsed.detectedHeaders.length > 1 && (
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-blue-600" />
                    Pivot Column Selector ({parsed.detectedHeaders.length} columns found):
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {parsed.detectedHeaders.map((head, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedColumnIndex(idx);
                        setHeaderCategory(head);
                        toast.info(`Now summarizing by: ${head}`);
                      }}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        selectedColumnIndex === idx
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {head}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Category items or Excel column</span>
                <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-800/40">
                  {parsed.rawCount} item{parsed.rawCount === 1 ? "" : "s"} detected
                </span>
              </div>
              <Textarea
                placeholder={"Paste categories or full Excel column here, e.g.:\nData update\nData update\nBug\nAwareness issue"}
                className="min-h-[160px] resize-y bg-white dark:bg-black/40 border-slate-200 dark:border-slate-700/50 font-mono text-[11.5px] leading-relaxed text-slate-900 dark:text-slate-200 focus-visible:ring-blue-500/30 rounded-xl"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            {/* ── Excel Advanced Table Features (Ribbon Style) ── */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-500" />
                Excel Table Features & Options
              </div>

              {/* Excel Table Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={showDataBars}
                    onChange={(e) => setShowDataBars(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Data Bars</div>
                    <div className="text-[10px] text-slate-500">In-cell visual volume bar</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={showCumulative}
                    onChange={(e) => setShowCumulative(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Cumulative %</div>
                    <div className="text-[10px] text-slate-500">Pareto (80/20) column</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={bandedRows}
                    onChange={(e) => setBandedRows(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Banded Rows</div>
                    <div className="text-[10px] text-slate-500">Zebra alternating row tint</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={normalizeVariations}
                    onChange={(e) => setNormalizeVariations(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Group Variations</div>
                    <div className="text-[10px] text-slate-500">Data updated → Data Update</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={autoTitleCase}
                    onChange={(e) => setAutoTitleCase(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Auto Title Case</div>
                    <div className="text-[10px] text-slate-500">Capitalize words cleanly</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 cursor-pointer hover:bg-slate-100/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={skipHeaderRow}
                    onChange={(e) => setSkipHeaderRow(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Ignore Header Row</div>
                    <div className="text-[10px] text-slate-500">Skip first header title</div>
                  </div>
                </label>
              </div>

              {/* Decimals & Long-Tail Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Percentage Decimals</span>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((dec) => (
                      <button
                        key={dec}
                        type="button"
                        onClick={() => setDecimalPlaces(dec)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded border transition-all ${
                          decimalPlaces === dec
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        {dec} dec
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Group Small Items (&lt; X%)</span>
                  <div className="flex items-center gap-1">
                    {[0, 5, 10].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setGroupOthersThreshold(val)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all ${
                          groupOthersThreshold === val
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        {val === 0 ? "Off" : `< ${val}%`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sort Order Selector */}
              <div className="space-y-1 pt-1">
                <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" /> Sort Order:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                  {[
                    { id: "count-desc", label: "Highest First" },
                    { id: "count-asc", label: "Lowest First" },
                    { id: "alpha-asc", label: "A to Z" },
                    { id: "original", label: "Original Order" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSortBy(item.id as any)}
                      className={`py-1.5 px-2 rounded-lg font-bold border transition-all text-center ${
                        sortBy === item.id
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Excluded items reset alert */}
              {excludedCategories.length > 0 && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
                  <span className="text-amber-700 dark:text-amber-300 font-medium">
                    {excludedCategories.length} category hidden from calculation
                  </span>
                  <button
                    type="button"
                    onClick={() => setExcludedCategories([])}
                    className="text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Restore all
                  </button>
                </div>
              )}

              {/* Custom Column Titles */}
              <div className="pt-1">
                <details className="text-xs group">
                  <summary className="font-bold text-slate-600 dark:text-slate-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors select-none">
                    + Custom Column Headers & Alignments
                  </summary>
                  <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Col 1</span>
                        <Input
                          value={headerCategory}
                          onChange={(e) => setHeaderCategory(e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Col 2</span>
                        <Input
                          value={headerCount}
                          onChange={(e) => setHeaderCount(e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">Col 3</span>
                        <Input
                          value={headerPercentage}
                          onChange={(e) => setHeaderPercentage(e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500">Category Align:</span>
                        <button
                          type="button"
                          onClick={() => setCategoryAlign("center")}
                          className={`px-2 py-0.5 rounded border text-[10px] font-bold ${categoryAlign === "center" ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800"}`}
                        >
                          Center
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryAlign("left")}
                          className={`px-2 py-0.5 rounded border text-[10px] font-bold ${categoryAlign === "left" ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800"}`}
                        >
                          Left
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500">Numbers Align:</span>
                        <button
                          type="button"
                          onClick={() => setNumberAlign("center")}
                          className={`px-2 py-0.5 rounded border text-[10px] font-bold ${numberAlign === "center" ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800"}`}
                        >
                          Center
                        </button>
                        <button
                          type="button"
                          onClick={() => setNumberAlign("right")}
                          className={`px-2 py-0.5 rounded border text-[10px] font-bold ${numberAlign === "right" ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800"}`}
                        >
                          Right
                        </button>
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Right Column: Interactive Table Preview & Arsenal of Exports ── */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="border-slate-200/60 shadow-sm dark:border-white/[0.1] dark:bg-slate-900/40 backdrop-blur-xl flex flex-col">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Table className="h-4.5 w-4.5 text-blue-500" />
                Table Preview
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {currentTheme.name}
                </span>
              </CardTitle>
            </div>

            {/* Comprehensive Excel Export Arsenal */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyTsv}
                disabled={parsed.rows.length === 0}
                className="h-8 text-xs font-semibold border-slate-200 dark:border-slate-700"
                title="Copy as Tab-Separated Values for direct Excel pasting"
              >
                {copiedType === "tsv" ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" /> : <FileText className="h-3.5 w-3.5 mr-1" />}
                Copy TSV
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadImage}
                disabled={parsed.rows.length === 0}
                className="h-8 text-xs font-semibold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                title="Download high-resolution image of this table for slides or chats"
              >
                <ImageIcon className="h-3.5 w-3.5 mr-1 text-purple-500" />
                Image (PNG)
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadExcel}
                disabled={parsed.rows.length === 0}
                className="h-8 text-xs font-bold gap-1.5 bg-[#107c41] hover:bg-[#185c37] text-white border-none shadow-sm"
                title="Download real Excel file with SUM() formulas and formatting"
              >
                <Download className="h-3.5 w-3.5" />
                Excel (.xlsx)
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyFormattedTable}
                disabled={parsed.rows.length === 0}
                className="h-8 text-xs font-bold gap-1.5 bg-[#0078d4] hover:bg-[#106ebe] text-white shadow-sm"
                title="Copy Rich HTML with exact colors and grid borders for Outlook & Word"
              >
                {copiedType === "html" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedType === "html" ? "Copied HTML!" : "Copy Table"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
            {parsed.rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
                <Table className="h-12 w-12 mb-3 opacity-20" />
                <p className="font-bold text-base mb-1">No Data to Display</p>
                <p className="text-xs max-w-sm">
                  Paste a list of issue categories or click &quot;Sample 1 (Image 2)&quot; to view the generated summary table.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Search / Filter Input */}
                {parsed.rows.length > 5 && (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        placeholder="Search category in table..."
                        value={tableSearchFilter}
                        onChange={(e) => setTableSearchFilter(e.target.value)}
                        className="h-8 pl-8 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* ── Table Container (Renders authentic Excel styling) ── */}
                <div
                  ref={tableRef}
                  className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800"
                >
                  <div
                    id="category-summary-table-view"
                    className="w-full max-w-[500px] shadow-sm overflow-hidden"
                    style={{
                      fontFamily: "Calibri, 'Segoe UI', Arial, sans-serif",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        border: `1px solid ${currentTheme.borderColor}`,
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        fontSize: "14px",
                        textAlign: "center",
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor: currentTheme.headerBg,
                            color: currentTheme.headerText,
                            fontWeight: "bold",
                            border: `1px solid ${currentTheme.borderColor}`,
                          }}
                        >
                          <th
                            style={{
                              border: `1px solid ${currentTheme.borderColor}`,
                              padding: "8px 14px",
                              textAlign: categoryAlign,
                              fontWeight: "bold",
                              color: currentTheme.headerText,
                              width: showCumulative ? "38%" : "44%",
                            }}
                          >
                            {headersConfig.category}
                          </th>
                          <th
                            style={{
                              border: `1px solid ${currentTheme.borderColor}`,
                              padding: "8px 14px",
                              textAlign: numberAlign,
                              fontWeight: "bold",
                              color: currentTheme.headerText,
                              width: showCumulative ? "20%" : "28%",
                            }}
                          >
                            {headersConfig.count}
                          </th>
                          <th
                            style={{
                              border: `1px solid ${currentTheme.borderColor}`,
                              padding: "8px 14px",
                              textAlign: numberAlign,
                              fontWeight: "bold",
                              color: currentTheme.headerText,
                              width: showCumulative ? "22%" : "28%",
                            }}
                          >
                            {headersConfig.percentage}
                          </th>
                          {showCumulative && (
                            <th
                              style={{
                                border: `1px solid ${currentTheme.borderColor}`,
                                padding: "8px 14px",
                                textAlign: numberAlign,
                                fontWeight: "bold",
                                color: currentTheme.headerText,
                                width: "20%",
                              }}
                            >
                              {headersConfig.cumulative}
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.map((row, idx) => {
                          const isBanded = bandedRows && idx % 2 === 1;
                          return (
                            <tr
                              key={idx}
                              className="group hover:bg-blue-50/40 transition-colors"
                              style={{
                                backgroundColor: isBanded ? currentTheme.zebraBg : "#ffffff",
                                color: "#000000",
                                border: `1px solid ${currentTheme.borderColor}`,
                              }}
                            >
                              <td
                                style={{
                                  border: `1px solid ${currentTheme.borderColor}`,
                                  padding: "7px 14px",
                                  textAlign: categoryAlign,
                                  position: "relative",
                                }}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span>{row.category}</span>
                                  <button
                                    type="button"
                                    onClick={() => toggleExcludeCategory(row.category)}
                                    title="Exclude from summary"
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5"
                                  >
                                    <EyeOff className="h-3 w-3" />
                                  </button>
                                </div>
                              </td>
                              <td
                                style={{
                                  border: `1px solid ${currentTheme.borderColor}`,
                                  padding: "7px 14px",
                                  textAlign: numberAlign,
                                }}
                              >
                                {row.count}
                              </td>
                              <td
                                style={{
                                  border: `1px solid ${currentTheme.borderColor}`,
                                  padding: "7px 14px",
                                  textAlign: numberAlign,
                                  position: "relative",
                                }}
                              >
                                {showDataBars ? (
                                  <div className="relative w-full flex items-center justify-center">
                                    <div
                                      className="absolute left-0 top-0 bottom-0 rounded-sm opacity-25"
                                      style={{
                                        width: `${Math.min(100, row.percentage)}%`,
                                        backgroundColor: currentTheme.accentColor,
                                      }}
                                    />
                                    <span className="relative z-10 font-medium">
                                      {row.percentage.toFixed(decimalPlaces)}%
                                    </span>
                                  </div>
                                ) : (
                                  `${row.percentage.toFixed(decimalPlaces)}%`
                                )}
                              </td>
                              {showCumulative && (
                                <td
                                  style={{
                                    border: `1px solid ${currentTheme.borderColor}`,
                                    padding: "7px 14px",
                                    textAlign: numberAlign,
                                  }}
                                >
                                  {row.cumulativePercentage.toFixed(decimalPlaces)}%
                                </td>
                              )}
                            </tr>
                          );
                        })}
                        <tr
                          style={{
                            backgroundColor: "#ffffff",
                            color: "#000000",
                            fontWeight: "bold",
                            border: `1px solid ${currentTheme.borderColor}`,
                          }}
                        >
                          <td
                            style={{
                              border: `1px solid ${currentTheme.borderColor}`,
                              padding: "8px 14px",
                              textAlign: categoryAlign,
                              fontWeight: "bold",
                            }}
                          >
                            Total
                          </td>
                          <td
                            style={{
                              border: `1px solid ${currentTheme.borderColor}`,
                              padding: "8px 14px",
                              textAlign: numberAlign,
                              fontWeight: "bold",
                            }}
                          >
                            {parsed.total}
                          </td>
                          <td
                            style={{
                              border: `1px solid ${currentTheme.borderColor}`,
                              padding: "8px 14px",
                              textAlign: numberAlign,
                              fontWeight: "bold",
                            }}
                          >
                            100.00%
                          </td>
                          {showCumulative && (
                            <td
                              style={{
                                border: `1px solid ${currentTheme.borderColor}`,
                                padding: "8px 14px",
                                textAlign: numberAlign,
                                fontWeight: "bold",
                              }}
                            >
                              100.00%
                            </td>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap items-center justify-between w-full max-w-[500px] text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: currentTheme.headerBg }}
                      />
                      Header: <strong>{currentTheme.name}</strong> ({currentTheme.headerBg})
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {showDataBars ? "Data Bars Active" : "Clean Grid"}
                    </span>
                  </div>
                </div>

                {/* ── Mini Visual Distribution (Excel Bar Chart Style) ── */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
                      Visual Distribution (Excel Chart)
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Relative Share of {parsed.total} issues
                    </span>
                  </div>

                  <div className="space-y-2">
                    {parsed.rows.map((r, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          <span className="truncate max-w-[240px]">{r.category}</span>
                          <span className="font-mono text-slate-500">
                            {r.count} ({r.percentage.toFixed(decimalPlaces)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-200/70 dark:bg-slate-700/60 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${r.percentage}%`,
                              backgroundColor: currentTheme.accentColor,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Executive Summary KPI Badges ── */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 text-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total Issues</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">{parsed.total}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 text-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Unique Categories</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">{parsed.rows.length}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 text-center truncate">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block truncate">Top Category</span>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400 truncate block">
                      {parsed.rows[0] ? `${parsed.rows[0].category} (${parsed.rows[0].percentage.toFixed(decimalPlaces)}%)` : "—"}
                    </span>
                  </div>
                </div>

                {/* Add to Daily Report Email Affordance */}
                {onAppendToDailyEmail && (
                  <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-900 dark:text-blue-300">
                        Include in Daily Status Email Draft
                      </p>
                      <p className="text-[11px] text-blue-700/80 dark:text-blue-400/80">
                        Appends this category table to your active daily report email draft.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        const html = generateCategoryTableHtml(parsed.rows, parsed.total, headersConfig, {
                          theme: currentTheme,
                          decimalPlaces,
                          showCumulative,
                          showDataBars,
                          bandedRows,
                          categoryAlign,
                          numberAlign,
                        });
                        onAppendToDailyEmail(html);
                        toast.success("Category table appended to daily email report!");
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                    >
                      Add to Daily Email
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Export Footer Options */}
            <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-1.5">
                💡 <strong>Tip:</strong> Click <strong>&quot;Copy Table&quot;</strong> and paste directly into Outlook, Gmail, or Microsoft Word.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="text-[11px] font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                >
                  Download CSV
                </button>
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="text-[11px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  {copiedType === "md" ? "✓ Copied Markdown" : "Copy Markdown"}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
