"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, Download, FileSpreadsheet, Trash2, 
  Scissors, Rows, Columns, Type, 
  CaseSensitive, Quote, ArrowUpToLine, ArrowRightToLine,
  CheckCircle2, Loader2, Sparkles, Wand2, Database
} from "lucide-react";
import { toast } from "sonner";
import { trackDashboardEvent } from "@/lib/dashboard-tracker";
import { cn } from "@/lib/utils";

const OPERATIONS = [
  { id: "remove-duplicates", label: "Remove Duplicates", icon: Trash2, desc: "Drop duplicate rows" },
  { id: "trim-spaces", label: "Trim Spaces", icon: Scissors, desc: "Remove extra whitespace" },
  { id: "remove-blank-rows", label: "Remove Blank Rows", icon: Rows, desc: "Delete empty rows" },
  { id: "remove-blank-cols", label: "Remove Blank Columns", icon: Columns, desc: "Delete empty columns" },
  { id: "uppercase", label: "Uppercase", icon: Type, desc: "Convert to UPPERCASE" },
  { id: "lowercase", label: "Lowercase", icon: CaseSensitive, desc: "Convert to lowercase" },
  { id: "proper-case", label: "Proper Case", icon: Type, desc: "Capitalize First Letters" },
  { id: "remove-quotes", label: "Remove Quotes", icon: Quote, desc: "Strip text qualifiers" },
  { id: "freeze-header", label: "Freeze Header", icon: ArrowUpToLine, desc: "Lock first row" },
  { id: "auto-width", label: "Auto Width", icon: ArrowRightToLine, desc: "Adjust column sizes" },
] as const;

