"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCcw, Sparkles, Calculator, CheckCircle2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FORMULAS = [
  {
    id: "xlookup",
    label: "XLOOKUP",
    desc: "Modern lookup function",
    params: [
      { key: "lookup_value", label: "Lookup Value", placeholder: "A2" },
      { key: "lookup_array", label: "Lookup Array", placeholder: "Sheet1!A:A" },
      { key: "return_array", label: "Return Array", placeholder: "Sheet1!B:B" },
    ],
    build: (p: Record<string, string>) => `=XLOOKUP(${p.lookup_value || '""'}, ${p.lookup_array || '""'}, ${p.return_array || '""'})`,
  },
  {
    id: "vlookup",
    label: "VLOOKUP",
    desc: "Vertical lookup",
    params: [
      { key: "lookup_value", label: "Lookup Value", placeholder: "A2" },
      { key: "table_array", label: "Table Array", placeholder: "A1:D100" },
      { key: "col_index", label: "Column Index", placeholder: "2" },
    ],
    build: (p: Record<string, string>) => `=VLOOKUP(${p.lookup_value || '""'}, ${p.table_array || '""'}, ${p.col_index || '1'}, FALSE)`,
  },
  {
    id: "sumifs",
    label: "SUMIFS",
    desc: "Sum with multiple criteria",
    params: [
      { key: "sum_range", label: "Sum Range", placeholder: "C:C" },
      { key: "criteria_range", label: "Criteria Range", placeholder: "A:A" },
      { key: "criteria", label: "Criteria", placeholder: '"Completed"' },
    ],
    build: (p: Record<string, string>) => `=SUMIFS(${p.sum_range || '""'}, ${p.criteria_range || '""'}, ${p.criteria || '""'})`,
  },
  {
    id: "countifs",
    label: "COUNTIFS",
    desc: "Count with multiple criteria",
    params: [
      { key: "criteria_range", label: "Criteria Range", placeholder: "A:A" },
      { key: "criteria", label: "Criteria", placeholder: '"Open"' },
    ],
    build: (p: Record<string, string>) => `=COUNTIFS(${p.criteria_range || '""'}, ${p.criteria || '""'})`,
  },
  {
    id: "index-match",
    label: "INDEX MATCH",
    desc: "Flexible two-way lookup",
    params: [
      { key: "array", label: "Return Array", placeholder: "B:B" },
      { key: "lookup_value", label: "Lookup Value", placeholder: "A2" },
      { key: "lookup_array", label: "Lookup Array", placeholder: "A:A" },
    ],
    build: (p: Record<string, string>) => `=INDEX(${p.array || '""'}, MATCH(${p.lookup_value || '""'}, ${p.lookup_array || '""'}, 0))`,
  },
  {
    id: "textjoin",
    label: "TEXTJOIN",
    desc: "Combine text from ranges",
    params: [
      { key: "delimiter", label: "Delimiter", placeholder: '", "' },
      { key: "ignore_empty", label: "Ignore Empty", placeholder: "TRUE" },
      { key: "text1", label: "Text Array", placeholder: "A1:A10" },
    ],
    build: (p: Record<string, string>) => `=TEXTJOIN(${p.delimiter || '""'}, ${p.ignore_empty || 'TRUE'}, ${p.text1 || '""'})`,
  },
  {
    id: "unique",
    label: "UNIQUE",
    desc: "Extract unique values",
    params: [
      { key: "array", label: "Array", placeholder: "A1:A100" },
    ],
    build: (p: Record<string, string>) => `=UNIQUE(${p.array || '""'})`,
  },
  {
    id: "filter",
    label: "FILTER",
    desc: "Filter range by condition",
    params: [
      { key: "array", label: "Array", placeholder: "A1:C100" },
      { key: "include", label: "Include Condition", placeholder: 'B:B="Active"' },
    ],
    build: (p: Record<string, string>) => `=FILTER(${p.array || '""'}, ${p.include || '""'})`,
  },
] as const;

