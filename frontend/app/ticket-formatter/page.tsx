"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Ticket,
  Filter,
} from "lucide-react";
import { trackDashboardEvent } from "@/lib/dashboard-tracker";
import { showDataFeedbackToast } from "@/lib/custom-toasts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  analyzeTickets,
  ValidationRuleId,
  VALIDATION_RULES,
} from "@/lib/ticket-engine";
import { QuickExporterBar } from "@/components/tickets/quick-exporter-bar";
import { DeduplicationInspector } from "@/components/tickets/deduplication-inspector";
import { InvalidTokensInspector } from "@/components/tickets/invalid-tokens-inspector";
import { TicketStatsPills } from "@/components/tickets/ticket-stats-pills";

type FormatOption = {
  id: string;
  label: string;
  wrap: (t: string) => string;
  join: string;
  prefix?: string;
  suffix?: string;
};

const FORMATS: FormatOption[] = [
  { id: "single-quote", label: "Single Quote", wrap: (t: string) => `'${t}'`, join: ",\n" },
  { id: "double-quote", label: "Double Quote", wrap: (t: string) => `"${t}"`, join: ",\n" },
  { id: "comma", label: "Comma Separated", wrap: (t: string) => t, join: ", " },
  { id: "json", label: "JSON Array", wrap: (t: string) => `  "${t}"`, join: ",\n", prefix: "[\n", suffix: "\n]" },
  { id: "python-list", label: "Python List", wrap: (t: string) => `    "${t}"`, join: ",\n", prefix: "[\n", suffix: "\n]" },
  { id: "tuple", label: "Python Tuple", wrap: (t: string) => `    "${t}"`, join: ",\n", prefix: "(\n", suffix: "\n)" },
  { id: "java-array", label: "Java Array", wrap: (t: string) => `    "${t}"`, join: ",\n", prefix: "new String[]{\n", suffix: "\n}" },
  { id: "sql-in", label: "SQL IN", wrap: (t: string) => `'${t}'`, join: ", ", prefix: "IN (", suffix: ")" },
  { id: "soql-in", label: "SOQL IN", wrap: (t: string) => `'${t}'`, join: ",\n  ", prefix: "IN (\n  ", suffix: "\n)" },
  { id: "csv", label: "CSV Column", wrap: (t: string) => t, join: "\n" },
  { id: "clean-spaces", label: "Clean / Remove Spaces", wrap: (t: string) => t.replace(/[\s\u00A0]+/g, ""), join: "\n" },
];

const DEFAULT_BATCH_SIZE = 500;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

