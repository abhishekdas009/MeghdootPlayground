"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassHero, GlassSpotlightCard } from "@/components/ui/glass-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EASE_120HZ, GLASS_TAB_SPRING } from "@/lib/motion";
import { Copy, RefreshCcw, Sparkles, Calculator, CheckCircle2, ChevronRight, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FormulaDef {
  id: string;
  label: string;
  desc: string;
  category: "Lookup" | "Aggregation" | "Text" | "Dynamic Array";
  params: ReadonlyArray<{ key: string; label: string; placeholder: string }>;
  example: Record<string, string>;
  build: (p: Record<string, string>) => string;
}

const FORMULAS: readonly FormulaDef[] = [
  {
    id: "xlookup",
    label: "XLOOKUP",
    desc: "Modern lookup function",
    category: "Lookup",
    params: [
      { key: "lookup_value", label: "Lookup Value", placeholder: "A2" },
      { key: "lookup_array", label: "Lookup Array", placeholder: "Sheet1!A:A" },
      { key: "return_array", label: "Return Array", placeholder: "Sheet1!B:B" },
    ],
    example: { lookup_value: "A2", lookup_array: "Sheet1!A:A", return_array: "Sheet1!B:B" },
    build: (p) => `=XLOOKUP(${p.lookup_value || '""'}, ${p.lookup_array || '""'}, ${p.return_array || '""'})`,
  },
  {
    id: "vlookup",
    label: "VLOOKUP",
    desc: "Vertical lookup",
    category: "Lookup",
    params: [
      { key: "lookup_value", label: "Lookup Value", placeholder: "A2" },
      { key: "table_array", label: "Table Array", placeholder: "A1:D100" },
      { key: "col_index", label: "Column Index", placeholder: "2" },
    ],
    example: { lookup_value: "A2", table_array: "Master!$A$1:$D$500", col_index: "3" },
    build: (p) => `=VLOOKUP(${p.lookup_value || '""'}, ${p.table_array || '""'}, ${p.col_index || '1'}, FALSE)`,
  },
  {
    id: "sumifs",
    label: "SUMIFS",
    desc: "Sum with multiple criteria",
    category: "Aggregation",
    params: [
      { key: "sum_range", label: "Sum Range", placeholder: "C:C" },
      { key: "criteria_range", label: "Criteria Range", placeholder: "A:A" },
      { key: "criteria", label: "Criteria", placeholder: '"Completed"' },
    ],
    example: { sum_range: "C:C", criteria_range: "A:A", criteria: '"Completed"' },
    build: (p) => `=SUMIFS(${p.sum_range || '""'}, ${p.criteria_range || '""'}, ${p.criteria || '""'})`,
  },
  {
    id: "countifs",
    label: "COUNTIFS",
    desc: "Count with multiple criteria",
    category: "Aggregation",
    params: [
      { key: "criteria_range", label: "Criteria Range", placeholder: "A:A" },
      { key: "criteria", label: "Criteria", placeholder: '"Open"' },
    ],
    example: { criteria_range: "B:B", criteria: '"Cancellation Requested"' },
    build: (p) => `=COUNTIFS(${p.criteria_range || '""'}, ${p.criteria || '""'})`,
  },
  {
    id: "index-match",
    label: "INDEX MATCH",
    desc: "Flexible two-way lookup",
    category: "Lookup",
    params: [
      { key: "array", label: "Return Array", placeholder: "B:B" },
      { key: "lookup_value", label: "Lookup Value", placeholder: "A2" },
      { key: "lookup_array", label: "Lookup Array", placeholder: "A:A" },
    ],
    example: { array: "Sheet2!C:C", lookup_value: "A2", lookup_array: "Sheet2!A:A" },
    build: (p) => `=INDEX(${p.array || '""'}, MATCH(${p.lookup_value || '""'}, ${p.lookup_array || '""'}, 0))`,
  },
  {
    id: "textjoin",
    label: "TEXTJOIN",
    desc: "Combine text from ranges",
    category: "Text",
    params: [
      { key: "delimiter", label: "Delimiter", placeholder: '", "' },
      { key: "ignore_empty", label: "Ignore Empty", placeholder: "TRUE" },
      { key: "text1", label: "Text Array", placeholder: "A1:A10" },
    ],
    example: { delimiter: '", "', ignore_empty: "TRUE", text1: "A2:A50" },
    build: (p) => `=TEXTJOIN(${p.delimiter || '""'}, ${p.ignore_empty || 'TRUE'}, ${p.text1 || '""'})`,
  },
  {
    id: "unique",
    label: "UNIQUE",
    desc: "Extract unique values",
    category: "Dynamic Array",
    params: [
      { key: "array", label: "Array", placeholder: "A1:A100" },
    ],
    example: { array: "A2:A500" },
    build: (p) => `=UNIQUE(${p.array || '""'})`,
  },
  {
    id: "filter",
    label: "FILTER",
    desc: "Filter range by condition",
    category: "Dynamic Array",
    params: [
      { key: "array", label: "Array", placeholder: "A1:C100" },
      { key: "include", label: "Include Condition", placeholder: 'B:B="Active"' },
    ],
    example: { array: "A2:D500", include: 'B2:B500="NON NAMO"' },
    build: (p) => `=FILTER(${p.array || '""'}, ${p.include || '""'})`,
  },
];

export default function FormulaGeneratorPage() {
  const [selected, setSelected] = React.useState<string>("xlookup");
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [output, setOutput] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const formula = FORMULAS.find((f) => f.id === selected) ?? FORMULAS[0]!;

  // Live preview automatically reflects partial inputs while allowing explicit Generate click
  const livePreview = React.useMemo(() => {
    const hasAnyValue = Object.values(values).some((v) => v.trim().length > 0);
    return hasAnyValue ? formula.build(values) : "";
  }, [formula, values]);

  const effectiveOutput = output || livePreview;

  const handleBuild = () => {
    const result = formula.build(values);
    setOutput(result);
    setCopied(false);
    toast.success(`${formula.label} formula generated!`);
  };

  const handleLoadExample = () => {
    setValues(formula.example);
    setOutput(formula.build(formula.example));
    setCopied(false);
    toast.info(`Loaded ${formula.label} sample parameters`);
  };

  const handleCopy = () => {
    if (!effectiveOutput) return;
    navigator.clipboard.writeText(effectiveOutput);
    setCopied(true);
    toast.success("Formula copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="workspace-page mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      <GlassHero
        icon={Calculator}
        badge="Spreadsheet Automation Engine"
        title="Formula"
        highlight="Studio"
        description="Build error-free Excel & Google Sheets formulas visually with real-time parameter binding and 1-click sample presets."
        watermark="FORMULAS"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadExample}
            className="h-9 gap-2 rounded-xl border-blue-500/30 bg-blue-500/10 text-blue-700 dark:border-sky-400/30 dark:bg-sky-400/15 dark:text-sky-200 hover:bg-blue-500/20 font-bold"
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span>Load {formula.label} Example</span>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Frosted Function Rail */}
        <div className="flex flex-col gap-6 lg:col-span-5 xl:col-span-4">
          <GlassSpotlightCard delay={0.05} className="overflow-hidden">
            <CardHeader className="border-b border-border/50 dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.02] px-5 py-4 backdrop-blur-md">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-3 text-base font-black text-foreground">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-sky-400/15 dark:text-sky-300 border border-blue-500/20 shadow-xs">
                    <Calculator className="h-4.5 w-4.5" />
                  </div>
                  Functions
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-bold border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-sky-300 whitespace-nowrap shrink-0">
                  {FORMULAS.length} Presets
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid max-h-[60vh] grid-cols-1 gap-1.5 overflow-y-auto pr-1 no-scrollbar">
                {FORMULAS.map((f, idx) => {
                  const isSelected = selected === f.id;
                  return (
                    <motion.button
                      key={f.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 + idx * 0.025, ease: EASE_120HZ }}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => {
                        setSelected(f.id);
                        setValues({});
                        setOutput("");
                      }}
                      className={cn(
                        "group relative flex w-full items-center justify-between gap-2 rounded-xl border p-3 text-left transition-colors duration-200 cursor-pointer overflow-hidden",
                        isSelected
                          ? "border-sky-400/50 text-white shadow-[0_6px_20px_rgba(2,132,199,0.28)]"
                          : "border-slate-200/70 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.03] hover:border-blue-500/35 hover:bg-blue-500/[0.05] text-foreground"
                      )}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="activeFormulaRailItem"
                          transition={GLASS_TAB_SPRING}
                          className="absolute inset-0 -z-0 bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700"
                        />
                      )}
                      <div className="relative z-10 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className={cn("text-sm font-black tracking-tight whitespace-nowrap", isSelected ? "text-white" : "text-foreground group-hover:text-blue-600 dark:group-hover:text-sky-300")}>
                            {f.label}
                          </p>
                          <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0", isSelected ? "bg-white/20 text-white" : "bg-blue-500/10 text-blue-700 dark:text-sky-300")}>
                            {f.category}
                          </span>
                        </div>
                        <p className={cn("text-xs font-medium mt-0.5 truncate", isSelected ? "text-white/85" : "text-muted-foreground")}>
                          {f.desc}
                        </p>
                      </div>
                      <ChevronRight
                        className={cn(
                          "relative z-10 h-4.5 w-4.5 shrink-0 transition-transform duration-200",
                          isSelected ? "text-white translate-x-0.5" : "text-muted-foreground/50 group-hover:translate-x-0.5 group-hover:text-blue-500"
                        )}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </GlassSpotlightCard>
        </div>

        {/* Right Column: Parameters & Live Output */}
        <div className="flex flex-col gap-6 lg:col-span-7 xl:col-span-8">
          <GlassSpotlightCard delay={0.1} className="min-h-[350px]">
            <CardHeader className="border-b border-border/50 dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.02] px-6 py-5 backdrop-blur-md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="px-2.5 py-1 text-xs font-black uppercase tracking-widest text-blue-700 dark:text-sky-300 border-blue-500/30 bg-blue-500/10">
                    {formula.label}
                  </Badge>
                  <CardTitle className="text-lg font-black text-foreground">Parameters</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-blue-700 dark:text-sky-300 hover:bg-blue-500/10 text-xs font-bold"
                    onClick={handleLoadExample}
                  >
                    <Wand2 className="h-3.5 w-3.5" /> Example
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground hover:text-foreground text-xs font-bold"
                    onClick={() => { setValues({}); setOutput(""); }}
                  >
                    <RefreshCcw className="h-3.5 w-3.5" /> Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between p-6 space-y-6">
              <div className="grid gap-5">
                <AnimatePresence mode="popLayout">
                  {formula.params.map((param, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ delay: i * 0.04, ease: EASE_120HZ }}
                      key={formula.id + "-" + param.key}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center sm:gap-4"
                    >
                      <label className="text-sm font-bold text-foreground sm:text-right">{param.label}</label>
                      <div className="sm:col-span-3">
                        <Input
                          className="h-11 rounded-xl border-slate-200/80 dark:border-white/[0.1] bg-white/70 dark:bg-[#06070a]/75 font-mono text-sm backdrop-blur-md shadow-inner focus-visible:ring-sky-500/30 transition-all hover:border-blue-500/40 text-foreground"
                          placeholder={param.placeholder}
                          value={values[param.key] ?? ""}
                          onChange={(e) => {
                            setValues((v) => ({ ...v, [param.key]: e.target.value }));
                            setOutput("");
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="pt-2 flex justify-end">
                <Button
                  size="lg"
                  className="min-w-[180px] gap-2 rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 hover:brightness-110 text-white shadow-lg shadow-blue-500/25 font-bold"
                  onClick={handleBuild}
                >
                  <Sparkles className="h-4 w-4" /> Generate Formula
                </Button>
              </div>
            </CardContent>
          </GlassSpotlightCard>

          <GlassSpotlightCard delay={0.16}>
            <CardHeader className="border-b border-border/50 dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.02] px-6 py-4 backdrop-blur-md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base font-black text-foreground flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                  <span>Live Formula Result</span>
                  {livePreview && !output && (
                    <Badge variant="outline" className="text-[10px] font-bold border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-300">
                      Auto-Preview
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-2 border-border/80 dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.05] text-foreground hover:border-blue-500/40 hover:bg-blue-500/10 transition-all font-bold",
                    copied && "border-sky-500/50 text-sky-600 dark:text-sky-300 bg-sky-500/15"
                  )}
                  onClick={handleCopy}
                  disabled={!effectiveOutput}
                >
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy Formula"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                <Textarea
                  readOnly
                  value={effectiveOutput}
                  placeholder="Your generated formula will appear here..."
                  className="min-h-[128px] font-mono text-base bg-white/60 dark:bg-[#06070a]/70 border border-slate-200/80 dark:border-white/[0.09] text-blue-700 dark:text-sky-300 placeholder:text-muted-foreground/60 resize-none focus-visible:ring-sky-500/30 custom-scrollbar shadow-inner rounded-2xl p-4"
                />
                {!effectiveOutput && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-sky-500/70" />
                      Fill parameters or click &ldquo;Load Example&rdquo; for instant preview
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </GlassSpotlightCard>
        </div>
      </div>
    </div>
  );
}
