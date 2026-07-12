"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Trash2 } from "lucide-react";
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

export default function TicketFormatterPage() {
  const [input, setInput] = React.useState("");
  const [selectedFormat, setSelectedFormat] = React.useState<string>("soql-in");
  const [output, setOutput] = React.useState("");

  const tickets = React.useMemo(() => {
    return input
      .split(/[\n\r,\t]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }, [input]);

  const handleFormat = React.useCallback(() => {
    const format = FORMATS.find((f) => f.id === selectedFormat);
    if (!format || tickets.length === 0) {
      setOutput("");
      return;
    }
    const lines = tickets.map(format.wrap);
    let result = lines.join(format.join);
    if (format.prefix) result = format.prefix + result;
    if (format.suffix) result = result + format.suffix;
    setOutput(result);
  }, [tickets, selectedFormat]);

  React.useEffect(() => {
    handleFormat();
  }, [handleFormat]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets-${selectedFormat}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Ticket Formatter</h1>
        <p className="text-sm text-muted-foreground">Convert ticket numbers into any format instantly</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Input Tickets</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{tickets.length} tickets</Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setInput("")}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`Paste ticket numbers here...\nA260182314123\nA260182314124\nA260182314125`}
                className="min-h-[320px] font-mono text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.25 }} className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Output Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFormat(f.id)}
                    className={`rounded-md border px-3 py-2 text-left text-sm font-medium transition-all ${
                      selectedFormat === f.id
                        ? "border-primary bg-hover text-primary"
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Result</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={handleCopy}>
                    <Copy className="h-4 w-4" /> Copy
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={handleDownload}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                readOnly
                value={output}
                className="min-h-[200px] font-mono text-sm bg-muted"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
