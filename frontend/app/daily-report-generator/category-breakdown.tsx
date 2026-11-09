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
  Zap,
  Building2,
  Calendar,
  Share2,
  MessageSquare,
  ClipboardList,
  CheckCheck,
  FileDown,
  Printer,
  History,
  TrendingUp,
  TrendingDown,
  Wand2,
} from "lucide-react";
import * as xlsx from "xlsx";
import Papa from "papaparse";
import { cn } from "@/lib/utils";
import { ModernCalendarPicker } from "@/components/ui/modern-calendar-picker";
import { WhatsAppChatBubbleSimulator } from "@/components/daily-report/whatsapp-chat-bubble-simulator";
import { ReportHistoryDrawer } from "@/components/daily-report/report-history-drawer";
import {
  saveReportSnapshot,
  loadReportHistory,
  compareWithPreviousReport,
  type DailyReportSnapshot,
  type ReportDiffResult,
} from "@/lib/daily-report-history";

export type ReportMode = "UCPG" | "CPSD";

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

// ── Sample 1 & 2 from legacy quick samples ──
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

export function getDynamicSampleUCPG(): string {
  const d = new Date();
  const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  return `Date\tNo\tIssue\tSupport request number\tReason\tIssue type\tReported by
${dateStr}\t1\tNeed compressor warranty\t2713009\tUpdated as eligible\tData update\tNk
\t2\tOTP validate issue\t27127281\tOTP not encrypted \tBug\tNaveen 
\t3\tSO PR generated\t27132178\tStd warranty ended and model not in pcb and in comp wty terms\tAwareness issueq\tRatul
\t4\tCSI link issue\t27099264\tFeedback link already sent\tAwareness issueq\tKrishnendu De
\t5\tSO PR getting generated \t27133367\tWty end date was wrong \tData update\tRohan
\t6\tAsset transfer \t27109870\tDetails not given in standard format \tData update\tLokesh Sahu
\t7\tDOP update as per invoice\t27094729\t90 days different, updated following the cus invoice\tData update\tMayur Lad
\t8\tNot able to complete the call \t27092849\tOtp validate issue \tBug\tMayur Lad
\t9\tAsset transfer \t27133708\tUnit sold in kalyan but registered in hyd \tData update\tRohan
\t10\tPCB policy need to update\t27134504\tPCB policy need to update\tData update\tNk
\t11\tUNABLE TO GRN\t27134608\tGRN is not happening by portal\tBug\tNk`;
}

export function getDynamicSampleCPSD(): string {
  const d = new Date();
  const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  return `Date\tNo\tIssue\tSupport request number\tReason\tIssue type\tReported by
${dateStr}\t1\tCompressor serial mismatch\t2812001\tVerified with invoice\tData update\tSuresh
\t2\tPortal login timeout\t2812045\tSession token expired\tBug\tPriya
\t3\tOut of warranty claim\t2812110\tCustomer informed of terms\tAwareness issueq\tAmit
\t4\tGRN status pending\t2812234\tERP sync delayed\tBug\tSuresh
\t5\tWarranty extension request\t2812350\tApproved as per scheme\tData update\tRajesh
\t6\tAMC contract verification\t2812412\tContract details updated\tData update\tPriya
\t7\tDispatch link broken\t2812555\tLink regenerated\tBug\tAmit
\t8\tWrong model in job card\t2812678\tModel number corrected\tData update\tRajesh`;
}

export const SAMPLE_UCPG = getDynamicSampleUCPG();
export const SAMPLE_UPSD = SAMPLE_UCPG;
export const SAMPLE_CPSD = getDynamicSampleCPSD();

// ── Single-Column Column F Categories Only ──
export const SAMPLE_CATEGORY_ITEMS_ONLY = `Data update
Bug
Awareness issueq
Awareness issueq
Data update
Data update
Data update
Bug
Data update
Data update
Bug`;

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
  "awareness issueq": "Awareness Issue", // Maps common typo 'issueq' to 'Awareness Issue'
  "user awareness": "Awareness Issue",
  "user awareness issue": "Awareness Issue",
  "awareness": "Awareness Issue",
  "bug": "Bug",
  "bugs": "Bug",
  "software bug": "Bug",
  "bug fix": "Bug",
  "new requirement": "New Requirement",
  "new requirements": "New Requirement",
  "requirement": "New Requirement",
  "requirements": "New Requirement",
  "feature request": "New Requirement",
  "cr": "New Requirement",
  "change request": "New Requirement",
  "access issue": "Access Issue",
  "access issues": "Access Issue",
  "query": "Query",
  "queries": "Query",
  "configuration": "Configuration Issue",
  "configuration issue": "Configuration Issue",
  "enhancement": "Enhancement",
  "enhancements": "Enhancement",
  // Common service ops abbreviations & typos (Advancement 2)
  "data updt": "Data Update",
  "data upd": "Data Update",
  "data updating": "Data Update",
  "comp wty": "Compressor Warranty",
  "comp warranty": "Compressor Warranty",
  "compressor wty": "Compressor Warranty",
  "pcb wty": "PCB Warranty",
  "cancellation req": "Cancellation Request",
  "cancel req": "Cancellation Request",
  "cancel request": "Cancellation Request",
  "cancellation": "Cancellation Request",
  "tech issue": "Technical Issue",
  "tech support": "Technical Support",
  "technical issue": "Technical Issue",
  "otp issue": "OTP Issue",
  "otp validate issue": "OTP Issue",
  "part delay": "Spare Part Delay",
  "spare part delay": "Spare Part Delay",
  "part requirement": "Spare Part Requirement",
  "asset transfer": "Asset Transfer",
  "asset trsf": "Asset Transfer",
  "grn issue": "GRN Issue",
  "dop update": "DOP Update",
};

export const STANDARD_DAILY_HEADERS = [
  "Date",
  "No",
  "Issue",
  "Support request number",
  "Reason",
  "Issue type",
  "Reported by",
];

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

export function getLocalTodayIso(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatReportDate(dateStr?: string) {
  let d: Date;
  if (dateStr) {
    const [yearStr, monthStr, dayStr] = dateStr.split("-");
    if (yearStr && monthStr && dayStr) {
      d = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
    } else {
      d = new Date(dateStr);
    }
  } else {
    d = new Date();
  }
  if (isNaN(d.getTime())) d = new Date();

  const day = String(d.getDate()).padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthAlpha = monthNames[d.getMonth()];
  const monthNum = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return {
    alphaDate: `${day}${monthAlpha}${year}`, // e.g. 07Nov2026
    numericDate: `${day}-${monthNum}-${year}`, // e.g. 07-11-2026
    isoDate: `${year}-${monthNum}-${day}`, // e.g. 2026-11-07
  };
}

export interface DetectedVariation {
  raw: string;
  normalized: string;
  count: number;
}

// ── Smart Date Extractor from Sheet Data (e.g. 7/11/2026, 07-11-2026, 2026-11-07) ──
export function extractDateFromRows(rows: string[][]): string | null {
  for (const row of rows) {
    if (!row || !Array.isArray(row)) continue;
    // Check first 3 columns of data rows
    for (let col = 0; col < Math.min(row.length, 3); col++) {
      const cell = String(row[col] || "").trim();
      if (!cell) continue;

      // Matches D/M/YYYY or DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
      const dmyMatch = cell.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
      if (dmyMatch && dmyMatch[1] && dmyMatch[2] && dmyMatch[3]) {
        const d = parseInt(dmyMatch[1], 10);
        const m = parseInt(dmyMatch[2], 10);
        const y = parseInt(dmyMatch[3], 10);
        if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        }
      }

      // Matches YYYY-MM-DD
      const ymdMatch = cell.match(/^(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})$/);
      if (ymdMatch && ymdMatch[1] && ymdMatch[2] && ymdMatch[3]) {
        const y = parseInt(ymdMatch[1], 10);
        const m = parseInt(ymdMatch[2], 10);
        const d = parseInt(ymdMatch[3], 10);
        if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
          return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        }
      }
    }
  }
  return null;
}

