"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

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
];

const BATCH_SIZE = 500;

export default function TicketFormatterPage() {
  const [input, setInput] = React.useState("");
  const [selectedFormat, setSelectedFormat] = React.useState<string>("soql-in");
  const [batchIndex, setBatchIndex] = React.useState(0);

  const tickets = React.useMemo(() => {
    return input
      .split(/[\n\r,\t]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }, [input]);

  const batches = React.useMemo(() => {
    const chunks: string[][] = [];
    for (let i = 0; i < tickets.length; i += BATCH_SIZE) {
      chunks.push(tickets.slice(i, i + BATCH_SIZE));
    }
    return chunks;
  }, [tickets]);

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
    toast.success("Copied to clipboard");
  };

  const handleCopyAll = () => {
    if (outputBatches.length === 0) return;
    navigator.clipboard.writeText(outputBatches.join("\n\n"));
    toast.success("Copied all batches to clipboard");
  };

  const handleDownload = () => {
    if (outputBatches.length === 0) return;
    const blob = new Blob([outputBatches.join("\n\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets-${selectedFormat}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold leading-tight tracking-tight text-foreground">Ticket Formatter</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">Convert ticket numbers into any format instantly</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-base">Input Tickets</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{tickets.length} tickets</Badge>
                  {batchCount > 1 && (
                    <Badge variant="outline">{batchCount} batches</Badge>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setInput("")} aria-label="Clear tickets">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`Paste ticket numbers here...\nA260182314123\nA260182314124\nA260182314125`}
                className="min-h-[240px] font-mono text-sm sm:min-h-[320px]"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1.5">Values are automatically chunked into 500-ticket batches per output block.</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.25 }} className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Output Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {FORMATS.map((f) => (
                  <button
                    type="button"
                    key={f.id}
                    onClick={() => setSelectedFormat(f.id)}
                    className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                      selectedFormat === f.id
                        ? "border-accent bg-hover text-accent"
                        : "border-border bg-card text-muted-foreground hover:bg-hover hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">Result</CardTitle>
                  {batchCount > 1 && (
                    <Badge variant="outline" className="text-[10px]">{batchCount} batch{batchCount === 1 ? "" : "es"}</Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="ghost" size="sm" className="gap-1" onClick={handleCopyAll} disabled={outputBatches.length === 0}>
                    <Copy className="h-4 w-4" /> Copy All
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1" onClick={handleDownload} disabled={outputBatches.length === 0}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {batchCount > 1 && (
                <div className="flex items-center justify-between rounded-md border border-border/70 bg-muted/20 px-3 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Batch {batchIndex + 1} / {batchCount}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={batchIndex <= 0} onClick={() => setBatchIndex((i) => Math.max(0, i - 1))}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={batchIndex >= batchCount - 1} onClick={() => setBatchIndex((i) => Math.min(batchCount - 1, i + 1))}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => handleCopy(currentOutput)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
              <Textarea
                readOnly
                value={currentOutput}
                className="min-h-[200px] font-mono text-sm bg-muted"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
