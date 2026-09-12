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
      .map((t) => t.trim())
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
    <div className="workspace-page mx-auto min-h-screen w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      
      {/* ─── Hero / Header Section ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="page-hero relative flex flex-col gap-6 overflow-hidden rounded-3xl p-8"
      >
        {/* Dynamic Background Elements */}
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none dark:bg-indigo-500/20 dark:mix-blend-screen" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none dark:bg-blue-500/10 dark:mix-blend-screen" />
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0176d3] to-indigo-600 shadow-[0_0_30px_rgba(1,118,211,0.4)] border border-white/20">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge className="bg-[#0176d3]/10 text-blue-700 border border-[#0176d3]/30 text-xs font-bold px-3 py-1 flex items-center gap-2 shadow-inner backdrop-blur-md uppercase tracking-widest dark:bg-[#0176d3]/20 dark:text-blue-300 dark:border-[#0176d3]/40">
                  Formatter Tool
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 drop-shadow-md dark:text-white">
                Ticket <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Formatter</span>
              </h1>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium max-w-2xl leading-relaxed mt-2 text-sm sm:text-base opacity-90">
            Convert large lists of ticket numbers into any code or query format instantly. Automatically chunks large sets into 500-ticket batches for seamless integration.
          </p>
        </div>
      </motion.div>

      {/* ─── Main Content Grid ─────────────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-2">
        
        {/* Left Side: Input Panel */}
        <motion.div initial="hidden" animate="show" variants={containerVariants} className="h-full">
          <Card className="h-full border border-white/10 shadow-2xl bg-white/5 dark:bg-white/5 backdrop-blur-3xl rounded-3xl overflow-hidden relative group transition-all duration-500 focus-within:shadow-[0_0_50px_-15px_rgba(59,130,246,0.3)] focus-within:border-blue-500/40">
            <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
            
            <CardHeader className="bg-white/10 dark:bg-white/10 px-8 py-6 border-b border-white/10 dark:border-slate-800/50 flex flex-row items-center justify-between relative z-10 backdrop-blur-md">
              <CardTitle className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Input Tickets
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-bold bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-300 dark:border-slate-700 px-3 py-1 text-blue-600 dark:text-blue-400 shadow-sm">
                  {tickets.length} tickets
                </Badge>
                {batchCount > 1 && (
                  <Badge variant="outline" className="text-xs font-bold bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-300 dark:border-slate-700 px-3 py-1 text-indigo-600 dark:text-indigo-400 shadow-sm">
                    {batchCount} batches
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setInput("")} 
                  aria-label="Clear tickets" 
                  className="h-8 w-8 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors ml-2 bg-slate-100 dark:bg-slate-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 relative z-10 h-[calc(100%-80px)] flex flex-col">
              <div className="relative flex-1 flex flex-col group min-h-[350px] rounded-2xl overflow-hidden bg-slate-50/10 dark:bg-slate-900/10">
                <svg className={cn(
                  "absolute inset-0 h-full w-full pointer-events-none rounded-2xl transition-colors duration-300 z-0",
                  "animate-[dash_3s_linear_infinite] group-hover:animate-[dash_1.5s_linear_infinite] group-focus-within:animate-[dash_0.75s_linear_infinite]"
                )} xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="shimmerGradientInput" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="none" rx="16" ry="16" stroke="url(#shimmerGradientInput)" strokeWidth="2" strokeDasharray="20, 20" strokeLinecap="round" className="opacity-50 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />
                </svg>
                <Textarea
                  placeholder={`Paste ticket numbers here...\n\nA260182314123\nA260182314124\nA260182314125`}
                  className="flex-1 min-h-[350px] font-mono text-sm leading-relaxed rounded-2xl border-transparent bg-transparent text-slate-800 dark:text-slate-100 focus-visible:ring-0 focus-visible:outline-none p-6 shadow-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 relative z-10"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-5 flex items-center gap-2 font-medium bg-slate-100/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <svg className="h-4 w-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Values are automatically chunked into {batchSize}-ticket batches for optimal query performance.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Side: Options and Result */}
        <div className="space-y-8 flex flex-col h-full">
          
          {/* Format Options */}
          <motion.div initial="hidden" animate="show" variants={containerVariants}>
            <Card className="border border-white/10 shadow-xl bg-white/5 dark:bg-white/5 backdrop-blur-3xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-transparent px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-sm font-black tracking-widest uppercase text-slate-600 dark:text-slate-400">
                  Select Output Format
                </CardTitle>
                <div className="flex flex-col gap-1.5 w-full sm:w-[160px] ml-auto">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">
                      Batch Size
                    </span>
                    <span className="text-[10px] font-bold text-blue-500 tracking-wide">
                      {batchSize} tickets
                    </span>
                  </div>
                  <div className="relative flex items-center h-1 w-full bg-black/10 dark:bg-slate-800/50 rounded-full overflow-visible">
                    <div 
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white/30 via-white to-white/30 animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                      style={{ width: `${(batchSize / 2000) * 100}%` }} 
                    />
                    <input
                      type="range"
                      min="10"
                      max="2000"
                      step="10"
                      value={batchSize}
                      onChange={(e) => setBatchSize(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(59,130,246,0.8)] [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-none"
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-400 leading-none mt-1">
                    <span>10</span>
                    <span>1000</span>
                    <span>2000</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 max-h-[220px] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {FORMATS.map((f) => (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      key={f.id}
                      onClick={() => setSelectedFormat(f.id)}
                      className={cn(
                        "flex items-center justify-center min-h-[48px] rounded-xl border px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 relative group backdrop-blur-md shadow-sm",
                        selectedFormat === f.id
                          ? "border-transparent text-white"
                          : "border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 overflow-hidden"
                      )}
                    >
                      {selectedFormat === f.id && (
                        <motion.div
                          layoutId="formatter-type-slider"
                          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 rounded-xl"
                          initial={false}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{f.label}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Output Result panel */}
          <motion.div initial="hidden" animate="show" variants={containerVariants} className="flex-1 min-h-[300px]">
            <Card className="h-full border border-white/10 shadow-2xl bg-white/5 dark:bg-white/5 backdrop-blur-3xl rounded-3xl overflow-hidden flex flex-col relative group transition-all duration-500 focus-within:shadow-[0_0_50px_-15px_rgba(99,102,241,0.3)] focus-within:border-indigo-500/40">
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
                    className="flex items-center justify-between rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-5 py-3 shadow-sm"
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Batch <span className="text-slate-800 dark:text-slate-100">{batchIndex + 1}</span> of {batchCount}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300" 
                        disabled={batchIndex <= 0} 
                        onClick={() => setBatchIndex((i) => Math.max(0, i - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300" 
                        disabled={batchIndex >= batchCount - 1} 
                        onClick={() => setBatchIndex((i) => Math.min(batchCount - 1, i + 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-4 rounded-lg text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-500/10 gap-1.5 text-xs transition-colors" 
                        onClick={() => handleCopy(currentOutput)}
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy Batch
                      </Button>
                    </div>
                  </motion.div>
                )}
                
                <div className="relative flex-1 flex flex-col group min-h-[250px] rounded-2xl overflow-hidden bg-slate-50/10 dark:bg-slate-900/10 h-full">
                  <svg className={cn(
                    "absolute inset-0 h-full w-full pointer-events-none rounded-2xl transition-colors duration-300 z-0",
                    "animate-[dash_3s_linear_infinite] group-hover:animate-[dash_1.5s_linear_infinite] group-focus-within:animate-[dash_0.75s_linear_infinite]"
                  )} xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="shimmerGradientOutput" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="none" rx="16" ry="16" stroke="url(#shimmerGradientOutput)" strokeWidth="2" strokeDasharray="20, 20" strokeLinecap="round" className="opacity-50 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />
                  </svg>
                  <Textarea
                    readOnly
                    value={currentOutput}
                    className="h-full min-h-[250px] font-mono text-sm leading-relaxed rounded-2xl border-transparent bg-transparent text-slate-800 dark:text-slate-200 p-6 shadow-none transition-all resize-none custom-scrollbar focus-visible:ring-0 focus-visible:outline-none relative z-10"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none group-hover:ring-emerald-500/20 transition-all duration-300 z-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