export interface ParsedCategoryResult {
  rows: CategoryRow[];
  total: number;
  rawCount: number;
  detectedHeaders: string[];
  rawRows?: string[][];
  isMultiColumn?: boolean;
  selectedColumnIndex: number;
  detectedDate?: string | null;
  detectedVariations: DetectedVariation[];
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
): ParsedCategoryResult {
  if (!rawInput.trim()) {
    return {
      rows: [],
      total: 0,
      rawCount: 0,
      detectedHeaders: [],
      rawRows: [],
      isMultiColumn: false,
      selectedColumnIndex: 0,
      detectedDate: null,
      detectedVariations: [],
    };
  }

  const rawTrimmed = rawInput.trim();
  const isDelimited = rawTrimmed.includes("\t") || rawTrimmed.includes(",");

  let detectedHeaders: string[] = [];
  let colIndex = options.selectedColumnIndex ?? -1;
  let rawRows: string[][] = [];
  let parsedItems: string[] = [];
  let isMultiColumn = false;

  if (isDelimited) {
    const isTab = rawTrimmed.includes("\t");
    const parsedCsv = Papa.parse<string[]>(rawInput, {
      delimiter: isTab ? "\t" : ",",
      skipEmptyLines: "greedy",
    });

    if (parsedCsv.data && parsedCsv.data.length > 0) {
      const validRows = parsedCsv.data.filter(
        (row) => Array.isArray(row) && row.some((cell) => cell && String(cell).trim().length > 0)
      );

      if (validRows.length > 0) {
        const firstRow = validRows[0];
        if (firstRow && Array.isArray(firstRow) && firstRow.length > 1) {
          isMultiColumn = true;

          // Check if firstRow is an actual header row or if it is already data
          // A row is data if:
          // 1. Cell 0 is a date (e.g. 7/11/2026, 2026-11-07, 07-11-2026)
          // 2. Cell 1 is an integer row index like '1' (not 'No' or 'No.')
          // 3. Or Cell 5 is a known issue type value ('Data update', 'Bug', 'Awareness issueq', etc.)
          const cell0 = String(firstRow[0] || "").trim();
          const cell1 = String(firstRow[1] || "").trim();
          const cell5 = String(firstRow[5] || "").trim().toLowerCase();

          const isCell0Date = /^\d{1,4}[\/\.-]\d{1,2}[\/\.-]\d{1,4}$/.test(cell0);
          const isCell1Number = /^\d+$/.test(cell1);
          const isCell5DataValue = [
            "data update",
            "data updated",
            "bug",
            "awareness issue",
            "awareness issueq",
            "new requirement",
            "requirement",
          ].includes(cell5);

          const hasHeaderKeywords = firstRow.some((cell) =>
            /^(date|no\.?|issue|support\s*request|reason|issue\s*type|reported\s*by|category)$/i.test(
              String(cell || "").trim()
            )
          );

          // A row is a header ONLY if it matches header keywords and is not a date, number, or category data
          const isFirstRowHeader = hasHeaderKeywords && !isCell0Date && !isCell1Number && !isCell5DataValue;

          let dataRows: string[][];

          if (isFirstRowHeader) {
            detectedHeaders = firstRow.map((h, idx) => {
              const trimmed = String(h || "").trim();
              return trimmed || `Col ${String.fromCharCode(65 + idx)}`;
            });
            dataRows = options.skipHeaderRow ? validRows.slice(1) : validRows;
            rawRows = validRows.map((r) => r.map((c) => String(c || "").trim()));
          } else {
            // User pasted data rows directly without header!
            // Auto-supply standard Salesforce Daily Report headers at 1st row:
            if (firstRow.length >= 6) {
              detectedHeaders = [...STANDARD_DAILY_HEADERS];
              if (firstRow.length > STANDARD_DAILY_HEADERS.length) {
                for (let i = STANDARD_DAILY_HEADERS.length; i < firstRow.length; i++) {
                  detectedHeaders.push(`Col ${String.fromCharCode(65 + i)}`);
                }
              }
            } else {
              detectedHeaders = firstRow.map((_, idx) => `Col ${String.fromCharCode(65 + idx)}`);
            }

            const cleanDataRows = validRows.map((r) => r.map((c) => String(c || "").trim()));
            rawRows = [detectedHeaders, ...cleanDataRows];
            dataRows = validRows; // Preserve ALL data records, do NOT skip row 0!
          }

          // Auto-detect Column F ("Issue type") if colIndex was not explicitly set or is -1
          if (options.selectedColumnIndex === undefined || options.selectedColumnIndex === -1) {
            // Priority 1: Specifically match "issue type" or "issue_type"
            const issueTypeIdx = detectedHeaders.findIndex((h) =>
              /issue\s*type|issue_type/i.test(h)
            );
            if (issueTypeIdx !== -1) {
              colIndex = issueTypeIdx;
            } else if (detectedHeaders.length >= 6) {
              // Priority 2: Standard Column F (index 5)
              colIndex = 5;
            } else {
              // Priority 3: Fallback to category / type / status
              const autoFound = detectedHeaders.findIndex((h) =>
                /category|type|status/i.test(h)
              );
              colIndex = autoFound !== -1 ? autoFound : 0;
            }
          } else {
            colIndex = Math.min(options.selectedColumnIndex, detectedHeaders.length - 1);
          }

          parsedItems = dataRows
            .map((row) =>
              Array.isArray(row) && row[colIndex] !== undefined ? String(row[colIndex]).trim() : ""
            )
            .filter((val) => val.length > 0);
        }
      }
    }
  }

  // Fallback for single column list
  if (!isMultiColumn) {
    let lines = rawInput
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const checkFirst = lines[0];
    if (checkFirst && options.skipHeaderRow) {
      const firstLower = checkFirst.toLowerCase().trim();
      if (
        COMMON_HEADERS.has(firstLower) ||
        firstLower.includes("category") ||
        firstLower.includes("issue type")
      ) {
        lines = lines.slice(1);
      }
    }
    parsedItems = lines;
    rawRows = parsedItems.map((item) => [item]);
    colIndex = 0;
  }

  const rawCount = parsedItems.length;
  if (rawCount === 0) {
    return {
      rows: [],
      total: 0,
      rawCount: 0,
      detectedHeaders,
      rawRows,
      isMultiColumn,
      selectedColumnIndex: colIndex,
      detectedDate: null,
      detectedVariations: [],
    };
  }

  const excluded = options.excludedCategories || new Set<string>();
  const countMap = new Map<string, number>();
  const firstSeenOrder: string[] = [];
  const variationMapTracker = new Map<string, { raw: string; normalized: string; count: number }>();

  let activeTotal = 0;

  for (const item of parsedItems) {
    let clean = item.replace(/^["']|["']$/g, "").trim();
    if (!clean) continue;

    const lower = clean.toLowerCase();
    const mapped = VARIATION_MAP[lower];
    if (mapped && (clean.toLowerCase() !== mapped.toLowerCase() || clean !== mapped)) {
      const key = `${clean}:::${mapped}`;
      const existing = variationMapTracker.get(key);
      if (existing) {
        existing.count++;
      } else {
        variationMapTracker.set(key, { raw: clean, normalized: mapped, count: 1 });
      }
    }

    if (options.normalizeVariations && mapped) {
      clean = mapped;
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
    return {
      rows: [],
      total: 0,
      rawCount,
      detectedHeaders,
      rawRows,
      isMultiColumn,
      selectedColumnIndex: colIndex,
      detectedDate: null,
      detectedVariations: Array.from(variationMapTracker.values()),
    };
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

  const detectedVariations = Array.from(variationMapTracker.values());
  const detectedDate = isMultiColumn && rawRows && rawRows.length > 0 ? extractDateFromRows(rawRows) : null;

  return {
    rows: finalRows,
    total: activeTotal,
    rawCount,
    detectedHeaders,
    rawRows,
    isMultiColumn,
    selectedColumnIndex: colIndex,
    detectedDate,
    detectedVariations,
  };
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
      <th style="border: 1px solid ${theme.borderColor}; background-color: ${theme.headerBg}; padding: 8px 14px; text-align: ${catAlign}; font-weight: bold; color: ${theme.headerText}; width: ${catWidth};">${headers.category}</th>
      <th style="border: 1px solid ${theme.borderColor}; background-color: ${theme.headerBg}; padding: 8px 14px; text-align: ${numAlign}; font-weight: bold; color: ${theme.headerText}; width: ${numWidth};">${headers.count}</th>
      <th style="border: 1px solid ${theme.borderColor}; background-color: ${theme.headerBg}; padding: 8px 14px; text-align: ${numAlign}; font-weight: bold; color: ${theme.headerText}; width: ${numWidth};">${headers.percentage}</th>
      ${showCumulative ? `<th style="border: 1px solid ${theme.borderColor}; background-color: ${theme.headerBg}; padding: 8px 14px; text-align: ${numAlign}; font-weight: bold; color: ${theme.headerText}; width: ${numWidth};">${headers.cumulative || "Cumulative %"}</th>` : ""}
    </tr>
  </thead>
  <tbody>
    ${rows
      .map((r, idx) => {
        const isBanded = bandedRows && idx % 2 === 1;
        const rowBg = isBanded ? theme.zebraBg : "#ffffff";
        return `
    <tr style="background-color: ${rowBg}; color: #000000; border: 1px solid ${theme.borderColor};">
      <td style="border: 1px solid ${theme.borderColor}; padding: 7px 14px; text-align: ${catAlign};">${r.category}</td>
      <td style="border: 1px solid ${theme.borderColor}; padding: 7px 14px; text-align: ${numAlign};">${r.count}</td>
      <td style="border: 1px solid ${theme.borderColor}; padding: 7px 14px; text-align: ${numAlign}; position: relative;">
        ${showDataBars ? `<div style="display: inline-block; background-color: #e0f2fe; width: ${r.percentage}%; height: 100%; position: absolute; left: 0; top: 0; opacity: 0.6; z-index: 1;"></div>` : ""}
        <span style="position: relative; z-index: 2;">${r.percentage.toFixed(decimals)}%</span>
      </td>
      ${showCumulative ? `<td style="border: 1px solid ${theme.borderColor}; padding: 7px 14px; text-align: ${numAlign};">${r.cumulativePercentage.toFixed(decimals)}%</td>` : ""}
    </tr>`;
      })
      .join("")}
    <tr style="background-color: #ffffff; color: #000000; font-weight: bold; border: 1px solid ${theme.borderColor};">
      <td style="border: 1px solid ${theme.borderColor}; padding: 8px 14px; text-align: ${catAlign}; font-weight: bold;">Total</td>
      <td style="border: 1px solid ${theme.borderColor}; padding: 8px 14px; text-align: ${numAlign}; font-weight: bold;">${total}</td>
      <td style="border: 1px solid ${theme.borderColor}; padding: 8px 14px; text-align: ${numAlign}; font-weight: bold;">100.00%</td>
      ${showCumulative ? `<td style="border: 1px solid ${theme.borderColor}; padding: 8px 14px; text-align: ${numAlign}; font-weight: bold;">100.00%</td>` : ""}
    </tr>
  </tbody>
</table>`;
}

interface CategoryBreakdownModuleProps {
  onAppendToDailyEmail?: (htmlTable: string) => void;
}

export function CategoryBreakdownModule({ onAppendToDailyEmail }: CategoryBreakdownModuleProps) {
  // ── Mode Switcher: UCPG vs CPSD ──
  const [reportMode, setReportMode] = React.useState<ReportMode>("UCPG");
  const [reportDate, setReportDate] = React.useState<string>(getLocalTodayIso);
  const [pasteMode, setPasteMode] = React.useState<"auto" | "full-sheet" | "single-col">("auto");
  const [previewTab, setPreviewTab] = React.useState<"summary" | "sheet">("summary");

  const [input, setInput] = React.useState<string>("");

  // Department name is strictly the current mode: "UCPG" or "CPSD"
  const activeDepartment = reportMode;
  const [autoTitleCase, setAutoTitleCase] = React.useState<boolean>(true);
  const [normalizeVariations, setNormalizeVariations] = React.useState<boolean>(true);
  const [skipHeaderRow, setSkipHeaderRow] = React.useState<boolean>(true);
  const [sortBy, setSortBy] = React.useState<"count-desc" | "count-asc" | "alpha-asc" | "original">(
    "count-desc"
  );
  const [decimalPlaces, setDecimalPlaces] = React.useState<number>(2);

  // Excel Table Enhancements
  const [bandedRows, setBandedRows] = React.useState<boolean>(false);
  const [showDataBars, setShowDataBars] = React.useState<boolean>(true);
  const [showCumulative, setShowCumulative] = React.useState<boolean>(false);
  const [groupOthersThreshold, setGroupOthersThreshold] = React.useState<number>(0);
  const [categoryAlign, setCategoryAlign] = React.useState<"center" | "left">("center");
  const [numberAlign, setNumberAlign] = React.useState<"center" | "right">("center");
  const [excludedCategories, setExcludedCategories] = React.useState<string[]>([]);
  const [selectedColumnIndex, setSelectedColumnIndex] = React.useState<number>(-1); // -1 = Auto
  const [tableSearchFilter, setTableSearchFilter] = React.useState<string>("");

  const [headerCategory, setHeaderCategory] = React.useState<string>("Category");
  const [headerCount, setHeaderCount] = React.useState<string>("No. of Issues");
  const [headerPercentage, setHeaderPercentage] = React.useState<string>("Percentage");
  const [headerCumulative, setHeaderCumulative] = React.useState<string>("Cumulative %");

  const [copiedType, setCopiedType] = React.useState<
    "html" | "tsv" | "md" | "csv" | "img" | "caption" | null
  >(null);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const tableRef = React.useRef<HTMLDivElement>(null);
  const lastDetectedDateRef = React.useRef<string | null>(null);

  // ── Advancement 1 & 3: History, Diffs & Live Image State ──
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = React.useState<boolean>(false);
  const [historySnapshots, setHistorySnapshots] = React.useState<DailyReportSnapshot[]>([]);
  const [tablePreviewUrl, setTablePreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setHistorySnapshots(loadReportHistory());
    }
  }, [isHistoryDrawerOpen]);

  const currentTheme = SALESFORCE_BLUE_THEME;

  const dates = React.useMemo(() => formatReportDate(reportDate), [reportDate]);

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

  // ── Advancement 1: Auto Date Extraction from Pasted Data ──
  React.useEffect(() => {
    if (parsed.detectedDate && parsed.detectedDate !== lastDetectedDateRef.current) {
      lastDetectedDateRef.current = parsed.detectedDate;
      setReportDate(parsed.detectedDate);
      const formatted = formatReportDate(parsed.detectedDate);
      toast.info(`📅 Auto-detected report date from sheet: ${formatted.numericDate}`, {
        duration: 3500,
      });
    }
  }, [parsed.detectedDate]);

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

  // ── Advancement 3: Day-over-Day Diff Tracking ──
  const dayOverDayDiff = React.useMemo<ReportDiffResult>(() => {
    return compareWithPreviousReport(
      {
        department: reportMode,
        reportDate,
        totalQueries: parsed.total,
        categories: parsed.rows.map((r) => ({ category: r.category, count: r.count })),
      },
      historySnapshots
    );
  }, [reportMode, reportDate, parsed.total, parsed.rows, historySnapshots]);

  // ── Advancement 3: Restore Report Snapshot from History Drawer ──
  const handleRestoreSnapshot = (snap: DailyReportSnapshot) => {
    setReportMode(snap.department);
    setReportDate(snap.reportDate);
    const rowsText = snap.categories
      .flatMap((c) => Array(c.count).fill(c.category))
      .join("\n");
    setInput(rowsText);
    toast.success(`Restored ${snap.department} report snapshot for ${snap.formattedDate}!`);
  };

  // ── Advancement 4: Print Executive PDF Summary Report ──
  const handlePrintReport = () => {
    if (parsed.rows.length === 0) {
      toast.error("Please paste data or load a sample first before printing.");
      return;
    }
    window.print();
  };

  // ── Advancement 2: Process Dropped or Uploaded Spreadsheets ──
  const handleProcessFile = async (file: File) => {
    const name = file.name.toLowerCase();
    try {
      if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        const workbook = xlsx.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (sheetName) {
          const sheet = workbook.Sheets[sheetName];
          if (sheet) {
            const tsv = xlsx.utils.sheet_to_csv(sheet, { FS: "\t" });
            setInput(tsv);
            setSelectedColumnIndex(-1);

            // Auto-detect mode from filename or sheet
            if (/cpsd/i.test(name) || /cpsd/i.test(sheetName)) {
              setReportMode("CPSD");
            } else {
              setReportMode("UCPG");
            }

            toast.success(`Loaded Excel workbook: ${file.name}`);
          }
        }
      } else {
        const text = await file.text();
        setInput(text);
        setSelectedColumnIndex(-1);
        if (/cpsd/i.test(name)) {
          setReportMode("CPSD");
        } else {
          setReportMode("UCPG");
        }
        toast.success(`Loaded ${file.name}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to read file ${file.name}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleProcessFile(file);
    }
    e.target.value = "";
  };

  // ── Advancement 2: 1-Click Interactive Typo & Anomaly Batch Cleaner ──
  const handleFixAllVariationsInText = () => {
    if (!parsed.detectedVariations || parsed.detectedVariations.length === 0) return;
    let newText = input;
    let totalCount = 0;
    parsed.detectedVariations.forEach((v) => {
      totalCount += v.count;
      const escaped = v.raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|[\\s\\t,"'\\n])${escaped}([\\s\\t,"'\\n]|$)`, "gi");
      newText = newText.replace(regex, (match, prefix, suffix) => `${prefix}${v.normalized}${suffix}`);
    });
    setInput(newText);
    toast.success(
      `✨ Auto-cleaned ${parsed.detectedVariations.length} anomaly types (${totalCount} instances) directly in source text!`
    );
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
      [
        headersConfig.category,
        headersConfig.count,
        headersConfig.percentage,
        ...(showCumulative ? [headersConfig.cumulative || "Cumulative %"] : []),
      ],
      ...parsed.rows.map((r) => [
        r.category,
        r.count,
        `${r.percentage.toFixed(decimalPlaces)}%`,
        ...(showCumulative ? [`${r.cumulativePercentage.toFixed(decimalPlaces)}%`] : []),
      ]),
      ["Total", parsed.total, "100.00%", ...(showCumulative ? ["100.00%"] : [])],
    ];

    const csvContent = Papa.unparse(csvRows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeDepartment}_Summary_${dates.alphaDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV file downloaded!");
  };

  // ── Download Excel with Sheet 1 (Raw/Pasted Data) & Sheet 2 (Category Summary) ──
  const handleDownloadExcel = () => {
    if (parsed.rows.length === 0) {
      toast.error("No category data to export!");
      return;
    }
    try {
      const wb = xlsx.utils.book_new();
      const reportSheetName = `${activeDepartment} Report`;
      const filename = `${activeDepartment} Report ${dates.alphaDate}.xlsx`;

      // ── Sheet 1: The Raw / Pasted Sheet (Exact Image 3 Structure) ──
      if (parsed.isMultiColumn && parsed.rawRows && parsed.rawRows.length > 0) {
        const wsRaw = xlsx.utils.aoa_to_sheet(parsed.rawRows);

        const colWidths = parsed.detectedHeaders.map((h, i) => {
          let maxLen = h.length;
          parsed.rawRows!.forEach((row) => {
            if (row[i]) {
              maxLen = Math.max(maxLen, String(row[i]).length);
            }
          });
          return { wch: Math.min(50, Math.max(10, maxLen + 3)) };
        });

        if (colWidths.length >= 7) {
          colWidths[0] = { wch: Math.max(colWidths[0]?.wch ?? 10, 13) }; // Date
          colWidths[1] = { wch: Math.max(colWidths[1]?.wch ?? 5, 7) }; // No
          colWidths[2] = { wch: Math.max(colWidths[2]?.wch ?? 15, 30) }; // Issue
          colWidths[3] = { wch: Math.max(colWidths[3]?.wch ?? 15, 24) }; // Support request number
          colWidths[4] = { wch: Math.max(colWidths[4]?.wch ?? 20, 42) }; // Reason
          colWidths[5] = { wch: Math.max(colWidths[5]?.wch ?? 12, 18) }; // Issue type (Col F)
          colWidths[6] = { wch: Math.max(colWidths[6]?.wch ?? 10, 16) }; // Reported by
        }
        wsRaw["!cols"] = colWidths;

        xlsx.utils.book_append_sheet(wb, wsRaw, reportSheetName);
      }

      // ── Sheet 2: Category Summary Table with Native Formulas ──
      const numRows = parsed.rows.length;
      const aoa: any[][] = [
        [
          headersConfig.category,
          headersConfig.count,
          headersConfig.percentage,
          ...(showCumulative ? [headersConfig.cumulative || "Cumulative %"] : []),
        ],
      ];

      parsed.rows.forEach((r, idx) => {
        const rowNum = idx + 2;
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

      const wsSummary = xlsx.utils.aoa_to_sheet(aoa);
      wsSummary["!cols"] = [
        { wch: 30 },
        { wch: 18 },
        { wch: 18 },
        ...(showCumulative ? [{ wch: 20 }] : []),
      ];

      if (!parsed.isMultiColumn) {
        xlsx.utils.book_append_sheet(wb, wsSummary, "Category Summary");
        if (parsed.rawRows && parsed.rawRows.length > 0) {
          const wsItems = xlsx.utils.aoa_to_sheet([["Category Items"], ...parsed.rawRows]);
          wsItems["!cols"] = [{ wch: 30 }];
          xlsx.utils.book_append_sheet(wb, wsItems, "Raw Categories");
        }
      } else {
        xlsx.utils.book_append_sheet(wb, wsSummary, "Category Summary");
      }

      // ── Advancement 3: Save Report Snapshot to 30-Day History ──
      saveReportSnapshot(
        reportDate,
        dates.numericDate,
        reportMode,
        parsed.total,
        parsed.rows.map((r) => ({ category: r.category, count: r.count }))
      );
      setHistorySnapshots(loadReportHistory());

      xlsx.writeFile(wb, filename);
      toast.success(`Downloaded ${filename} (${reportSheetName} + Summary)!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate Excel file.");
    }
  };

  // ── Render Sharp Retina Canvas for Image Download & Live WhatsApp Preview ──
  const generateTableCanvas = React.useCallback((): HTMLCanvasElement | null => {
    if (parsed.rows.length === 0 || typeof document === "undefined") return null;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const scale = 2; // Sharp retina canvas
      const rowHeight = 36;
      const headerHeight = 44;
      const totalRows = parsed.rows.length + 1;
      const tableHeight = headerHeight + totalRows * rowHeight;
      const tableWidth = showCumulative ? 600 : 500;
      const padding = 30;

      canvas.width = (tableWidth + padding * 2) * scale;
      canvas.height = (tableHeight + padding * 2) * scale;
      ctx.scale(scale, scale);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, tableWidth + padding * 2, tableHeight + padding * 2);

      const startX = padding;
      const startY = padding;

      const colWidths = showCumulative
        ? [tableWidth * 0.4, tableWidth * 0.2, tableWidth * 0.2, tableWidth * 0.2]
        : [tableWidth * 0.46, tableWidth * 0.27, tableWidth * 0.27];

      // Draw Header in Salesforce Blue
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

        // Data bars
        if (showDataBars) {
          const barW = (colWidths[2] || 100) * (r.percentage / 100);
          const barX = startX + (colWidths[0] || 0) + (colWidths[1] || 0);
          ctx.fillStyle = "#e0f2fe";
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

      return canvas;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [
    parsed.rows,
    parsed.total,
    showCumulative,
    currentTheme,
    bandedRows,
    showDataBars,
    decimalPlaces,
    categoryAlign,
    headersConfig,
  ]);

  // Live Retina PNG URL for WhatsApp Simulator
  React.useEffect(() => {
    const canvas = generateTableCanvas();
    if (canvas) {
      try {
        setTablePreviewUrl(canvas.toDataURL("image/png"));
      } catch {
        setTablePreviewUrl(null);
      }
    } else {
      setTablePreviewUrl(null);
    }
  }, [generateTableCanvas]);

  // ── Render and Download Table PNG Image ──
  const handleDownloadImage = () => {
    if (parsed.rows.length === 0) return;

    try {
      const canvas = generateTableCanvas();
      if (!canvas) return;

      const filename = `${activeDepartment}_Report_Table_${dates.alphaDate}.png`;

      // Save snapshot to history
      saveReportSnapshot(
        reportDate,
        dates.numericDate,
        reportMode,
        parsed.total,
        parsed.rows.map((r) => ({ category: r.category, count: r.count }))
      );
      setHistorySnapshots(loadReportHistory());

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Downloaded table image: ${filename}`);
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate image.");
    }
  };

  // ── Copy Image Directly to Clipboard for WhatsApp (Ctrl+V) ──
  const handleCopyImage = async () => {
    if (parsed.rows.length === 0) return;

    try {
      const canvas = generateTableCanvas();
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            toast.success("Image copied! Paste directly (Ctrl+V) into WhatsApp Web or Desktop.");
            setCopiedType("img");
            setTimeout(() => setCopiedType(null), 2500);
          } else {
            handleDownloadImage();
          }
        } catch {
          handleDownloadImage();
        }
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to copy image.");
    }
  };

  // ── Copy WhatsApp Message Caption Matching User Spec ──
  const handleCopyWhatsAppCaption = async () => {
    const dept = activeDepartment === "CPSD" ? "CPSD" : "UCPG";
    const caption = `Please find the today's summary of queries which are raised in whatsapp also find the attached Excel for ${dept} (${dates.numericDate})`;
    await navigator.clipboard.writeText(caption);
    setCopiedType("caption");
    toast.success(`WhatsApp message copied for ${dept} (${dates.numericDate})!`);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // ── Download Both Excel Sheet & PNG Image in One Click ──
  const handleDownloadBoth = () => {
    handleDownloadExcel();
    setTimeout(() => {
      handleDownloadImage();
    }, 400);
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

  // Helper badge color for Image 3 Sheet Preview
  const getIssueTypeBadgeClass = (val: string) => {
    const lower = val.toLowerCase().trim();
    if (lower.includes("bug")) {
      return "bg-red-600 text-white font-bold px-2 py-0.5 rounded";
    }
    if (lower.includes("awareness")) {
      return "bg-emerald-600 text-white font-bold px-2 py-0.5 rounded";
    }
    if (lower.includes("data update")) {
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800";
    }
    if (lower.includes("requirement") || lower.includes("req") || lower.includes("cr")) {
      return "bg-purple-600 text-white font-bold px-2 py-0.5 rounded";
    }
    if (lower.includes("query") || lower.includes("access")) {
      return "bg-blue-600 text-white font-bold px-2 py-0.5 rounded";
    }
    return "bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto w-full">
      {/* ── Left Column: Mode Selector, Input & Excel Controls ── */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="app-card border-slate-200/80 dark:border-white/[0.08] dark:bg-[#0b0c10] shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <Layers className="h-4.5 w-4.5 text-blue-500" />
                Category Dataset
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput("")}
                  disabled={!input}
                  className="h-7 px-2 text-[11px] font-semibold text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Clear
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 px-2.5 text-[11px] font-bold rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20"
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
            {/* ── 2 MODES: CPSD and UCPG MODE SWITCHER ── */}
            <div className="space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500" /> Report Mode Selection:
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  Configures headers &amp; exports
                </span>
              </div>

              {/* Full Width Segmented Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-slate-200/70 dark:bg-[#06070a] border border-slate-300/50 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => {
                    setReportMode("UCPG");
                    toast.info("Switched to UCPG Mode (UCPG Report)");
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-xs",
                    reportMode === "UCPG"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400/40"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.05]"
                  )}
                >
                  <Zap className={cn("h-4 w-4", reportMode === "UCPG" ? "text-amber-300 fill-amber-300" : "text-amber-500")} />
                  <span>UCPG Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReportMode("CPSD");
                    toast.info("Switched to CPSD Mode (CPSD Report)");
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all shadow-xs",
                    reportMode === "CPSD"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-indigo-400/40"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/[0.05]"
                  )}
                >
                  <Building2 className={cn("h-4 w-4", reportMode === "CPSD" ? "text-sky-300" : "text-indigo-400")} />
                  <span>CPSD Mode</span>
                </button>
              </div>

              {/* Date & Active Excel Target Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <ModernCalendarPicker
                  value={reportDate}
                  onChange={(newDate) => {
                    setReportDate(newDate);
                    toast.success(`Report date updated: ${formatReportDate(newDate).numericDate}`);
                  }}
                  isAutoDetected={Boolean(parsed.detectedDate && parsed.detectedDate !== getLocalTodayIso())}
                />

                <div className="flex items-center gap-1.5 font-mono text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 truncate">
                  <FileSpreadsheet className="h-3 w-3 text-emerald-500" />
                  <span>{activeDepartment} Report {dates.alphaDate}.xlsx</span>
                </div>
              </div>
            </div>
            {/* Quick Sample Loaders */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" /> Quick Samples:
              </span>
              <button
                type="button"
                onClick={() => {
                  setReportMode("UCPG");
                  setInput(getDynamicSampleUCPG());
                  setSelectedColumnIndex(5);
                  toast.success("Loaded UCPG 7-column sheet! Column F (Issue type) active.");
                }}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 transition-colors border border-blue-500/30 flex items-center gap-1"
              >
                <Zap className="h-3 w-3 text-amber-500" /> Sample UCPG (Sheet)
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportMode("CPSD");
                  setInput(getDynamicSampleCPSD());
                  setSelectedColumnIndex(5);
                  toast.success("Loaded CPSD 7-column sheet! Column F (Issue type) active.");
                }}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 transition-colors border border-indigo-500/30 flex items-center gap-1"
              >
                <Building2 className="h-3 w-3 text-sky-400" /> Sample CPSD (Sheet)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInput(SAMPLE_CATEGORY_ITEMS_ONLY);
                  setSelectedColumnIndex(0);
                  toast.info("Loaded Column F Category Items (Single Column).");
                }}
                className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/80 dark:border-white/[0.08]"
              >
                Col F Items Only
              </button>
              <button
                type="button"
                onClick={() => {
                  setInput(SAMPLE_IMAGE_2);
                  setSelectedColumnIndex(0);
                  toast.info("Loaded 6-item sample from Image 2");
                }}
                className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/80 dark:border-white/[0.08]"
              >
                Sample 1 (Image 2)
              </button>
            </div>

            {/* Multi-Column Pivot Selector with Column F Highlight */}
            {parsed.detectedHeaders.length > 1 && (
              <div className="p-3.5 rounded-xl bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400">
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    Excel Columns Detected ({parsed.detectedHeaders.length} columns):
                  </span>
                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-semibold">
                    Target: Column F (Issue type)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {parsed.detectedHeaders.map((head, idx) => {
                    const colLetter = String.fromCharCode(65 + idx);
                    const isSelected = parsed.selectedColumnIndex === idx;
                    const isColF = idx === 5 || /issue\s*type/i.test(head);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedColumnIndex(idx);
                          setHeaderCategory(head);
                          toast.info(`Now summarizing by Column ${colLetter}: ${head}`);
                        }}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : isColF
                              ? "bg-blue-100/80 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700"
                              : "bg-white dark:bg-[#06070a] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08] hover:border-blue-500/40"
                        }`}
                      >
                        <span className="font-mono text-[9px] opacity-75">[{colLetter}]</span>
                        <span>{head}</span>
                        {isColF && <span className="text-[9px] text-amber-300">★</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Advancement 2: Dropzone & Category Textarea Container ── */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleProcessFile(file);
              }}
              className="relative space-y-2.5"
            >
              {/* Drag overlay indicator */}
              {isDragging && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl bg-blue-600/95 text-white backdrop-blur-xs p-6 text-center animate-in fade-in zoom-in-95 duration-150 shadow-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-3 animate-bounce shadow-inner">
                    <FileSpreadsheet className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-base mb-1">Drop Excel or CSV File Here</h4>
                  <p className="text-xs text-blue-100 max-w-xs">
                    Instantly parses sheet, auto-detects date, sets mode &amp; Column F Issue types.
                  </p>
                </div>
              )}

              {/* Quick Drop Target Strip */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-dashed border-slate-300 dark:border-white/[0.15] hover:border-blue-500/60 dark:hover:border-blue-500/60 bg-slate-50/60 dark:bg-white/[0.02] hover:bg-blue-500/5 transition-all cursor-pointer group text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <Upload className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-semibold text-[11px]">
                    Drag &amp; Drop Excel (.xlsx, .xls, .csv) here or browse
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                  ⚡ Auto-syncs Date &amp; Column F
                </span>
              </div>

              {/* Header bar above textarea */}
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Category items or Excel column</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (Paste full sheet or Column F)
                  </span>
                </div>
                <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                  {parsed.rawCount} item{parsed.rawCount === 1 ? "" : "s"} detected
                  {parsed.isMultiColumn && " • Ref: Column F (Issue type)"}
                </span>
              </div>

              <Textarea
                placeholder={
                  "Paste your Excel data here (Two ways supported):\n\n" +
                  "1) FULL EXCEL SHEET (Will auto-refer Column F 'Issue type' & generate both sheet + image):\n" +
                  "Date\tNo\tIssue\tSupport request number\tReason\tIssue type\tReported by\n" +
                  "7/11/2026\t1\tNeed compressor warranty\t2713009\tUpdated as eligible\tData update\tNk\n" +
                  "\t2\tOTP validate issue\t27127281\tOTP not encrypted\tBug\tNaveen\n\n" +
                  "2) CATEGORY ITEMS ONLY (Single column list):\n" +
                  "Data update\nBug\nAwareness issueq"
                }
                className="min-h-[170px] resize-y bg-white dark:bg-[#06070a] border-slate-200/80 dark:border-white/[0.08] font-mono text-[11.5px] leading-relaxed text-slate-900 dark:text-slate-200 focus-visible:ring-blue-500/30 rounded-xl"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setSelectedColumnIndex(-1); // Reset to auto-detect Column F on new paste
                }}
              />

              {/* ── Advancement 3: Interactive Typo & Variation Resolver Chip ── */}
              {parsed.detectedVariations && parsed.detectedVariations.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-[11.5px]">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      {parsed.detectedVariations.length} Data Variation / Typo Detected:
                    </span>
                    <button
                      type="button"
                      onClick={handleFixAllVariationsInText}
                      className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition-all flex items-center gap-1 shrink-0"
                      title="Replaces variations and typos directly in your pasted text"
                    >
                      <CheckCheck className="h-3 w-3" /> Clean in Source Text
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {parsed.detectedVariations.map((v, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[11px] font-mono text-amber-900 dark:text-amber-200"
                      >
                        <span className="line-through opacity-75">{v.raw}</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">➔</span>
                        <span className="font-bold">{v.normalized}</span>
                        <span className="text-[10px] opacity-75">({v.count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Excel Advanced Table Features (Ribbon Style) ── */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-500" />
                Excel Table Features & Options
              </div>

              {/* Excel Table Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] cursor-pointer hover:border-blue-500/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={showDataBars}
                    onChange={(e) => setShowDataBars(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 bg-transparent border-slate-300 dark:border-white/[0.15]"
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-200">Data Bars</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      In-cell visual volume bar (Image 2)
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] cursor-pointer hover:border-blue-500/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={showCumulative}
                    onChange={(e) => setShowCumulative(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 bg-transparent border-slate-300 dark:border-white/[0.15]"
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-200">Cumulative %</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Pareto (80/20) column
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] cursor-pointer hover:border-blue-500/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={bandedRows}
                    onChange={(e) => setBandedRows(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 bg-transparent border-slate-300 dark:border-white/[0.15]"
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-200">Banded Rows</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Zebra alternating row tint
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] cursor-pointer hover:border-blue-500/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={normalizeVariations}
                    onChange={(e) => setNormalizeVariations(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 bg-transparent border-slate-300 dark:border-white/[0.15]"
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-200">
                      Group Variations
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Data updated → Data Update
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] cursor-pointer hover:border-blue-500/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={autoTitleCase}
                    onChange={(e) => setAutoTitleCase(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 bg-transparent border-slate-300 dark:border-white/[0.15]"
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-200">
                      Auto Title Case
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Capitalize words cleanly
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] cursor-pointer hover:border-blue-500/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={skipHeaderRow}
                    onChange={(e) => setSkipHeaderRow(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 bg-transparent border-slate-300 dark:border-white/[0.15]"
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-200">
                      Ignore Header Row
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Skip first header title
                    </div>
                  </div>
                </label>
              </div>

              {/* Decimals & Long-Tail Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08]">
                  <span className="font-semibold text-slate-900 dark:text-slate-200 block mb-1.5">
                    Percentage Decimals
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((dec) => (
                      <button
                        key={dec}
                        type="button"
                        onClick={() => setDecimalPlaces(dec)}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                          decimalPlaces === dec
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white dark:bg-[#06070a] text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08] hover:border-blue-500/30"
                        }`}
                      >
                        {dec} dec
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08]">
                  <span className="font-semibold text-slate-900 dark:text-slate-200 block mb-1.5">
                    Group Small Items (&lt; X%)
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[0, 5, 10].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setGroupOthersThreshold(val)}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                          groupOthersThreshold === val
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white dark:bg-[#06070a] text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08] hover:border-blue-500/30"
                        }`}
                      >
                        {val === 0 ? "Off" : `< ${val}%`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sort Order Selector */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
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
                      className={`py-1.5 px-2 rounded-lg font-semibold border transition-all text-center ${
                        sortBy === item.id
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white dark:bg-[#06070a] text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-white/[0.08] hover:border-blue-500/30"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Excluded items reset alert */}
              {excludedCategories.length > 0 && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
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
                  <summary className="font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors select-none">
                    + Custom Column Headers & Alignments
                  </summary>
                  <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1">
                          Col 1
                        </span>
                        <Input
                          value={headerCategory}
                          onChange={(e) => setHeaderCategory(e.target.value)}
                          className="h-8 text-xs bg-white dark:bg-[#06070a] border-slate-200/80 dark:border-white/[0.08]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1">
                          Col 2
                        </span>
                        <Input
                          value={headerCount}
                          onChange={(e) => setHeaderCount(e.target.value)}
                          className="h-8 text-xs bg-white dark:bg-[#06070a] border-slate-200/80 dark:border-white/[0.08]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mb-1">
                          Col 3
                        </span>
                        <Input
                          value={headerPercentage}
                          onChange={(e) => setHeaderPercentage(e.target.value)}
                          className="h-8 text-xs bg-white dark:bg-[#06070a] border-slate-200/80 dark:border-white/[0.08]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">Category Align:</span>
                        <button
                          type="button"
                          onClick={() => setCategoryAlign("center")}
                          className={`px-2 py-0.5 rounded border text-[10px] font-semibold transition-all ${categoryAlign === "center" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white dark:bg-[#06070a] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]"}`}
                        >
                          Center
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryAlign("left")}
                          className={`px-2 py-0.5 rounded border text-[10px] font-semibold transition-all ${categoryAlign === "left" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white dark:bg-[#06070a] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]"}`}
                        >
                          Left
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">Numbers Align:</span>
                        <button
                          type="button"
                          onClick={() => setNumberAlign("center")}
                          className={`px-2 py-0.5 rounded border text-[10px] font-semibold transition-all ${numberAlign === "center" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white dark:bg-[#06070a] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]"}`}
                        >
                          Center
                        </button>
                        <button
                          type="button"
                          onClick={() => setNumberAlign("right")}
                          className={`px-2 py-0.5 rounded border text-[10px] font-semibold transition-all ${numberAlign === "right" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white dark:bg-[#06070a] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.08]"}`}
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

      {/* ── Right Column: Interactive Table Preview, Sheet Preview & Arsenal of Exports ── */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="app-card border-slate-200/80 dark:border-white/[0.08] dark:bg-[#0b0c10] shadow-sm flex flex-col">
          {/* ── Top Header: View Switcher (Tabs) + Primary Action ── */}
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-3 border-b border-slate-100 dark:border-white/[0.06] gap-3">
            {/* View Tabs */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.08] shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewTab("summary")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0",
                    previewTab === "summary"
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Table className="h-3.5 w-3.5" />
                  <span>Summary Table</span>
                </button>
                {parsed.isMultiColumn && (
                  <button
                    type="button"
                    onClick={() => setPreviewTab("sheet")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0",
                      previewTab === "sheet"
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-sky-400" />
                    <span>Pasted Sheet</span>
                    {parsed.rawRows && parsed.rawRows.length > 1 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500/20 text-sky-300 font-mono">
                        {parsed.rawRows.length - 1}
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Mode indicator pill */}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>{activeDepartment} Report</span>
              </div>

              {/* Day-over-Day Trend Diff Pill (Advancement 3) */}
              {dayOverDayDiff.hasPrevious && (
                <div
                  className={cn(
                    "hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border whitespace-nowrap shrink-0",
                    dayOverDayDiff.totalDelta >= 0
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  )}
                  title={`Day-over-day vs previous report on ${dayOverDayDiff.previousDate}`}
                >
                  {dayOverDayDiff.totalDelta >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>
                    {dayOverDayDiff.totalDelta >= 0 ? "+" : ""}{dayOverDayDiff.totalDelta} ({dayOverDayDiff.totalPercentChange > 0 ? "+" : ""}{dayOverDayDiff.totalPercentChange}%) DoD
                  </span>
                </div>
              )}
            </div>

            {/* Top Right: Hero Download Action */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={handleDownloadBoth}
                disabled={parsed.rows.length === 0}
                className="h-8.5 px-3.5 text-xs font-bold gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-sm shadow-blue-500/25 border-none rounded-xl transition-all whitespace-nowrap shrink-0"
                title="Download both the formatted Excel file and PNG image with one click"
              >
                <FileDown className="h-4 w-4" />
                <span>Both (.xlsx + .png)</span>
              </Button>
            </div>
          </CardHeader>

          {/* ── Sub-Toolbar: Clean, Uniform Secondary Actions Strip ── */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.06]">
            {/* Download Files Group */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
                <Download className="h-3 w-3" /> Files:
              </span>

              <button
                type="button"
                onClick={handleDownloadExcel}
                disabled={parsed.rows.length === 0}
                className="h-8 px-2.5 text-xs font-semibold rounded-lg bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                title={`Download ${activeDepartment} Report ${dates.alphaDate}.xlsx with full data sheet and summary formulas`}
              >
                <Download className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadImage}
                disabled={parsed.rows.length === 0}
                className="h-8 px-2.5 text-xs font-semibold rounded-lg bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                title={`Download ${activeDepartment}_Report_Table_${dates.alphaDate}.png`}
              >
                <ImageIcon className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>Image (PNG)</span>
              </button>

              <button
                type="button"
                onClick={handlePrintReport}
                disabled={parsed.rows.length === 0}
                className="h-8 px-2.5 text-xs font-semibold rounded-lg bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                title="Print Executive PDF Summary Report (Ctrl+P)"
              >
                <Printer className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span>Print / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setIsHistoryDrawerOpen(true)}
                className="h-8 px-2.5 text-xs font-semibold rounded-lg bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] transition-all flex items-center gap-1.5 shadow-2xs"
                title="View 30-Day Daily Report Version History & Diffs"
              >
                <History className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>History ({historySnapshots.length})</span>
              </button>
            </div>

            {/* Share & Clipboard Group */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
                <Share2 className="h-3 w-3" /> Share:
              </span>

              <button
                type="button"
                onClick={handleCopyFormattedTable}
                disabled={parsed.rows.length === 0}
                className="h-8 px-2.5 text-xs font-semibold rounded-lg bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                title="Copy rich HTML table for Outlook & Word"
              >
                {copiedType === "html" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                )}
                <span>{copiedType === "html" ? "Copied!" : "Copy Table"}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyImage}
                disabled={parsed.rows.length === 0}
                className="h-8 px-2.5 text-xs font-semibold rounded-lg bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                title="Copy high-res table image directly to clipboard for WhatsApp (Ctrl+V)"
              >
                {copiedType === "img" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Share2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                )}
                <span>Copy Image</span>
              </button>

              <button
                type="button"
                onClick={handleCopyWhatsAppCaption}
                className="h-8 px-2.5 text-xs font-semibold rounded-lg bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] transition-all flex items-center gap-1.5 shadow-2xs"
                title="Copy WhatsApp text caption with report date"
              >
                {copiedType === "caption" ? (
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                )}
                <span>WhatsApp Msg</span>
              </button>

              <button
                type="button"
                onClick={handleCopyTsv}
                disabled={parsed.rows.length === 0}
                className="h-8 px-2.5 text-xs font-semibold rounded-lg bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/[0.08] transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                title="Copy TSV data to paste into Excel cells"
              >
                {copiedType === "tsv" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                )}
                <span>Copy TSV</span>
              </button>
            </div>
          </div>

          <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
            {parsed.rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 text-center">
                <Table className="h-12 w-12 mb-3 opacity-20" />
                <p className="font-bold text-base mb-1 text-slate-700 dark:text-slate-300">
                  No Data to Display
                </p>
                <p className="text-xs max-w-sm text-slate-500 dark:text-slate-400">
                  Paste the full {reportMode} Excel sheet or Column F categories, or click{" "}
                  <strong>&quot;Sample {reportMode} (Sheet)&quot;</strong> above.
                </p>
              </div>
            ) : previewTab === "sheet" && parsed.rawRows && parsed.rawRows.length > 0 ? (
              /* ── Pasted Sheet Preview Tab (Image 3 Style) ── */
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                    <FileSpreadsheet className="h-4 w-4 text-sky-500" />
                    <span>
                      Sheet: <strong>{activeDepartment} Report</strong> ({parsed.rawRows.length - 1} rows)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Will be saved inside:{" "}
                    <code className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {activeDepartment} Report {dates.alphaDate}.xlsx
                    </code>
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-sm max-h-[460px]">
                  <table className="w-full text-xs text-left border-collapse font-sans bg-white dark:bg-[#06070a]">
                    <thead>
                      <tr className="bg-[#0176D3] text-white font-bold border-b border-[#005fb2]">
                        {parsed.detectedHeaders.map((h, i) => (
                          <th
                            key={i}
                            className="px-3 py-2.5 border-r border-[#005fb2] last:border-r-0 whitespace-nowrap font-bold text-white text-[12px] tracking-wide"
                            style={{ backgroundColor: "#0176D3", color: "#FFFFFF", fontWeight: "bold" }}
                          >
                            <span>{h}</span>
                            {i === parsed.selectedColumnIndex && (
                              <span className="ml-1.5 text-amber-300 font-bold" title="Referenced category column (Column F)">
                                ★
                              </span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                      {parsed.rawRows.slice(1).map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="px-3 py-2 border-r border-slate-100 dark:border-white/[0.05] whitespace-nowrap text-slate-800 dark:text-slate-200"
                            >
                              {cIdx === parsed.selectedColumnIndex && cell ? (
                                <span className={getIssueTypeBadgeClass(cell)}>{cell}</span>
                              ) : (
                                cell || <span className="text-slate-300 dark:text-slate-600">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* ── Summary Table Preview Tab (Image 2 Style) ── */
              <div className="space-y-6">
                {/* Search / Filter Input */}
                {parsed.rows.length > 5 && (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Filter className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                      <Input
                        placeholder="Search category in table..."
                        value={tableSearchFilter}
                        onChange={(e) => setTableSearchFilter(e.target.value)}
                        className="h-8 pl-8 text-xs bg-white dark:bg-[#06070a] border-slate-200/80 dark:border-white/[0.08]"
                      />
                    </div>
                  </div>
                )}

                {/* ── Table Container (Exact Image 2 Salesforce Blue Table) ── */}
                <div
                  ref={tableRef}
                  className="flex flex-col items-center justify-center p-6 bg-slate-50/80 dark:bg-[#06070a] rounded-2xl border border-slate-200/80 dark:border-white/[0.08]"
                >
                  {/* ── Advancement 4: Print-Only Executive Header ── */}
                  <div className="hidden print-only w-full max-w-[500px] mb-4 pb-3 border-b-2 border-[#0176D3]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">
                          BLUE STAR LIMITED
                        </h1>
                        <p className="text-xs font-bold text-[#0176D3]">
                          Customer Support &amp; Operations · Daily Query Breakdown
                        </p>
                      </div>
                      <div className="text-right text-[10px] text-slate-600">
                        <p className="font-bold text-xs text-slate-900">{activeDepartment} Operations</p>
                        <p>Report Date: <strong>{dates.numericDate}</strong></p>
                        <p>Generated: {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

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
                              backgroundColor: currentTheme.headerBg,
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
                              backgroundColor: currentTheme.headerBg,
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
                              backgroundColor: currentTheme.headerBg,
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
                                backgroundColor: currentTheme.headerBg,
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

                  <div className="flex flex-wrap items-center justify-between w-full max-w-[500px] text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-200/80 dark:border-white/[0.08]">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: currentTheme.headerBg }}
                      />
                      Header: <strong>{currentTheme.name}</strong> ({currentTheme.headerBg})
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {showDataBars ? "Data Bars Active (Image 2)" : "Clean Grid"}
                    </span>
                  </div>
                </div>

                {/* ── Advancement 1: Live WhatsApp Chat Bubble Simulator ── */}
                <WhatsAppChatBubbleSimulator
                  reportMode={reportMode}
                  numericDate={dates.numericDate}
                  alphaDate={dates.alphaDate}
                  totalQueries={parsed.total}
                  previewImageUrl={tablePreviewUrl}
                  onDownloadExcel={handleDownloadExcel}
                  onDownloadImage={handleDownloadImage}
                />

                {/* ── Mini Visual Distribution (Excel Bar Chart Style) ── */}
                <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
                      Visual Distribution (Excel Chart)
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                      Relative Share of {parsed.total} issues
                    </span>
                  </div>

                  <div className="space-y-2">
                    {parsed.rows.map((r, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          <span className="truncate max-w-[240px]">{r.category}</span>
                          <span className="font-mono text-slate-500 dark:text-slate-400">
                            {r.count} ({r.percentage.toFixed(decimalPlaces)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-200/70 dark:bg-white/[0.06] rounded-full overflow-hidden">
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
                  <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] text-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                      Total Issues
                    </span>
                    <span className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5 flex-wrap">
                      <span>{parsed.total}</span>
                      {dayOverDayDiff.hasPrevious && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5",
                            dayOverDayDiff.totalDelta >= 0
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          )}
                          title={`Day-over-day vs previous report (${dayOverDayDiff.previousDate})`}
                        >
                          {dayOverDayDiff.totalDelta >= 0 ? "+" : ""}{dayOverDayDiff.totalDelta} ({dayOverDayDiff.totalPercentChange > 0 ? "+" : ""}{dayOverDayDiff.totalPercentChange}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] text-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">
                      Unique Categories
                    </span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {parsed.rows.length}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] text-center truncate">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block truncate">
                      Top Category
                    </span>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400 truncate block">
                      {parsed.rows[0]
                        ? `${parsed.rows[0].category} (${parsed.rows[0].percentage.toFixed(decimalPlaces)}%)`
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* Add to Daily Report Email Affordance */}
                {onAppendToDailyEmail && (
                  <div className="p-4 rounded-xl bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/20 flex items-center justify-between">
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
                        const html = generateCategoryTableHtml(
                          parsed.rows,
                          parsed.total,
                          headersConfig,
                          {
                            theme: currentTheme,
                            decimalPlaces,
                            showCumulative,
                            showDataBars,
                            bandedRows,
                            categoryAlign,
                            numberAlign,
                          }
                        );
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
                💡 <strong>Tip:</strong> Click <strong>&quot;Excel (.xlsx)&quot;</strong> to export{" "}
                <code className="font-mono text-emerald-600 dark:text-emerald-400">
                  {reportMode} Report {dates.alphaDate}.xlsx
                </code>{" "}
                with both the sheet and summary formulas.
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

      {/* ── Advancement 3: 30-Day Version History & Diffs Drawer ── */}
      <ReportHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        onRestoreSnapshot={handleRestoreSnapshot}
        currentReport={{
          department: reportMode,
          reportDate,
          totalQueries: parsed.total,
          categories: parsed.rows.map((r) => ({ category: r.category, count: r.count })),
        }}
      />

      {/* ── Advancement 4: Executive Print / PDF Global Stylesheet ── */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header,
          nav,
          aside,
          button,
          input,
          textarea,
          .no-print,
          [role="tablist"],
          .print-hide {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          #category-summary-table-view {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            margin: 0 auto !important;
          }
          table {
            width: 100% !important;
            page-break-inside: avoid;
          }
          tr {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
