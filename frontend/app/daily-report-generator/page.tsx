"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  Copy,
  Mail,
  Calendar,
  User,
  CheckCircle2,
  Calculator,
  Upload,
  Download,
  Layers,
  Sparkles,
  FileSpreadsheet,
  Check,
  Edit3,
  Database,
  RefreshCcw,
  X,
  Save,
  Code2,
} from "lucide-react";
import {
  DEFAULT_STATUS_REPORT_QUERIES,
  getLocalStoredQuery,
  setLocalStoredQuery,
  type StatusReportQueryItem,
} from "@/lib/status-report-queries";
import * as xlsx from "xlsx";
import Papa from "papaparse";
import { cn } from "@/lib/utils";
import {
  CategoryBreakdownModule,
  generateCategoryTableHtml,
  parseCategories,
  type CategoryRow,
} from "./category-breakdown";

const CASE_ID_REGEX = /(?:^|[^\p{L}\p{N}])(500[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?)(?![\p{L}\p{N}])/gui;

interface ReportData {
  closed: number;
  waiting: number;
  open: number;
  inProgress: number;
  pendingClosure: number;
  internal: number;
  reopened: number;
  autoClosed: number;
  total: number;
}

export default function DailyReportGeneratorPage() {
  const [closedInput, setClosedInput] = React.useState("");
  const [otherInput, setOtherInput] = React.useState("");
  const [reportDate, setReportDate] = React.useState(() => {
    const d = new Date();
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
  });
  const [managerName, setManagerName] = React.useState("@soumyakanta.routray@bluestarindia.com Sir");
  
  const [reportData, setReportData] = React.useState<ReportData | null>(null);
  const [mergedData, setMergedData] = React.useState<any[][] | null>(null);
  const [activeTab, setActiveTab] = React.useState<"category-breakdown" | "status-merger">("category-breakdown");
  const [categoryInputForEmail, setCategoryInputForEmail] = React.useState("");
  const [categoryBreakdownHtml, setCategoryBreakdownHtml] = React.useState<string | null>(null);
  const [categoryRowsForExcel, setCategoryRowsForExcel] = React.useState<{ rows: CategoryRow[]; total: number } | null>(null);

  const fileInput1Ref = React.useRef<HTMLInputElement>(null);
  const fileInput2Ref = React.useRef<HTMLInputElement>(null);

  // Status Report SOQL queries state (persisted to Prisma + localStorage)
  const [statusQueries, setStatusQueries] = React.useState<Record<"closed_cases" | "other_status_cases", StatusReportQueryItem>>(() => {
    return {
      closed_cases: {
        key: 'closed_cases', name: DEFAULT_STATUS_REPORT_QUERIES.closed_cases.name,
        soql: getLocalStoredQuery("closed_cases") || DEFAULT_STATUS_REPORT_QUERIES.closed_cases.soql,
      },
      other_status_cases: {
        key: 'other_status_cases', name: DEFAULT_STATUS_REPORT_QUERIES.other_status_cases.name,
        soql: getLocalStoredQuery("other_status_cases") || DEFAULT_STATUS_REPORT_QUERIES.other_status_cases.soql,
      },
    };
  });

  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [editingKey, setEditingKey] = React.useState<"closed_cases" | "other_status_cases" | null>(null);
  const [editingSoql, setEditingSoql] = React.useState("");
  const [isSavingQuery, setIsSavingQuery] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    // Fetch persisted queries from Prisma table
    fetch("/api/status-report-queries")
      .then((res) => res.json())
      .then((data) => {
        if (data?.queries) {
          setStatusQueries((prev) => {
            const closedBase = prev.closed_cases ?? DEFAULT_STATUS_REPORT_QUERIES.closed_cases;
            const otherBase = prev.other_status_cases ?? DEFAULT_STATUS_REPORT_QUERIES.other_status_cases;
            const closedApi = data.queries?.closed_cases;
            const otherApi = data.queries?.other_status_cases;

            return {
              closed_cases: {
                key: "closed_cases",
                name: closedApi?.name || closedBase.name,
                soql: getLocalStoredQuery("closed_cases") || closedApi?.soql || closedBase.soql,
              },
              other_status_cases: {
                key: "other_status_cases",
                name: otherApi?.name || otherBase.name,
                soql: getLocalStoredQuery("other_status_cases") || otherApi?.soql || otherBase.soql,
              },
            };
          });
        }
      })
      .catch((err) => console.warn("Prisma SOQL sync warning:", err));
  }, []);

  const handleCopyQuery = async (key: "closed_cases" | "other_status_cases") => {
    const item = statusQueries[key] || DEFAULT_STATUS_REPORT_QUERIES[key];
    const query = item?.soql || "";
    try {
      await navigator.clipboard.writeText(query);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      toast.success(`${item?.name || "SOQL"} query copied to clipboard!`);
    } catch {
      toast.error("Failed to copy query to clipboard");
    }
  };

  const handleOpenEditor = (key: "closed_cases" | "other_status_cases") => {
    const item = statusQueries[key] || DEFAULT_STATUS_REPORT_QUERIES[key];
    setEditingKey(key);
    setEditingSoql(item?.soql || "");
  };

  const handleSaveQuery = async () => {
    if (!editingKey) return;
    if (!editingSoql.trim()) {
      toast.error("SOQL query cannot be empty");
      return;
    }

    setIsSavingQuery(true);
    const item = statusQueries[editingKey] || DEFAULT_STATUS_REPORT_QUERIES[editingKey];
    const queryName = item?.name || (editingKey === "closed_cases" ? "Completed / Closed Cases" : "Other Status Cases");

    try {
      setLocalStoredQuery(editingKey, editingSoql);
      setStatusQueries((prev) => ({
        ...prev,
        [editingKey]: {
          ...prev[editingKey],
          key: editingKey,
          name: queryName,
          soql: editingSoql,
          updatedAt: new Date().toISOString(),
        },
      }));

      const res = await fetch("/api/status-report-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: editingKey, soql: editingSoql, name: queryName }),
      });
      const data = await res.json();
      if (data?.persisted) {
        toast.success(`${queryName} query saved to Prisma database!`);
      } else {
        toast.success(`${queryName} query updated and saved locally!`);
      }
      setEditingKey(null);
    } catch {
      toast.success(`${queryName} query saved locally!`);
      setEditingKey(null);
    } finally {
      setIsSavingQuery(false);
    }
  };

  const handleResetQuery = () => {
    if (!editingKey) return;
    const defaultQuery = DEFAULT_STATUS_REPORT_QUERIES[editingKey]?.soql || "";
    setEditingSoql(defaultQuery);
    toast.info("Reset to default SOQL query template");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setInput: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    
    try {
      if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        const workbook = xlsx.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        if (firstSheetName) {
          const sheet = workbook.Sheets[firstSheetName];
          if (sheet) {
            setInput(xlsx.utils.sheet_to_csv(sheet));
            toast.success(`${file.name} uploaded and parsed!`);
          }
        }
      } else {
        const text = await file.text();
        setInput(text);
        toast.success(`${file.name} uploaded successfully!`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to read ${file.name}. Ensure it's a valid CSV/Excel file.`);
    }

    // Reset input
    e.target.value = "";
  };

  const handleGenerate = () => {
    if (!closedInput.trim() && !otherInput.trim()) {
      toast.error("Please provide data in at least one field.");
      return;
    }

    // Merge Logic using PapaParse
    const parsed1 = Papa.parse<any[]>(closedInput.trim(), { skipEmptyLines: true }).data;
    const parsed2 = Papa.parse<any[]>(otherInput.trim(), { skipEmptyLines: true }).data;

    let merged = [...parsed1];
    if (parsed1.length > 0 && parsed2.length > 0) {
      if (JSON.stringify(parsed1[0]) === JSON.stringify(parsed2[0])) {
        merged = [...merged, ...parsed2.slice(1)];
      } else {
        merged = [...merged, ...parsed2];
      }
    } else {
      merged = [...merged, ...parsed2];
    }

    // Deduplicate based on CaseNumber to ensure exact counts
    let caseNumberColIndex = -1;
    if (merged.length > 0 && Array.isArray(merged[0])) {
      caseNumberColIndex = (merged[0] as any[]).findIndex((col: any) => typeof col === 'string' && col.toLowerCase().replace(/[^a-z]/g, '') === 'casenumber');
    }

    if (caseNumberColIndex !== -1) {
      const seenCases = new Set<string>();
      const dedupedMerged: any[][] = [merged[0] as any[]]; 
      for (let i = 1; i < merged.length; i++) {
        const row = merged[i] as any[];
        if (!row) continue;
        const caseId = (row[caseNumberColIndex] || "").toString().trim();
        if (caseId && seenCases.has(caseId)) continue; 
        if (caseId) seenCases.add(caseId);
        dedupedMerged.push(row);
      }
      merged = dedupedMerged;
    }

    setMergedData(merged);

    // Dynamic Parsing based on Status column
    let closedCount = 0, waiting = 0, open = 0, inProgress = 0, pendingClosure = 0, internal = 0, reopened = 0, autoClosed = 0;
    
    let statusColIndex = -1;
    if (merged.length > 0 && Array.isArray(merged[0])) {
      statusColIndex = (merged[0] as any[]).findIndex((col: any) => typeof col === 'string' && col.toLowerCase().trim() === 'status');
    }

    if (statusColIndex !== -1) {
      // Safe parsing using the exact Status column
      for (let i = 1; i < merged.length; i++) {
        const row = merged[i] as any[];
        if (!row) continue;
        const statusVal = (row[statusColIndex] || "").toString().toLowerCase().trim();
        if (!statusVal) continue;

        if (statusVal === 'closed') closedCount++;
        else if (statusVal === 'waiting for user information' || statusVal === 'waiting user info') waiting++;
        else if (statusVal === 'open') open++;
        else if (statusVal === 'in progress') inProgress++;
        else if (statusVal.includes('pending closure') || statusVal === 'resolved') pendingClosure++;
        else if (statusVal === 'internal clarification') internal++;
        else if (statusVal === 'reopened cases') reopened++;
        else if (statusVal === 'auto closed') autoClosed++;
      }
    } else {
      // Fallback: use regex on raw text if no header is found
      const allLines = [...otherInput.split('\n'), ...closedInput.split('\n')].map(l => l.trim()).filter(l => l.length > 0);
      for (const line of allLines) {
        if (/\bClosed\b/i.test(line) && !/\bAuto Closed\b/i.test(line)) closedCount++;
        else if (/\bWaiting for User Information\b/i.test(line) || /\bWaiting User Info\b/i.test(line)) waiting++;
        else if (/\bIn Progress\b/i.test(line)) inProgress++;
        else if (/\bResolved\s*[--]\s*Pending Closure\b/i.test(line) || /\bResolved\b/i.test(line)) pendingClosure++;
        else if (/\bInternal Clarification\b/i.test(line)) internal++;
        else if (/\bReopened Cases\b/i.test(line)) reopened++;
        else if (/\bAuto Closed\b/i.test(line)) autoClosed++;
        else if (/\bOpen\b/i.test(line)) open++;
      }
    }

    const total = closedCount + waiting + open + inProgress + pendingClosure + internal + reopened + autoClosed;

    setReportData({
      closed: closedCount,
      waiting,
      open,
      inProgress,
      pendingClosure,
      internal,
      reopened,
      autoClosed,
      total
    });

    if (categoryInputForEmail.trim()) {
      const parsedCat = parseCategories(categoryInputForEmail, {
        autoTitleCase: true,
        normalizeVariations: true,
        skipHeaderRow: true,
        sortBy: "count-desc",
      });
      if (parsedCat.rows.length > 0) {
        const catHtml = generateCategoryTableHtml(parsedCat.rows, parsedCat.total);
        setCategoryBreakdownHtml(catHtml);
        setCategoryRowsForExcel({ rows: parsedCat.rows, total: parsedCat.total });
      }
    }

    toast.success("Report generated and files merged successfully!");
  };

  const handleDownloadExcel = () => {
    if (!mergedData || mergedData.length === 0) {
      toast.error("No data to merge!");
      return;
    }
    
    try {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const month = monthNames[currentDate.getMonth()];
      const year = currentDate.getFullYear();
      const formattedDate = `${day}_${month}_${year}`;

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.aoa_to_sheet(mergedData);
      xlsx.utils.book_append_sheet(wb, ws, "Merged Report");

      if (categoryRowsForExcel && categoryRowsForExcel.rows.length > 0) {
        const catAoa: any[][] = [
          ["Category", "No. of Issues", "Percentage"],
          ...categoryRowsForExcel.rows.map((r) => [r.category, r.count, `${r.percentage.toFixed(2)}%`]),
          ["Total", categoryRowsForExcel.total, "100.00%"],
        ];
        const catWs = xlsx.utils.aoa_to_sheet(catAoa);
        catWs["!cols"] = [{ wch: 28 }, { wch: 18 }, { wch: 18 }];
        xlsx.utils.book_append_sheet(wb, catWs, "Category Breakdown");
      }

      xlsx.writeFile(wb, `DailyReport_${formattedDate}.xlsx`);
      toast.success("Merged Excel file downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate the Excel file.");
    }
  };

  const handleDraftEmail = () => {
    if (!reportData) return;
    const cleanEmail = managerName.replace('@', '').replace(/ Sir/i, '').trim();
    const ccEmails = "hemaldivecha@bluestarindia.com,shalini.awasthi@bluestarindia.com,serviceithd@bluestarindia.com";
    const subject = encodeURIComponent(`Daily Support Ticket Summary ${reportDate}`);
    
    window.location.href = `mailto:${cleanEmail}?cc=${ccEmails}&subject=${subject}`;
    toast.info("Draft opened! Just press Ctrl+V to paste the entire report.");
  };

  const handleCopyEmail = () => {
    if (!reportData) return;
    
    const element = document.getElementById("email-report-content");
    if (!element) return;

    const html = element.innerHTML;
    const text = element.innerText;

    try {
      const data = [
        new window.ClipboardItem({
          "text/plain": new Blob([text], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" })
        })
      ];
      navigator.clipboard.write(data).then(() => {
        toast.success("Email copied! Click 'Open Mail Draft' to paste it.");
      }).catch(() => {
        navigator.clipboard.writeText(text).catch(() => {});
        toast.success("Text copied to clipboard");
      });
    } catch (e) {
      navigator.clipboard.writeText(text);
      toast.success("Text copied to clipboard");
    }
  };

  const formatPercent = (count: number, total: number) => {
    if (total === 0) return "0.00%";
    return ((count / total) * 100).toFixed(2) + "%";
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Module Switcher Tabs ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between max-w-7xl mx-auto w-full px-4 sm:px-6 gap-3">
        <div className="glass-mode-toggle p-1.5 rounded-2xl inline-flex relative">
          <button
            type="button"
            onClick={() => setActiveTab("category-breakdown")}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative z-10",
              activeTab === "category-breakdown"
                ? "text-white font-black"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            {activeTab === "category-breakdown" && (
              <motion.div
                layoutId="activeDailyReportTabBadge"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
                className="absolute inset-0 bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 rounded-xl shadow-md z-[-1] border border-sky-300/40"
                style={{
                  boxShadow: "0 4px 16px rgba(2, 132, 199, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.35)"
                }}
              />
            )}
            <Layers className={cn("h-4 w-4 transition-colors", activeTab === "category-breakdown" ? "text-white" : "text-sky-500 dark:text-sky-400")} />
            <span>Issue Category Breakdown</span>
            <span className={cn(
              "text-[10px] font-black uppercase px-2 py-0.5 rounded-full transition-colors",
              activeTab === "category-breakdown"
                ? "bg-white/20 text-white border border-white/30"
                : "bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20"
            )}>
              Image 2 Table
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("status-merger")}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative z-10",
              activeTab === "status-merger"
                ? "text-white font-black"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            {activeTab === "status-merger" && (
              <motion.div
                layoutId="activeDailyReportTabBadge"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
                className="absolute inset-0 bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 rounded-xl shadow-md z-[-1] border border-sky-300/40"
                style={{
                  boxShadow: "0 4px 16px rgba(2, 132, 199, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.35)"
                }}
              />
            )}
            <FileSpreadsheet className={cn("h-4 w-4 transition-colors", activeTab === "status-merger" ? "text-white" : "text-sky-500 dark:text-sky-400")} />
            <span>Status Report & Merger</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-medium">
          {activeTab === "category-breakdown" ? (
            <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-xl border border-primary/20 font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Paste category list ➔ Exact Image 2 table with blue headers
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-xl border border-purple-500/20 font-semibold">
              <Mail className="h-3.5 w-3.5 text-purple-500" />
              Merge ticket files & draft daily email
            </span>
          )}
        </div>
      </div>

      {activeTab === "category-breakdown" ? (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
          <CategoryBreakdownModule
            onAppendToDailyEmail={(html) => {
              setCategoryBreakdownHtml(html);
              setActiveTab("status-merger");
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto w-full px-4 sm:px-6">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="app-card border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl backdrop-blur-2xl p-0 overflow-hidden">
            <CardHeader className="pb-4 px-6 pt-5 border-b border-border/70 bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Calculator className="h-5 w-5 text-purple-500" />
                Input Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted dark:bg-[#12141a] text-[10px] text-foreground font-bold border border-border/70 dark:border-white/[0.1]">1</span>
                    Completed / Closed Cases
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyQuery("closed_cases")}
                      className="h-7 px-2.5 text-[11px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 active:scale-95 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      title="Copy Closed Cases SOQL Query to Clipboard"
                    >
                      {copiedKey === "closed_cases" ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy SOQL</span>
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenEditor("closed_cases")}
                      className="h-7 px-2.5 text-[11px] font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 active:scale-95 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      title="Edit & Update Closed Cases SOQL Query"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Update SOQL</span>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 px-2.5 text-[11px] font-bold rounded-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 active:scale-95 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      onClick={() => fileInput1Ref.current?.click()}
                    >
                      <Upload className="h-3 w-3" />
                      <span>Upload File</span>
                    </Button>
                    <input type="file" ref={fileInput1Ref} className="hidden" accept=".csv,.xlsx,.xls,.txt" onChange={(e) => handleFileUpload(e, setClosedInput)} />
                  </div>
                </div>
                <Textarea 
                  placeholder="Paste rows here or upload file using button above..." 
                  className="min-h-[140px] resize-y bg-surface-recessed/60 dark:bg-[#06070a] border border-border/70 dark:border-white/[0.08] font-mono text-[11px] text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/30 rounded-xl leading-relaxed shadow-inner"
                  value={closedInput}
                  onChange={(e) => setClosedInput(e.target.value)}
                />
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted dark:bg-[#12141a] text-[10px] text-foreground font-bold border border-border/70 dark:border-white/[0.1]">2</span>
                    Other Status Cases
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyQuery("other_status_cases")}
                      className="h-7 px-2.5 text-[11px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 active:scale-95 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      title="Copy Other Status Cases SOQL Query to Clipboard"
                    >
                      {copiedKey === "other_status_cases" ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy SOQL</span>
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenEditor("other_status_cases")}
                      className="h-7 px-2.5 text-[11px] font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 active:scale-95 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      title="Edit & Update Other Status Cases SOQL Query"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Update SOQL</span>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 px-2.5 text-[11px] font-bold rounded-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 active:scale-95 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      onClick={() => fileInput2Ref.current?.click()}
                    >
                      <Upload className="h-3 w-3" />
                      <span>Upload File</span>
                    </Button>
                    <input type="file" ref={fileInput2Ref} className="hidden" accept=".csv,.xlsx,.xls,.txt" onChange={(e) => handleFileUpload(e, setOtherInput)} />
                  </div>
                </div>
                <Textarea 
                  placeholder="Paste rows for Open, In Progress, Waiting for User Info, etc..." 
                  className="min-h-[140px] resize-y bg-surface-recessed/60 dark:bg-[#06070a] border border-border/70 dark:border-white/[0.08] font-mono text-[11px] text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/30 rounded-xl leading-relaxed shadow-inner"
                  value={otherInput}
                  onChange={(e) => setOtherInput(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <details className="text-xs group" open={Boolean(categoryInputForEmail)}>
                  <summary className="font-bold text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-primary" />
                      Include Category Breakdown (Image 2 Style)
                    </span>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      Optional
                    </span>
                  </summary>
                  <div className="mt-2.5 space-y-1.5">
                    <p className="text-[11px] text-muted-foreground">
                      Paste category column from Excel to auto-generate the Image 2 breakdown table in this daily email:
                    </p>
                    <Textarea
                      placeholder={"Paste categories here, e.g.:\nData update\nData update\nBug\nAwareness issue"}
                      className="min-h-[100px] resize-y bg-surface-recessed/60 dark:bg-[#06070a] border border-border/70 dark:border-white/[0.08] font-mono text-[11px] text-foreground rounded-xl shadow-inner"
                      value={categoryInputForEmail}
                      onChange={(e) => setCategoryInputForEmail(e.target.value)}
                    />
                  </div>
                </details>
              </div>

              <div className="pt-4 border-t border-border/70 dark:border-white/[0.08] space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5"/> Report Date</label>
                  <Input value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="bg-surface-recessed/60 dark:bg-[#06070a] border-border/70 dark:border-white/[0.08] font-medium rounded-xl text-foreground" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><User className="h-3.5 w-3.5"/> Addressed To</label>
                    <Input value={managerName} onChange={(e) => setManagerName(e.target.value)} className="bg-surface-recessed/60 dark:bg-[#06070a] border-border/70 dark:border-white/[0.08] font-medium rounded-xl text-foreground" />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                className="w-full h-12 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 rounded-xl transition-all"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Generate & Merge
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7">
          <Card className="app-card h-full border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl backdrop-blur-2xl flex flex-col p-0 overflow-hidden">
            <CardHeader className="flex flex-col xl:flex-row items-start xl:items-center justify-between pb-4 border-b border-border/70 bg-muted/20 px-6 py-4 gap-4 flex-wrap">
              <CardTitle className="text-lg font-bold text-foreground">Generated Outputs</CardTitle>
              {reportData && (
                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                  <Button variant="outline" size="sm" onClick={handleDownloadExcel} className="flex-1 sm:flex-none gap-2 bg-[#107c41] hover:bg-[#185c37] text-white border-none shadow-md shadow-[#107c41]/20 rounded-xl font-bold">
                    <Download className="h-4 w-4" /> Merge to Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopyEmail} className="flex-1 sm:flex-none gap-2 border-border/80 dark:border-white/[0.08] bg-card/80 dark:bg-[#06070a]/80 text-foreground hover:bg-surface-elevated rounded-xl font-bold">
                    <Copy className="h-4 w-4" /> Copy Email
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleDraftEmail} className="flex-1 sm:flex-none gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border-none shadow-md shadow-primary/20 rounded-xl font-bold">
                    <Mail className="h-4 w-4" /> Open Mail Draft
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0 flex-1 rounded-b-xl overflow-hidden relative">
              {!reportData ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-8 text-center">
                  <Mail className="h-12 w-12 mb-4 opacity-20" />
                  <p className="font-medium text-lg mb-2">No Report Generated Yet</p>
                  <p className="text-sm opacity-70">Fill in the inputs and click generate to preview your email here.</p>
                </div>
              ) : (
                <div className="p-6 md:p-8 overflow-y-auto max-h-[800px] text-[15px] font-sans text-slate-800 dark:text-slate-300 select-text">
                  <div id="email-report-content" style={{ fontFamily: "Segoe UI, Calibri, Arial, sans-serif", backgroundColor: "transparent", padding: "10px" }}>
                    <p style={{ margin: "0 0 16px 0" }}>
                      Dear <a href={`mailto:${managerName.replace('@', '').replace(/ Sir/i, '').trim()}`} style={{color: "#0563C1", textDecoration: "none"}}>
                        {managerName.replace(/ Sir/i, '')}
                      </a>
                      {/ Sir/i.test(managerName) ? ' Sir' : ''},
                    </p>
                    
                    <p style={{ margin: "0 0 24px 0", lineHeight: "1.5" }}>
                      Please find attached the Support Ticket Summary Report for {reportDate}, including the summary snapshot and detailed case-level status report.
                    </p>

                    <p style={{ margin: "0 0 16px 0", fontWeight: "bold", fontSize: "16px" }}>Daily Case Report {reportDate}</p>

                    <table style={{ width: "100%", maxWidth: "650px", borderCollapse: "collapse", marginBottom: "24px", fontSize: "14px", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                          <th style={{ padding: "8px", border: "1px solid #cbd5e1", fontWeight: "bold" }}>Ticket Status</th>
                          <th style={{ padding: "8px", border: "1px solid #cbd5e1", fontWeight: "bold", textAlign: "center" }}>Count</th>
                          <th style={{ padding: "8px", border: "1px solid #cbd5e1", fontWeight: "bold", textAlign: "right" }}>%</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", fontWeight: "bold" }}>Tickets Raised</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "center", fontWeight: "bold" }}>{reportData.total}</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "right", fontWeight: "bold" }}>{formatPercent(reportData.total, reportData.total)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1" }}>Closed</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "center" }}>{reportData.closed}</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "right" }}>{formatPercent(reportData.closed, reportData.total)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1" }}>Waiting for User Information</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "center" }}>{reportData.waiting}</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "right" }}>{formatPercent(reportData.waiting, reportData.total)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1" }}>Open</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "center" }}>{reportData.open}</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "right" }}>{formatPercent(reportData.open, reportData.total)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1" }}>In Progress</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "center" }}>{reportData.inProgress}</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "right" }}>{formatPercent(reportData.inProgress, reportData.total)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1" }}>Resolved - Pending Closure</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "center" }}>{reportData.pendingClosure}</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "right" }}>{formatPercent(reportData.pendingClosure, reportData.total)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1" }}>Internal Clarification</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "center" }}>{reportData.internal}</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "right" }}>{formatPercent(reportData.internal, reportData.total)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1" }}>Reopened Cases</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "center" }}>{reportData.reopened}</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "right" }}>{formatPercent(reportData.reopened, reportData.total)}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1" }}>Auto Closed</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "center" }}>{reportData.autoClosed}</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "right" }}>{formatPercent(reportData.autoClosed, reportData.total)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", fontWeight: "bold" }}>Total</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "center", fontWeight: "bold" }}>{reportData.total}</td>
                          <td style={{ padding: "8px", border: "1px solid #cbd5e1", textAlign: "right", fontWeight: "bold" }}>{formatPercent(reportData.total, reportData.total)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <p style={{ margin: "0 0 12px 0", fontWeight: "bold", fontSize: "15px" }}>KPI Snapshot</p>
                    
                    <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>Closure: <span style={{ fontWeight: "normal" }}>{reportData.closed} | {formatPercent(reportData.closed, reportData.total)}</span></p>
                    <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>User Dependency: <span style={{ fontWeight: "normal" }}>{reportData.waiting} | {formatPercent(reportData.waiting, reportData.total)}</span></p>
                    <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>Open: <span style={{ fontWeight: "normal" }}>{reportData.open} | {formatPercent(reportData.open, reportData.total)}</span></p>
                    <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>In Progress: <span style={{ fontWeight: "normal" }}>{reportData.inProgress} | {formatPercent(reportData.inProgress, reportData.total)}</span></p>
                    <p style={{ margin: "0 0 24px 0", fontWeight: "bold" }}>Pending Closure: <span style={{ fontWeight: "normal" }}>{reportData.pendingClosure} | {formatPercent(reportData.pendingClosure, reportData.total)}</span></p>

                    {categoryBreakdownHtml && (
                      <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px dashed #cbd5e1" }}>
                        <p style={{ margin: "0 0 12px 0", fontWeight: "bold", fontSize: "16px" }}>
                          Issue Category Breakdown
                        </p>
                        <div dangerouslySetInnerHTML={{ __html: categoryBreakdownHtml }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      {/* UPDATE SOQL QUERY MODAL DIALOG */}
      {isMounted && editingKey && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-3xl bg-card dark:bg-[#0e1017] border border-border/80 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/70 dark:border-white/[0.08] bg-muted/30 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-foreground">
                        Update {editingKey === "closed_cases" ? "Completed / Closed Cases" : "Other Status Cases"} SOQL
                      </h2>
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">
                        <Database className="h-3 w-3" /> Prisma Model
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Stored in Prisma database table (<code className="text-primary font-mono text-[11px]">status_report_queries</code>) & synced locally
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingKey(null)}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 dark:hover:bg-white/[0.08] transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between px-6 py-2.5 bg-muted/15 dark:bg-white/[0.01] border-b border-border/50 dark:border-white/[0.05] text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Lines: {editingSoql.split("\n").length} | Characters: {editingSoql.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetQuery}
                    className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground active:scale-95 transition-all gap-1.5 rounded-lg"
                  >
                    <RefreshCcw className="h-3 w-3" />
                    Reset Default
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(editingSoql);
                      toast.success("Current editor query copied!");
                    }}
                    className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground active:scale-95 transition-all gap-1.5 rounded-lg"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
              </div>

              {/* Editor Body */}
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="relative">
                  <Textarea
                    value={editingSoql}
                    onChange={(e) => setEditingSoql(e.target.value)}
                    rows={15}
                    spellCheck={false}
                    className="w-full font-mono text-xs sm:text-[13px] leading-relaxed p-4 rounded-xl bg-surface-recessed/80 dark:bg-[#06070a] border border-border/80 dark:border-white/10 text-emerald-600 dark:text-emerald-400 shadow-inner focus-visible:ring-primary/40 resize-y min-h-[300px]"
                    placeholder="Enter SOQL query..."
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  💡 Tip: You can adjust the Owner IDs, date constraints (<code className="font-mono text-primary">Today</code>), and Status criteria as needed.
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/70 dark:border-white/[0.08] bg-muted/20 dark:bg-white/[0.02]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingKey(null)}
                  className="rounded-xl border-border/80 active:scale-95 transition-all cursor-pointer font-bold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveQuery}
                  disabled={isSavingQuery}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isSavingQuery ? "Saving..." : "Save & Update SOQL"}
                </Button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
















