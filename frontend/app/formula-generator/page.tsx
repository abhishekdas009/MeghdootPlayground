"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

const FORMULAS = [
  {
    id: "xlookup",
    label: "XLOOKUP",
    params: [
      { key: "lookup_value", label: "Lookup Value", placeholder: "A2" },
      { key: "lookup_array", label: "Lookup Array", placeholder: "Sheet1!A:A" },
      { key: "return_array", label: "Return Array", placeholder: "Sheet1!B:B" },
    ],
    build: (p: Record<string, string>) => `=XLOOKUP(${p.lookup_value}, ${p.lookup_array}, ${p.return_array})`,
  },
  {
    id: "vlookup",
    label: "VLOOKUP",
    params: [
      { key: "lookup_value", label: "Lookup Value", placeholder: "A2" },
      { key: "table_array", label: "Table Array", placeholder: "A1:D100" },
      { key: "col_index", label: "Column Index", placeholder: "2" },
    ],
    build: (p: Record<string, string>) => `=VLOOKUP(${p.lookup_value}, ${p.table_array}, ${p.col_index}, FALSE)`,
  },
  {
    id: "sumifs",
    label: "SUMIFS",
    params: [
      { key: "sum_range", label: "Sum Range", placeholder: "C:C" },
      { key: "criteria_range", label: "Criteria Range", placeholder: "A:A" },
      { key: "criteria", label: "Criteria", placeholder: '"Completed"' },
    ],
    build: (p: Record<string, string>) => `=SUMIFS(${p.sum_range}, ${p.criteria_range}, ${p.criteria})`,
  },
  {
    id: "countifs",
    label: "COUNTIFS",
    params: [
      { key: "criteria_range", label: "Criteria Range", placeholder: "A:A" },
      { key: "criteria", label: "Criteria", placeholder: '"Open"' },
    ],
    build: (p: Record<string, string>) => `=COUNTIFS(${p.criteria_range}, ${p.criteria})`,
  },
  {
    id: "index-match",
    label: "INDEX MATCH",
    params: [
      { key: "array", label: "Array", placeholder: "B:B" },
      { key: "lookup_value", label: "Lookup Value", placeholder: "A2" },
      { key: "lookup_array", label: "Lookup Array", placeholder: "A:A" },
    ],
    build: (p: Record<string, string>) => `=INDEX(${p.array}, MATCH(${p.lookup_value}, ${p.lookup_array}, 0))`,
  },
  {
    id: "textjoin",
    label: "TEXTJOIN",
    params: [
      { key: "delimiter", label: "Delimiter", placeholder: '", "' },
      { key: "ignore_empty", label: "Ignore Empty", placeholder: "TRUE" },
      { key: "text1", label: "Text 1", placeholder: "A1:A10" },
    ],
    build: (p: Record<string, string>) => `=TEXTJOIN(${p.delimiter}, ${p.ignore_empty}, ${p.text1})`,
  },
  {
    id: "unique",
    label: "UNIQUE",
    params: [
      { key: "array", label: "Array", placeholder: "A1:A100" },
    ],
    build: (p: Record<string, string>) => `=UNIQUE(${p.array})`,
  },
  {
    id: "filter",
    label: "FILTER",
    params: [
      { key: "array", label: "Array", placeholder: "A1:C100" },
      { key: "include", label: "Include", placeholder: 'B:B="Active"' },
    ],
    build: (p: Record<string, string>) => `=FILTER(${p.array}, ${p.include})`,
  },
  {
    id: "let",
    label: "LET",
    params: [
      { key: "name1", label: "Name 1", placeholder: "x" },
      { key: "value1", label: "Value 1", placeholder: "10" },
      { key: "calculation", label: "Calculation", placeholder: "x*2" },
    ],
    build: (p: Record<string, string>) => `=LET(${p.name1}, ${p.value1}, ${p.calculation})`,
  },
  {
    id: "lambda",
    label: "LAMBDA",
    params: [
      { key: "param", label: "Parameter", placeholder: "x" },
      { key: "calculation", label: "Calculation", placeholder: "x+1" },
    ],
    build: (p: Record<string, string>) => `=LAMBDA(${p.param}, ${p.calculation})`,
  },
] as const;

export default function FormulaGeneratorPage() {
  const [selected, setSelected] = React.useState<string>("xlookup");
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [output, setOutput] = React.useState("");

  const formula = FORMULAS.find((f) => f.id === selected)!;

  const handleBuild = () => {
    const result = formula.build(values);
    setOutput(result);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Formula copied");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Formula Generator</h1>
        <p className="text-sm text-muted-foreground">Build Excel formulas without memorizing syntax</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Functions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-1.5 max-h-[500px] overflow-y-auto pr-1">
                {FORMULAS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => { setSelected(f.id); setValues({}); setOutput(""); }}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all ${
                      selected === f.id
                        ? "bg-hover text-primary border border-primary"
                        : "text-muted-foreground hover:bg-hover hover:text-foreground"
                    }`}
                  >
                    {f.label}
                    {selected === f.id && <Badge variant="default" className="text-[10px]">Active</Badge>}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.25 }} className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{formula.label} Parameters</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setValues({})}>
                  <RefreshCcw className="h-4 w-4" /> Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formula.params.map((param) => (
                  <div key={param.key} className="grid grid-cols-3 items-center gap-3">
                    <label className="text-sm font-medium text-foreground">{param.label}</label>
                    <Input
                      className="col-span-2"
                      placeholder={param.placeholder}
                      value={values[param.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [param.key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="pt-2">
                  <Button className="w-full" onClick={handleBuild}>Build Formula</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Result</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={handleCopy} disabled={!output}>
                  <Copy className="h-4 w-4" /> Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                readOnly
                value={output}
                placeholder="Formula will appear here..."
                className="min-h-[100px] font-mono text-sm bg-muted"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