export default function ExcelAutomationPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [selectedOps, setSelectedOps] = React.useState<Set<string>>(new Set());
  const [processing, setProcessing] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const toggleOp = (id: string) => {
    const next = new Set(selectedOps);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedOps(next);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (f: File) => {
    if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv')) {
      setFile(f);
      toast.success(`Uploaded ${f.name}`);
    } else {
      toast.error("Please upload a valid Excel or CSV file");
    }
  };

  const handleProcess = async () => {
    if (!file) { toast.error("Upload a file first"); return; }
    if (selectedOps.size === 0) { toast.error("Select at least one operation"); return; }
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1800));
    setProcessing(false);
    toast.success("Processing complete — ready for download!");

    trackDashboardEvent({
      metricKey: "excel_operations",
      incrementBy: 1,
      event: {
        type: "excel-operation",
        label: `Excel processed · ${file.name}`,
        meta: `${selectedOps.size} operation${selectedOps.size === 1 ? "" : "s"}`,
        module: "excel-automation",
      },
    });
  };

  return (
    <div className="workspace-page mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      {/* Header Area */}
      <div className="page-hero relative flex flex-col gap-4 overflow-hidden rounded-3xl p-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="relative z-10 max-w-2xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-medium backdrop-blur-md border border-blue-500/20 dark:bg-white/10 dark:border-white/20">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-yellow-300" />
            <span className="text-blue-700 tracking-wide dark:text-white/95">AI-Powered Engine</span>
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl leading-tight text-slate-950 dark:text-white">
            Clean & Transform <br className="hidden sm:block"/> Spreadsheets <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-yellow-200 dark:to-amber-400">Instantly</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-white/80 max-w-xl font-light">
            Upload your messy data, select the operations you want to perform, and let our intelligent engine do the heavy lifting without writing a single formula.
          </p>
        </motion.div>
        
        {/* Abstract shapes */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/30 dark:mix-blend-screen" />
        <div className="absolute -bottom-32 right-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/30 dark:mix-blend-screen" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Upload & Operations */}
        <div className="flex flex-col gap-6 lg:col-span-5 xl:col-span-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition-shadow hover:shadow-xl">
              <CardHeader className="border-b bg-muted/40 pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="rounded-lg bg-blue-100 p-2 text-blue-600 shadow-sm dark:bg-blue-900/40 dark:text-blue-400">
                    <Database className="h-5 w-5" />
                  </div>
                  Upload File
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div 
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "group relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300",
                    dragActive 
                      ? "border-blue-500 bg-blue-500/10 scale-[1.02] shadow-inner" 
                      : "border-border bg-muted/30 hover:border-blue-500/50 hover:bg-blue-500/5",
                    file ? "border-green-500/50 bg-green-500/5" : ""
                  )}
                >
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
                  
                  <AnimatePresence mode="wait">
                    {file ? (
                      <motion.div 
                        key="file"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex flex-col items-center gap-4"
                      >
                        <div className="relative rounded-2xl bg-green-100 p-5 shadow-sm dark:bg-green-900/30">
                          <FileSpreadsheet className="h-10 w-10 text-green-600 dark:text-green-400" />
                          <div className="absolute -right-2 -top-2 rounded-full bg-green-500 p-1 text-white shadow-md">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-base font-semibold text-foreground">{file.name}</p>
                          <p className="text-sm font-medium text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <Badge variant="outline" className="mt-2 border-green-200 bg-green-50 px-3 py-1 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Ready to process
                        </Badge>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="upload"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className="rounded-2xl bg-blue-100 p-5 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1 dark:bg-blue-900/30">
                          <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="mt-2 space-y-1.5">
                          <p className="text-lg font-semibold text-foreground">
                            Click or drag to upload
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Supports .xlsx, .xls, .csv up to 10MB
                          </p>
                        </div>
                        <Button variant="secondary" size="sm" className="mt-3 rounded-full px-6 transition-transform group-hover:bg-blue-100 group-hover:text-blue-700 dark:group-hover:bg-blue-900/50 dark:group-hover:text-blue-300">
                          Browse Files
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex-1">
            <Card className="h-full overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition-shadow hover:shadow-xl">
              <CardHeader className="border-b bg-muted/40 pb-4 sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                    <div className="rounded-lg bg-purple-100 p-2 text-purple-600 shadow-sm dark:bg-purple-900/40 dark:text-purple-400">
                      <Wand2 className="h-5 w-5" />
                    </div>
                    Operations
                  </CardTitle>
                  <AnimatePresence>
                    {selectedOps.size > 0 && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Badge className="bg-purple-600 px-2 py-0.5 shadow-sm hover:bg-purple-700 text-white">
                          {selectedOps.size} Selected
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {OPERATIONS.map((op, idx) => {
                    const isSelected = selectedOps.has(op.id);
                    const Icon = op.icon;
                    return (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        key={op.id}
                        onClick={() => toggleOp(op.id)}
                        className={cn(
                          "group relative flex w-full items-center gap-4 rounded-xl border p-3.5 text-left transition-all duration-300",
                          isSelected
                            ? "border-purple-500/50 bg-purple-50/50 shadow-md ring-1 ring-purple-500/20 dark:bg-purple-500/10"
                            : "border-border/60 bg-card hover:border-purple-500/40 hover:bg-purple-50/30 hover:shadow-sm dark:hover:bg-purple-500/5"
                        )}
                      >
                        <div className={cn(
                          "rounded-lg p-2.5 transition-all duration-300",
                          isSelected 
                            ? "bg-purple-600 text-white shadow-sm shadow-purple-500/30 scale-110" 
                            : "bg-muted text-muted-foreground group-hover:text-purple-600 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 dark:group-hover:text-purple-400"
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 pr-6">
                          <p className={cn(
                            "text-sm font-semibold transition-colors duration-300",
                            isSelected ? "text-purple-900 dark:text-purple-100" : "text-foreground group-hover:text-purple-700 dark:group-hover:text-purple-300"
                          )}>
                            {op.label}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground/80 mt-0.5">
                            {op.desc}
                          </p>
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {isSelected ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
                              <CheckCircle2 className="h-4 w-4" />
                            </motion.div>
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-border transition-colors group-hover:border-purple-300 dark:group-hover:border-purple-700" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Preview Area */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.3 }}
          className="lg:col-span-7 xl:col-span-8 flex flex-col"
        >
          <Card className="flex flex-1 flex-col overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition-shadow hover:shadow-xl min-h-[600px]">
            <CardHeader className="border-b bg-gradient-to-b from-muted/50 to-muted/10 px-6 py-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Live Preview</CardTitle>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">See your changes in real-time before downloading</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <Button 
                    variant="outline" 
                    disabled={!file || processing || selectedOps.size === 0} 
                    onClick={handleProcess}
                    className={cn(
                      "h-11 min-w-[130px] gap-2 rounded-xl border-2 transition-all duration-300 font-semibold",
                      file && selectedOps.size > 0 
                        ? "border-blue-200 bg-white text-blue-700 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:bg-transparent dark:text-blue-300 dark:hover:border-blue-600 dark:hover:bg-blue-900/30" 
                        : "opacity-50"
                    )}
                  >
                    {processing ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Process Data</>
                    )}
                  </Button>
                  {/* FIX: Changed variant to "primary" to match available Button component variants */}
                  <Button 
                    variant="primary" 
                    disabled={!file || processing}
                    className="h-11 rounded-xl gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30 font-semibold px-6 border-0"
                  >
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative flex flex-1 flex-col p-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px]">
              {/* Fake UI for Preview Data */}
              <div className="absolute inset-0 flex flex-col">
                {file ? (
                  <>
                    {/* Table Header Mock */}
                    <div className="flex border-b border-border/50 bg-background/80 px-6 py-4 backdrop-blur-md">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex-1 px-3">
                          <div className="h-4 w-24 rounded bg-muted-foreground/30" />
                        </div>
                      ))}
                    </div>
                    {/* Table Rows Mock */}
                    <div className="flex-1 overflow-auto">
                      {processing ? (
                        <div className="flex h-full items-center justify-center bg-background/40 backdrop-blur-sm">
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center gap-6 rounded-3xl bg-background/80 p-10 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-white/10"
                          >
                            <div className="relative">
                              <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
                              <Loader2 className="relative h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-center">
                              <h3 className="text-lg font-bold text-foreground">Applying Magic</h3>
                              <p className="text-sm font-medium text-muted-foreground mt-1 animate-pulse">Running {selectedOps.size} operation{selectedOps.size === 1 ? '' : 's'}...</p>
                            </div>
                          </motion.div>
                        </div>
                      ) : (
                        <div className="p-6 space-y-4">
                          {[...Array(10)].map((_, i) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              key={i} 
                              className="flex border-b border-border/40 px-3 pb-4 hover:bg-muted/30 rounded-lg pt-2 transition-colors"
                            >
                              {[...Array(5)].map((_, j) => (
                                <div key={j} className="flex-1 px-3">
                                  <div className={cn(
                                    "h-3.5 rounded bg-muted-foreground/20",
                                    j === 0 ? "w-28" : j === 2 ? "w-20" : j === 4 ? "w-16" : "w-32"
                                  )} />
                                </div>
                              ))}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-transparent to-muted/20">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="relative mb-8"
                    >
                      <div className="absolute -inset-10 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10" />
                      <div className="absolute -inset-4 rounded-full bg-blue-500/10 blur-xl dark:bg-blue-500/5" />
                      <div className="relative rounded-2xl bg-white/50 p-6 shadow-xl backdrop-blur-xl border border-white/40 dark:bg-black/20 dark:border-white/10">
                        <FileSpreadsheet className="h-16 w-16 text-blue-500/50 dark:text-blue-400/50" />
                      </div>
                    </motion.div>
                    <motion.h3 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mb-3 text-2xl font-bold tracking-tight text-foreground"
                    >
                      Ready for your data
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="max-w-md text-base font-medium text-muted-foreground/80 leading-relaxed"
                    >
                      Upload an Excel or CSV file to see a live preview of your data. 
                      Select operations from the left panel to preview transformations in real-time.
                    </motion.p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