export default function FormulaGeneratorPage() {
  const [selected, setSelected] = React.useState<string>("xlookup");
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [output, setOutput] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const formula = FORMULAS.find((f) => f.id === selected)!;

  const handleBuild = () => {
    const result = formula.build(values);
    setOutput(result);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Formula copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Hero Header Area */}
      <div className="relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="relative z-10 max-w-2xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-md border border-white/20">
            <Sparkles className="h-4 w-4 text-emerald-200" />
            <span className="text-white/95 tracking-wide">Excel Magic</span>
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl leading-tight">
            Formula Generator <br className="hidden sm:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-cyan-200">Without the Headache</span>
          </h1>
          <p className="text-lg text-white/80 max-w-xl font-light">
            Build complex Excel formulas visually. Never worry about commas, brackets, or syntax errors again.
          </p>
        </motion.div>
        
        {/* Abstract shapes */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl mix-blend-screen" />
        <div className="absolute -bottom-32 right-10 h-64 w-64 rounded-full bg-cyan-400/30 blur-3xl mix-blend-screen" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Functions List */}
        <div className="flex flex-col gap-6 lg:col-span-4 xl:col-span-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
              <CardHeader className="border-b bg-muted/40 pb-4 sticky top-0 z-10 backdrop-blur-md">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-400">
                    <Calculator className="h-5 w-5" />
                  </div>
                  Functions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid max-h-[60vh] grid-cols-1 gap-2 overflow-y-auto pr-2 custom-scrollbar">
                  {FORMULAS.map((f, idx) => {
                    const isSelected = selected === f.id;
                    return (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        key={f.id}
                        onClick={() => { setSelected(f.id); setValues({}); setOutput(""); }}
                        className={cn(
                          "group relative flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all duration-300",
                          isSelected
                            ? "border-emerald-500/50 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500/20 dark:bg-emerald-500/10"
                            : "border-border/60 bg-card hover:border-emerald-500/40 hover:bg-emerald-50/30 hover:shadow-sm dark:hover:bg-emerald-500/5"
                        )}
                      >
                        <div>
                          <p className={cn(
                            "text-sm font-bold transition-colors duration-300",
                            isSelected ? "text-emerald-700 dark:text-emerald-300" : "text-foreground group-hover:text-emerald-600"
                          )}>
                            {f.label}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground/80 mt-0.5">
                            {f.desc}
                          </p>
                        </div>
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <ChevronRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Parameters and Result */}
        <div className="flex flex-col gap-6 lg:col-span-8 xl:col-span-8">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition-shadow hover:shadow-xl relative min-h-[350px] flex flex-col">
              <CardHeader className="border-b bg-gradient-to-b from-muted/50 to-muted/10 px-6 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-2 py-1 text-xs font-bold uppercase tracking-widest text-emerald-600 border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {formula.label}
                    </Badge>
                    <CardTitle className="text-lg">Parameters</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-muted-foreground hover:text-foreground" 
                    onClick={() => { setValues({}); setOutput(""); }}
                  >
                    <RefreshCcw className="h-4 w-4" /> Reset Fields
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6 space-y-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px]">
                <div className="grid gap-5">
                  <AnimatePresence mode="popLayout">
                    {formula.params.map((param, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        key={formula.id + "-" + param.key} 
                        className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4"
                      >
                        <label className="text-sm font-semibold text-foreground sm:text-right">{param.label}</label>
                        <div className="sm:col-span-3">
                          <Input
                            className="h-11 rounded-xl border-border/70 shadow-sm focus-visible:ring-emerald-500/30 transition-all hover:border-emerald-500/40"
                            placeholder={param.placeholder}
                            value={values[param.key] ?? ""}
                            onChange={(e) => {
                              setValues((v) => ({ ...v, [param.key]: e.target.value }));
                              setOutput(""); // Reset output on change
                            }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button 
                    size="lg"
                    className="min-w-[160px] gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 font-semibold"
                    onClick={handleBuild}
                  >
                    <Sparkles className="h-4 w-4" /> Generate Formula
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition-shadow hover:shadow-xl bg-slate-900">
              <CardHeader className="border-b border-slate-800 bg-slate-950 px-6 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-base text-slate-200 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Output Result
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn(
                      "gap-2 border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-all",
                      copied && "border-emerald-500/50 text-emerald-400 bg-emerald-900/20"
                    )}
                    onClick={handleCopy} 
                    disabled={!output}
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />} 
                    {copied ? "Copied" : "Copy Formula"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative">
                  <Textarea
                    readOnly
                    value={output}
                    placeholder="Your generated formula will appear here..."
                    className="min-h-[120px] font-mono text-base bg-slate-950 border-slate-800 text-emerald-400 placeholder:text-slate-600 resize-none focus-visible:ring-emerald-500/30 custom-scrollbar shadow-inner"
                  />
                  {!output && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 opacity-50" />
                        Fill parameters and click Generate
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
