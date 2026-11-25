"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassHero, GlassSpotlightCard } from "@/components/ui/glass-primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { GLASS_TAB_SPRING } from "@/lib/motion";
import {
  Copy,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Ticket,
  Filter,
  ClipboardPaste,
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

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.info("Clipboard is empty");
        return;
      }
      setInput(text);
      toast.success("Pasted ticket list from clipboard");
    } catch {
      toast.error("Unable to access clipboard automatically — press Ctrl+V");
    }
  };

  const ruleObj = VALIDATION_RULES[selectedRule] || VALIDATION_RULES["sf-digits"];

  return (
    <div className="workspace-page mx-auto min-h-screen w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <GlassHero
        icon={Ticket}
        badge="Batch Presets & Sanitizer"
        title="Ticket Formatter &"
        highlight="Exporter"
        description="Clean messy email threads or spreadsheets, deduplicate IDs, and convert into syntax-perfect SOQL, SQL, JSON, or CSV batches."
        watermark="FORMAT"
        actions={
          <>
            <div className="glass-surface flex items-center gap-2 rounded-xl px-3 py-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Rule:
              </span>
              <select
                value={selectedRule}
                onChange={(e) => setSelectedRule(e.target.value as ValidationRuleId)}
                className="cursor-pointer bg-transparent text-xs font-bold text-foreground focus:outline-none"
              >
                {Object.values(VALIDATION_RULES).map((r) => (
                  <option key={r.id} value={r.id} className="bg-white dark:bg-[#0b0c10] text-foreground">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFilterValidOnly(!filterValidOnly)}
              className={cn(
                "h-9 px-3 rounded-xl border text-xs font-bold gap-1.5 transition-all",
                filterValidOnly
                  ? "bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 text-white border-sky-400/40 shadow-md shadow-blue-500/25"
                  : "bg-white/60 dark:bg-white/[0.05] backdrop-blur-md border-border/70 text-foreground hover:border-blue-500/40"
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>{filterValidOnly ? "Filter: Valid Only" : "Filter: All Unique"}</span>
            </Button>

            {input && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput("")}
                className="h-9 px-3 rounded-xl border-border/70 bg-white/60 dark:bg-white/[0.05] backdrop-blur-md hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 text-xs font-bold gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear</span>
              </Button>
            )}
          </>
        }
      />

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
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        {/* Left Side: Input Panel */}
        <GlassSpotlightCard delay={0.05} className="h-full">
          <CardHeader className="px-6 py-4 border-b border-border/50 dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.02] backdrop-blur-md flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)] shrink-0" />
                <CardTitle className="text-sm font-black tracking-tight text-foreground">
                  Input Case Numbers
                </CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5 text-blue-700 dark:text-sky-300 border-blue-500/30 bg-blue-500/10 whitespace-nowrap shrink-0">
                  {activeTickets.length} active
                </Badge>
                {batchCount > 1 && (
                  <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5 text-sky-700 dark:text-sky-200 border-sky-400/30 bg-sky-500/10 whitespace-nowrap shrink-0">
                    {batchCount} batches
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePaste}
                  className="h-7 px-2 text-xs font-bold text-muted-foreground hover:text-blue-600 dark:hover:text-sky-300 rounded-lg gap-1 shrink-0"
                  title="Paste from Clipboard"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <TicketStatsPills
              totalRaw={analysis.totalRawCount}
              validCount={analysis.validTickets.length}
              invalidCount={analysis.invalidTokens.length}
              duplicateCount={analysis.duplicateCount}
              selectedRule={selectedRule}
            />
          </CardHeader>

          <CardContent className="p-5 flex-1 flex flex-col gap-3.5">
            <InvalidTokensInspector
              invalidTokens={analysis.invalidTokens}
              ruleBadge={ruleObj.badge}
              onStripInvalid={handleStripInvalid}
            />

            <DeduplicationInspector
              duplicateCount={analysis.duplicateCount}
              duplicateItems={analysis.duplicateItems}
              deduplicateEnabled={deduplicateEnabled}
              onToggleDeduplicate={setDeduplicateEnabled}
            />

            <div className="glass-inset-well relative flex-1 flex flex-col min-h-[300px] rounded-2xl overflow-hidden">
              <Textarea
                placeholder={`Paste ticket numbers here...\n\n2713009\n27127281\n27128910\n2713009 (auto-deduplicated)`}
                className="flex-1 min-h-[300px] font-mono text-sm leading-relaxed rounded-2xl border-none bg-transparent text-foreground focus-visible:ring-0 focus-visible:outline-none p-5 shadow-none resize-none placeholder:text-muted-foreground"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <p className="glass-surface text-xs text-muted-foreground flex items-center gap-2 font-medium p-3 rounded-xl">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-sky-400 shrink-0" />
              <span>
                Automatic batch chunking at <strong className="text-foreground">{batchSize}</strong> tickets per query for optimal Salesforce performance.
              </span>
            </p>
          </CardContent>
        </GlassSpotlightCard>

        {/* Right Side: Options and Result */}
        <div className="space-y-6 flex flex-col h-full">
          {/* Format Options */}
          <GlassSpotlightCard delay={0.1}>
            <CardHeader className="px-6 py-4 border-b border-border/50 dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.02] backdrop-blur-md flex flex-row flex-wrap items-center justify-between gap-4">
              <CardTitle className="text-xs font-black tracking-widest uppercase text-muted-foreground whitespace-nowrap">
                Select Output Format
              </CardTitle>

              {/* Batch Size Slider */}
              <div className="flex flex-col gap-1.5 w-full sm:w-[175px] sm:ml-auto">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">
                    Batch Size
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-sky-300 tracking-wide font-mono">
                    {batchSize} tickets
                  </span>
                </div>
                <div className="relative flex items-center h-1.5 w-full bg-slate-200/80 dark:bg-white/10 rounded-full">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-400 to-blue-600"
                    style={{ width: `${(batchSize / 2000) * 100}%` }}
                  />
                  <input
                    type="range"
                    min="10"
                    max="2000"
                    step="10"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-md"
                  />
                </div>
                <div className="flex justify-between text-[8px] font-bold text-muted-foreground leading-none mt-0.5 font-mono">
                  <span>10</span>
                  <span>1000</span>
                  <span>2000</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 max-h-[260px] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 2xl:grid-cols-3 gap-2.5">
                {FORMATS.map((f) => {
                  const active = selectedFormat === f.id;
                  return (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      key={f.id}
                      onClick={() => setSelectedFormat(f.id)}
                      className={cn(
                        "relative flex items-center justify-center min-h-[42px] rounded-xl border px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer overflow-hidden",
                        active
                          ? "border-sky-400/50 text-white shadow-md font-extrabold"
                          : "border-slate-200/70 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.04] text-foreground hover:border-blue-500/40 hover:bg-blue-500/[0.06]"
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeFormatGridPill"
                          transition={GLASS_TAB_SPRING}
                          className="absolute inset-0 z-0 bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700"
                        />
                      )}
                      <span className="relative z-10 text-center leading-tight">{f.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </GlassSpotlightCard>

          {/* Output Result panel */}
          <GlassSpotlightCard delay={0.16} className="flex-1 min-h-[300px]">
            <CardHeader className="px-6 py-4 border-b border-border/50 dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.02] backdrop-blur-md flex flex-row flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.8)] shrink-0" />
                <CardTitle className="text-sm font-black tracking-tight text-foreground">
                  Formatted Output
                </CardTitle>
                {batchCount > 1 && (
                  <Badge className="bg-blue-500/15 text-blue-700 dark:text-sky-300 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider whitespace-nowrap shrink-0">
                    {batchCount} batch{batchCount === 1 ? "" : "es"}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  onClick={handleCopyAll}
                  disabled={outputBatches.length === 0}
                  className="h-9 px-4 rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 hover:brightness-110 text-white font-bold shadow-md shadow-blue-500/20 text-xs gap-1.5 transition-all active:scale-95 whitespace-nowrap shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy All</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={outputBatches.length === 0}
                  className="h-9 px-4 rounded-xl border-border/70 bg-white/60 dark:bg-white/[0.05] backdrop-blur-md hover:border-blue-500/40 font-bold text-xs gap-1.5 transition-all active:scale-95 text-foreground whitespace-nowrap shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 flex-1 flex flex-col gap-3">
              {batchCount > 1 && (
                <div className="glass-surface flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-2">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    Batch <span className="text-foreground">{batchIndex + 1}</span> of {batchCount}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
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
                      className="h-7 px-2.5 rounded-lg text-blue-700 dark:text-sky-300 font-bold hover:bg-blue-500/10 gap-1 text-xs whitespace-nowrap shrink-0"
                      onClick={() => handleCopy(currentOutput)}
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy Batch</span>
                    </Button>
                  </div>
                </div>
              )}

              <div className="glass-inset-well relative flex-1 flex flex-col min-h-[220px] rounded-2xl overflow-hidden h-full">
                <Textarea
                  readOnly
                  value={currentOutput}
                  placeholder="Formatted tickets will appear here..."
                  className="h-full min-h-[220px] font-mono text-sm leading-relaxed rounded-2xl border-none bg-transparent text-blue-700 dark:text-sky-200 p-5 shadow-none resize-none no-scrollbar focus-visible:ring-0 focus-visible:outline-none"
                />
              </div>
            </CardContent>
          </GlassSpotlightCard>
        </div>
      </div>
    </div>
  );
}