export default function TicketFormatterPage() {
  const [input, setInput] = React.useState("");
  const [selectedFormat, setSelectedFormat] = React.useState<string>("soql-in");
  const [batchIndex, setBatchIndex] = React.useState(0);
  const [batchSize, setBatchSize] = React.useState(DEFAULT_BATCH_SIZE);
  const [selectedRule, setSelectedRule] = React.useState<ValidationRuleId>("sf-digits");
  const [deduplicateEnabled, setDeduplicateEnabled] = React.useState(true);
  const [filterValidOnly, setFilterValidOnly] = React.useState(false);

  // Real-time Ticket Analysis
  const analysis = React.useMemo(() => {
    return analyzeTickets(input, selectedRule, deduplicateEnabled);
  }, [input, selectedRule, deduplicateEnabled]);

  // Determine active tickets for output formatting
  const activeTickets = React.useMemo(() => {
    if (filterValidOnly) {
      return analysis.validTickets;
    }
    return deduplicateEnabled ? analysis.uniqueTickets : analysis.rawTokens;
  }, [analysis, filterValidOnly, deduplicateEnabled]);

  const batches = React.useMemo(() => {
    const chunks: string[][] = [];
    for (let i = 0; i < activeTickets.length; i += batchSize) {
      chunks.push(activeTickets.slice(i, i + batchSize));
    }
    return chunks;
  }, [activeTickets, batchSize]);

  const batchCount = batches.length;

  const outputBatches = React.useMemo(() => {
    const format = FORMATS.find((f) => f.id === selectedFormat);
    if (!format || batches.length === 0) return [];
    return batches.map((chunk) => {
      const lines = chunk.map(format.wrap);
      let result = lines.join(format.join);
      if (format.prefix) result = format.prefix + result;
      if (format.suffix) result = result + format.suffix;
      return result;
    });
  }, [batches, selectedFormat]);

  const currentOutput = outputBatches[batchIndex] ?? "";

  React.useEffect(() => {
    setBatchIndex(0);
  }, [input, selectedFormat, filterValidOnly, deduplicateEnabled]);

  const handleCopy = (value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    showDataFeedbackToast("Copied to clipboard", value, "copy");
  };

  const handleCopyAll = () => {
    if (outputBatches.length === 0) return;
    const value = outputBatches.join("\n\n");
    navigator.clipboard.writeText(value);
    showDataFeedbackToast("Copied all batches to clipboard", value, "copy");

    trackDashboardEvent({
      metricKey: "tickets_formatted",
      incrementBy: activeTickets.length,
      event: {
        type: "ticket-formatted",
        label: `Tickets formatted · ${selectedFormat}`,
        meta: `${activeTickets.length} ticket${activeTickets.length === 1 ? "" : "s"}`,
        module: "ticket-formatter",
      },
    });
  };

  const handleDownload = () => {
    if (outputBatches.length === 0) return;
    const value = outputBatches.join("\n\n");
    const blob = new Blob([value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets-${selectedFormat}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showDataFeedbackToast("Downloaded text file", value, "download");

    trackDashboardEvent({
      metricKey: "tickets_formatted",
      incrementBy: activeTickets.length,
      event: {
        type: "ticket-formatted",
        label: `Tickets downloaded · ${selectedFormat}`,
        meta: `${activeTickets.length} ticket${activeTickets.length === 1 ? "" : "s"}`,
        module: "ticket-formatter",
      },
    });
  };

  const handleStripInvalid = () => {
    setInput(analysis.validTickets.join("\n"));
    toast.success(`Removed ${analysis.invalidTokens.length} invalid token(s)`);
  };

  const ruleObj = VALIDATION_RULES[selectedRule] || VALIDATION_RULES["sf-digits"];

  return (
    <div className="workspace-page mx-auto min-h-screen w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ─── Top Control & Header Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-card/60 dark:bg-[#08090d]/80 border border-border/80 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
              Ticket Formatter & Exporter
              <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] font-bold px-2 py-0.2">
                Batch Presets
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">
              Format ticket numbers into SOQL queries, Excel columns, CSV, JSON, and list formats.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Validation Rule Selector */}
          <div className="flex items-center gap-2 bg-background/80 dark:bg-card px-3 py-1.5 rounded-2xl border border-border/80 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Rule:
            </span>
            <select
              value={selectedRule}
              onChange={(e) => setSelectedRule(e.target.value as ValidationRuleId)}
              className="text-xs font-bold bg-transparent text-foreground focus:outline-hidden cursor-pointer"
            >
              {Object.values(VALIDATION_RULES).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Valid Only Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFilterValidOnly(!filterValidOnly)}
            className={cn(
              "h-9 px-3 rounded-2xl border text-xs font-bold gap-1.5 shadow-2xs transition-all",
              filterValidOnly
                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                : "bg-background/80 border-border/80 text-foreground hover:bg-card"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>{filterValidOnly ? "Format: Valid Only" : "Format: All Unique"}</span>
          </Button>

          {input && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput("")}
              className="h-9 px-3 rounded-2xl border-border/80 bg-background/80 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 text-xs font-bold gap-1.5 shadow-2xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* ─── 1-Click Multi-Target Quick Exporters Bar ────────────────────────────── */}
      <QuickExporterBar
        tickets={activeTickets}
        title="Multi-Target Quick Exporters (1-Click Direct Copy)"
        onExport={() => {
          trackDashboardEvent({
            metricKey: "tickets_formatted",
            incrementBy: activeTickets.length,
            event: {
              type: "ticket-formatted",
              label: `Quick Exporter · ${activeTickets.length} tickets`,
              meta: `${activeTickets.length} ticket${activeTickets.length === 1 ? "" : "s"}`,
              module: "ticket-formatter",
            },
          });
        }}
      />

      {/* ─── Main Content Grid ─────────────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Side: Input Panel */}
        <motion.div initial="hidden" animate="show" variants={containerVariants} className="h-full">
          <Card className="h-full rounded-3xl overflow-hidden relative group border-border/80 shadow-xs flex flex-col">
            <CardHeader className="px-6 py-4 border-b border-border/60 flex flex-col gap-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black tracking-tight text-foreground flex items-center gap-2">
                  Input Case Numbers
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5 text-primary border-primary/30">
                    {activeTickets.length} active tickets
                  </Badge>
                  {batchCount > 1 && (
                    <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5 text-secondary border-secondary/30">
                      {batchCount} batches
                    </Badge>
                  )}
                </div>
              </div>

              {/* Real-Time Stats Pills */}
              <TicketStatsPills
                totalRaw={analysis.totalRawCount}
                validCount={analysis.validTickets.length}
                invalidCount={analysis.invalidTokens.length}
                duplicateCount={analysis.duplicateCount}
                selectedRule={selectedRule}
              />
            </CardHeader>

            <CardContent className="p-5 relative z-10 flex-1 flex flex-col gap-3.5">
              {/* Invalid Tokens Inspector */}
              <InvalidTokensInspector
                invalidTokens={analysis.invalidTokens}
                ruleBadge={ruleObj.badge}
                onStripInvalid={handleStripInvalid}
              />

              {/* Deduplication Inspector */}
              <DeduplicationInspector
                duplicateCount={analysis.duplicateCount}
                duplicateItems={analysis.duplicateItems}
                deduplicateEnabled={deduplicateEnabled}
                onToggleDeduplicate={setDeduplicateEnabled}
              />

              <div className="relative flex-1 flex flex-col min-h-[300px] rounded-2xl overflow-hidden bg-card/60 dark:bg-[#06070a] border border-border/80">
                <Textarea
                  placeholder={`Paste ticket numbers here...\n\n2713009\n27127281\n27128910\n2713009 (auto-deduplicated)`}
                  className="flex-1 min-h-[300px] font-mono text-sm leading-relaxed rounded-2xl border-none bg-transparent text-foreground focus-visible:ring-0 focus-visible:outline-none p-5 shadow-none resize-none placeholder:text-muted-foreground"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-2 font-medium bg-muted/60 dark:bg-[#08090d] p-3 rounded-xl border border-border/60">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span>
                  Automatic batch chunking at {batchSize} tickets per query for optimal database performance.
                </span>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Side: Options and Result */}
        <div className="space-y-6 flex flex-col h-full">
          {/* Format Options */}
          <motion.div initial="hidden" animate="show" variants={containerVariants}>
            <Card className="rounded-3xl overflow-hidden border-border/80 shadow-xs">
              <CardHeader className="bg-transparent px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60">
                <CardTitle className="text-xs font-black tracking-widest uppercase text-muted-foreground">
                  Select Output Format
                </CardTitle>

                {/* Batch Size Slider */}
                <div className="flex flex-col gap-1.5 w-full sm:w-[170px] ml-auto">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">
                      Batch Size
                    </span>
                    <span className="text-[10px] font-bold text-primary tracking-wide">
                      {batchSize} tickets
                    </span>
                  </div>
                  <div className="relative flex items-center h-1 w-full bg-border/60 dark:bg-white/10 rounded-full">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-primary"
                      style={{ width: `${(batchSize / 2000) * 100}%` }}
                    />
                    <input
                      type="range"
                      min="10"
                      max="2000"
                      step="10"
                      value={batchSize}
                      onChange={(e) => setBatchSize(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-muted-foreground leading-none mt-1">
                    <span>10</span>
                    <span>1000</span>
                    <span>2000</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 max-h-[220px] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                  {FORMATS.map((f) => (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      key={f.id}
                      onClick={() => setSelectedFormat(f.id)}
                      className={cn(
                        "flex items-center justify-center min-h-[42px] rounded-xl border px-3 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 shadow-xs cursor-pointer",
                        selectedFormat === f.id
                          ? "border-primary bg-primary text-primary-foreground shadow-md font-extrabold"
                          : "border-border/80 bg-card/70 text-foreground hover:bg-hover hover:border-primary/40"
                      )}
                    >
                      <span className="truncate">{f.label}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Output Result panel */}
          <motion.div initial="hidden" animate="show" variants={containerVariants} className="flex-1 min-h-[300px]">
            <Card className="h-full rounded-3xl overflow-hidden flex flex-col relative border-border/80 shadow-xs">
              <CardHeader className="px-6 py-4 border-b border-border/60 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CardTitle className="text-sm font-black tracking-tight text-foreground">
                    Formatted Output
                  </CardTitle>
                  {batchCount > 1 && (
                    <Badge className="bg-primary/10 text-primary border border-primary/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {batchCount} batch{batchCount === 1 ? "" : "es"}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleCopyAll}
                    disabled={outputBatches.length === 0}
                    className="h-9 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-xs text-xs gap-1.5 transition-all active:scale-95"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy All</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={outputBatches.length === 0}
                    className="h-9 px-4 rounded-xl border-border/80 bg-background/80 hover:bg-card font-bold text-xs gap-1.5 transition-all active:scale-95 text-foreground"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-5 flex-1 flex flex-col gap-3 relative z-10">
                {batchCount > 1 && (
                  <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card/80 dark:bg-[#08090d] px-4 py-2 shadow-2xs">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Batch <span className="text-foreground">{batchIndex + 1}</span> of {batchCount}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-lg"
                        disabled={batchIndex <= 0}
                        onClick={() => setBatchIndex((i) => Math.max(0, i - 1))}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-lg"
                        disabled={batchIndex >= batchCount - 1}
                        onClick={() => setBatchIndex((i) => Math.min(batchCount - 1, i + 1))}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                      <div className="w-px h-4 bg-border mx-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 rounded-lg text-primary font-bold hover:bg-primary/10 gap-1 text-xs"
                        onClick={() => handleCopy(currentOutput)}
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy Batch</span>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="relative flex-1 flex flex-col min-h-[220px] rounded-2xl overflow-hidden bg-card/60 dark:bg-[#06070a] border border-border/80 h-full">
                  <Textarea
                    readOnly
                    value={currentOutput}
                    placeholder="Formatted tickets will appear here..."
                    className="h-full min-h-[220px] font-mono text-sm leading-relaxed rounded-2xl border-none bg-transparent text-foreground p-5 shadow-none resize-none no-scrollbar focus-visible:ring-0 focus-visible:outline-none"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
