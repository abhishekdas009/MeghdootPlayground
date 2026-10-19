"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Trash2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trackDashboardEvent } from "@/lib/dashboard-tracker";
import { showDataFeedbackToast } from "@/lib/custom-toasts";
import { cn } from "@/lib/utils";

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
  { id: "csv", label: "CSV", wrap: (t: string) => t, join: "\n" },
  { id: "clean-spaces", label: "Remove All Spaces", wrap: (t: string) => t.replace(/[\s\u00A0]+/g, ""), join: "\n" },
];

const DEFAULT_BATCH_SIZE = 500;

// Framer Motion variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function TicketFormatterPage() {
  const [input, setInput] = React.useState("");
  const [selectedFormat, setSelectedFormat] = React.useState<string>("soql-in");
  const [batchIndex, setBatchIndex] = React.useState(0);
  const [batchSize, setBatchSize] = React.useState(DEFAULT_BATCH_SIZE);

  const tickets = React.useMemo(() => {
    return input
      .split(/[\n\r,\t]+/)
      .map((t) => t.replace(/['\s\u00A0]+/g, ""))
      .filter((t) => t.length > 0);
  }, [input]);

  const batches = React.useMemo(() => {
    const chunks: string[][] = [];
    for (let i = 0; i < tickets.length; i += batchSize) {
      chunks.push(tickets.slice(i, i + batchSize));
    }
    return chunks;
  }, [tickets, batchSize]);

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
  }, [input, selectedFormat]);

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
      incrementBy: tickets.length,
      event: {
        type: "ticket-formatted",
        label: `Tickets formatted · ${selectedFormat}`,
        meta: `${tickets.length} ticket${tickets.length === 1 ? "" : "s"}`,
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
      incrementBy: tickets.length,
      event: {
        type: "ticket-formatted",
        label: `Tickets downloaded · ${selectedFormat}`,
        meta: `${tickets.length} ticket${tickets.length === 1 ? "" : "s"}`,
        module: "ticket-formatter",
      },
    });
  };

  return (
    <div className="workspace-page mx-auto min-h-screen w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ─── Main Content Grid ─────────────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-2">
        
        {/* Left Side: Input Panel */}
        <motion.div initial="hidden" animate="show" variants={containerVariants} className="h-full">
          <Card className="h-full rounded-3xl overflow-hidden relative group">
            <CardHeader className="px-8 py-5 border-b border-border/60 flex flex-row items-center justify-between relative z-10">
              <CardTitle className="text-base font-extrabold tracking-tight text-foreground flex items-center gap-2">
                Input Tickets
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-bold px-3 py-0.5 text-primary border-primary/30">
                  {tickets.length} tickets
                </Badge>
                {batchCount > 1 && (
                  <Badge variant="outline" className="text-xs font-bold px-3 py-0.5 text-secondary border-secondary/30">
                    {batchCount} batches
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setInput("")} 
                  aria-label="Clear tickets" 
                  className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors ml-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 relative z-10 h-[calc(100%-75px)] flex flex-col">
              <div className="relative flex-1 flex flex-col group min-h-[350px] rounded-2xl overflow-hidden bg-card/60 dark:bg-[#06070a] border border-border/80 dark:border-white/10">
                <Textarea
                  placeholder={`Paste ticket numbers here...\n\nA260182314123\nA260182314124\nA260182314125`}
                  className="flex-1 min-h-[350px] font-mono text-sm leading-relaxed rounded-2xl border-none bg-transparent text-foreground focus-visible:ring-0 focus-visible:outline-none p-5 shadow-none transition-all resize-none placeholder:text-muted-foreground relative z-10"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-4 flex items-center gap-2 font-medium bg-muted/60 dark:bg-[#08090d] p-3 rounded-xl border border-border/60 dark:border-white/5">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                Values are automatically chunked into {batchSize}-ticket batches for optimal query performance.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Side: Options and Result */}
        <div className="space-y-8 flex flex-col h-full">
          
          {/* Format Options */}
          <motion.div initial="hidden" animate="show" variants={containerVariants}>
            <Card className="rounded-3xl overflow-hidden">
              <CardHeader className="bg-transparent px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60">
                <CardTitle className="text-xs font-black tracking-widest uppercase text-muted-foreground">
                  Select Output Format
                </CardTitle>
                <div className="flex flex-col gap-1.5 w-full sm:w-[160px] ml-auto">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">
                      Batch Size
                    </span>
                    <span className="text-[10px] font-bold text-primary tracking-wide">
                      {batchSize} tickets
                    </span>
                  </div>
                  <div className="relative flex items-center h-1 w-full bg-border/60 dark:bg-white/10 rounded-full overflow-visible">
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
                      className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-none"
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
                        "flex items-center justify-center min-h-[44px] rounded-xl border px-3 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 relative group shadow-xs",
                        selectedFormat === f.id
                          ? "border-primary bg-primary text-primary-foreground shadow-md font-extrabold"
                          : "border-border/80 bg-card/70 text-foreground hover:bg-hover hover:border-primary/40"
                      )}
                    >
                      <span className="relative z-10">{f.label}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Output Result panel */}
          <motion.div initial="hidden" animate="show" variants={containerVariants} className="flex-1 min-h-[300px]">
            <Card className="h-full rounded-3xl overflow-hidden flex flex-col relative group">
              <div className="absolute bottom-0 right-0 p-32 bg-gradient-to-tl from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
              
              <CardHeader className="bg-white/10 dark:bg-white/10 px-6 py-4 border-b border-white/10 dark:border-slate-800/50 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100">
                    Generated Result
                  </CardTitle>
                  {batchCount > 1 && (
                    <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-inner">
                      {batchCount} batch{batchCount === 1 ? "" : "es"}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handleCopyAll} 
                    disabled={outputBatches.length === 0} 
                    className="h-10 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/25 text-xs gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    <Copy className="h-4 w-4" /> Copy All
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleDownload} 
                    disabled={outputBatches.length === 0} 
                    className="h-10 px-5 rounded-xl border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs gap-2 transition-all hover:scale-105 active:scale-95 text-slate-700 dark:text-slate-200"
                  >
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 flex-1 flex flex-col gap-4 relative z-10">
                {batchCount > 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between rounded-xl border border-border/80 bg-card/80 dark:bg-[#08090d] backdrop-blur-md px-5 py-2.5 shadow-xs"
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Batch <span className="text-foreground">{batchIndex + 1}</span> of {batchCount}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg" 
                        disabled={batchIndex <= 0} 
                        onClick={() => setBatchIndex((i) => Math.max(0, i - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg" 
                        disabled={batchIndex >= batchCount - 1} 
                        onClick={() => setBatchIndex((i) => Math.min(batchCount - 1, i + 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="w-px h-5 bg-border mx-1"></div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 rounded-lg text-primary font-bold hover:bg-primary/10 gap-1.5 text-xs transition-colors" 
                        onClick={() => handleCopy(currentOutput)}
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy Batch
                      </Button>
                    </div>
                  </motion.div>
                )}
                
                <div className="relative flex-1 flex flex-col group min-h-[250px] rounded-2xl overflow-hidden bg-card/60 dark:bg-[#06070a] border border-border/80 dark:border-white/10 h-full">
                  <Textarea
                    readOnly
                    value={currentOutput}
                    className="h-full min-h-[250px] font-mono text-sm leading-relaxed rounded-2xl border-none bg-transparent text-foreground p-5 shadow-none transition-all resize-none no-scrollbar focus-visible:ring-0 focus-visible:outline-none relative z-10"
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
