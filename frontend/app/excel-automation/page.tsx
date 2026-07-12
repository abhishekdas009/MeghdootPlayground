"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

const OPERATIONS = [
  { id: "remove-duplicates", label: "Remove Duplicates" },
  { id: "trim-spaces", label: "Trim Spaces" },
  { id: "remove-blank-rows", label: "Remove Blank Rows" },
  { id: "remove-blank-cols", label: "Remove Blank Columns" },
  { id: "uppercase", label: "Uppercase" },
  { id: "lowercase", label: "Lowercase" },
  { id: "proper-case", label: "Proper Case" },
  { id: "remove-quotes", label: "Remove Quotes" },
  { id: "freeze-header", label: "Freeze Header" },
  { id: "auto-width", label: "Auto Width" },
] as const;

export default function ExcelAutomationPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [selectedOps, setSelectedOps] = React.useState<Set<string>>(new Set());
  const [processing, setProcessing] = React.useState(false);

  const toggleOp = (id: string) => {
    const next = new Set(selectedOps);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedOps(next);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      toast.success(`Uploaded ${f.name}`);
    }
  };

  const handleProcess = async () => {
    if (!file) { toast.error("Upload a file first"); return; }
    if (selectedOps.size === 0) { toast.error("Select at least one operation"); return; }
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setProcessing(false);
    toast.success("Processing complete — download ready");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Excel Automation</h1>
        <p className="text-sm text-muted-foreground">Upload, clean, and transform spreadsheets without formulas</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Upload File</CardTitle></CardHeader>
            <CardContent>
              <label className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-hover transition-all">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{file ? file.name : "Drop Excel file here"}</p>
                  <p className="text-xs text-muted-foreground mt-1">.xlsx or .xls</p>
                </div>
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Operations</CardTitle>
                <Badge variant="outline">{selectedOps.size} selected</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {OPERATIONS.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => toggleOp(op.id)}
                    className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm font-medium transition-all ${
                      selectedOps.has(op.id)
                        ? "border-primary bg-hover text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-hover hover:text-foreground"
                    }`}
                  >
                    {op.label}
                    {selectedOps.has(op.id) && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.25 }} className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Preview</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8" disabled={!file} onClick={handleProcess}>
                    {processing ? "Processing..." : "Process"}
                  </Button>
                  <Button variant="primary" size="sm" className="h-8 gap-1" disabled={!file}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex h-full min-h-[400px] items-center justify-center rounded-md border border-dashed border-border bg-muted">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-muted-foreground">Upload a file to see preview</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
