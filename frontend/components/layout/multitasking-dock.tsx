"use client";

import * as React from "react";
import { useUIStore, type DockTool, type DockWidth } from "@/store/ui-store";
import {
  Terminal,
  Ticket,
  ShieldCheck,
  BookOpen,
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  ExternalLink,
  Search,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const WARRANTY_PRESETS = [
  { model: "185V Vectra Elite", comp: "10 Years", pcb: "5 Years", std: "1 Year" },
  { model: "123V Vertis Emerald", comp: "10 Years", pcb: "5 Years", std: "1 Year" },
  { model: "243V Magna Inverter", comp: "10 Years", pcb: "5 Years", std: "1 Year" },
  { model: "WAC 183 Dxe Window", comp: "5 Years", pcb: "No PCB Wty", std: "1 Year" },
];

const FAULT_CODES = [
  { code: "E1", desc: "Indoor room temp sensor error", fix: "Check room thermistor resistance (10kΩ)" },
  { code: "E4", desc: "Indoor fan motor malfunction", fix: "Check fan capacitor & feedback wiring" },
  { code: "E6", desc: "Communication fault IDU-to-ODU", fix: "Verify terminal S/N voltage (18-24V DC pulse)" },
  { code: "F3", desc: "Compressor discharge high temp", fix: "Check refrigerant leak, cap tube blockage" },
];

export function MultiTaskingDock() {
  const { dockOpen, setDockOpen, dockTool, setDockTool, dockWidth, setDockWidth } = useUIStore();

  // ── Quick Tool 1: Mini SOQL Runner State ──
  const [soqlInput, setSoqlInput] = React.useState(
    "SELECT Id, Status, ParentWorkOrderId\nFROM WorkOrder\nWHERE Ticket_Number_Read_Only__c IN (\n  {{tickets}}\n)"
  );
  const [ticketParam, setTicketParam] = React.useState("2713009\n27127281\n27132178");
  const [soqlCopied, setSoqlCopied] = React.useState(false);

  const resolvedSoql = React.useMemo(() => {
    const tickets = ticketParam
      .split(/[\n,;]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => `'${t}'`)
      .join(", ");
    return soqlInput.replace(/\{\{tickets\}\}/g, tickets || "''");
  }, [soqlInput, ticketParam]);

  const handleCopySoql = () => {
    navigator.clipboard.writeText(resolvedSoql);
    setSoqlCopied(true);
    toast.success("Resolved SOQL query copied to clipboard!");
    setTimeout(() => setSoqlCopied(false), 2000);
  };

  // ── Quick Tool 2: Mini Ticket Cleanser State ──
  const [rawTickets, setRawTickets] = React.useState("2713009\n27127281\n2713009\n27099264, 27133367");
  const [cleanserCopied, setCleanserCopied] = React.useState<string | null>(null);

  const cleanTicketTokens = React.useMemo(() => {
    const tokens = rawTickets.match(/\d{7,8}/g) || [];
    return Array.from(new Set(tokens));
  }, [rawTickets]);

  const handleCopyCleanFormat = (format: "soql-in" | "comma" | "lines") => {
    let out = "";
    if (format === "soql-in") {
      out = cleanTicketTokens.map((t) => `'${t}'`).join(", ");
    } else if (format === "comma") {
      out = cleanTicketTokens.join(", ");
    } else {
      out = cleanTicketTokens.join("\n");
    }
    navigator.clipboard.writeText(out);
    setCleanserCopied(format);
    toast.success(`Copied ${cleanTicketTokens.length} tickets as ${format}!`);
    setTimeout(() => setCleanserCopied(null), 2000);
  };

  // ── Quick Tool 3: Mini Warranty Lookup State ──
  const [modelSearch, setModelSearch] = React.useState("");

  const filteredModels = React.useMemo(() => {
    if (!modelSearch.trim()) return WARRANTY_PRESETS;
    return WARRANTY_PRESETS.filter((p) => p.model.toLowerCase().includes(modelSearch.toLowerCase()));
  }, [modelSearch]);

  // ── Quick Tool 4: Mini Fault Code Manual Search State ──
  const [faultQuery, setFaultQuery] = React.useState("");

  const filteredFaults = React.useMemo(() => {
    if (!faultQuery.trim()) return FAULT_CODES;
    return FAULT_CODES.filter(
      (f) =>
        f.code.toLowerCase().includes(faultQuery.toLowerCase()) ||
        f.desc.toLowerCase().includes(faultQuery.toLowerCase())
    );
  }, [faultQuery]);

  if (!dockOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-y-0 right-0 z-50 flex pointer-events-auto shadow-2xl">
        <motion.div
          initial={{ x: "100%", opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
          className={cn(
            "h-full bg-white dark:bg-[#07090e] border-l border-slate-200 dark:border-white/10 flex flex-col backdrop-blur-2xl transition-all duration-200",
            dockWidth === "compact" && "w-[390px]",
            dockWidth === "wide" && "w-[560px]",
            dockWidth === "split" && "w-[50vw] min-w-[420px]"
          )}
        >
          {/* ── Dock Header ──────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Multi-Tasking Dock
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Cross-reference without switching pages · <kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">Alt+D</kbd>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Width Controls */}
              <button
                type="button"
                onClick={() =>
                  setDockWidth(
                    dockWidth === "compact" ? "wide" : dockWidth === "wide" ? "split" : "compact"
                  )
                }
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                title={`Current width: ${dockWidth}. Click to toggle width.`}
              >
                {dockWidth === "split" ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setDockOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                title="Close Dock (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Tool Selector Tabs ────────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 p-2 border-b border-slate-200/60 dark:border-white/[0.06] bg-slate-100/50 dark:bg-[#04060a]">
            {[
              { id: "soql-runner" as DockTool, label: "SOQL Runner", icon: Terminal },
              { id: "ticket-cleaner" as DockTool, label: "Cleanser", icon: Ticket },
              { id: "warranty-lookup" as DockTool, label: "Warranty", icon: ShieldCheck },
              { id: "manual-search" as DockTool, label: "Faults", icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = dockTool === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDockTool(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all",
                    isActive
                      ? "bg-white dark:bg-white/10 text-blue-600 dark:text-blue-300 shadow-xs border border-slate-200/80 dark:border-white/10"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Tool Body Content ─────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TOOL 1: SOQL Runner */}
            {dockTool === "soql-runner" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>SOQL Template</span>
                    <span className="text-[10px] text-muted-foreground">Uses &#123;&#123;tickets&#125;&#125;</span>
                  </label>
                  <Textarea
                    rows={4}
                    value={soqlInput}
                    onChange={(e) => setSoqlInput(e.target.value)}
                    className="font-mono text-xs bg-slate-50 dark:bg-[#06070a] border-slate-200 dark:border-white/10 leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Ticket Numbers / IDs (Paste column or commas):
                  </label>
                  <Textarea
                    rows={3}
                    value={ticketParam}
                    onChange={(e) => setTicketParam(e.target.value)}
                    placeholder="2713009&#10;27127281"
                    className="font-mono text-xs bg-slate-50 dark:bg-[#06070a] border-slate-200 dark:border-white/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Live Output SOQL:
                    </span>
                    <Button
                      size="sm"
                      onClick={handleCopySoql}
                      className="h-7 px-2.5 text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white gap-1"
                    >
                      {soqlCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{soqlCopied ? "Copied!" : "Copy SOQL"}</span>
                    </Button>
                  </div>
                  <pre className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48 border border-white/10 select-all leading-relaxed whitespace-pre-wrap">
                    {resolvedSoql}
                  </pre>
                </div>
              </div>
            )}

            {/* TOOL 2: Quick Ticket Cleanser */}
            {dockTool === "ticket-cleaner" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-700 dark:text-slate-300">Raw Ticket Input:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {cleanTicketTokens.length} Unique Clean Valid Tickets
                    </span>
                  </div>
                  <Textarea
                    rows={6}
                    value={rawTickets}
                    onChange={(e) => setRawTickets(e.target.value)}
                    placeholder="Paste any messy text with tickets..."
                    className="font-mono text-xs bg-slate-50 dark:bg-[#06070a] border-slate-200 dark:border-white/10"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    1-Click Export Presets:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyCleanFormat("soql-in")}
                      className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] hover:bg-blue-500/10 text-left transition-all"
                    >
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white">SOQL IN</p>
                      <p className="text-[9.5px] text-muted-foreground truncate">&apos;2713009&apos;, &apos;27127...&apos;</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyCleanFormat("comma")}
                      className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] hover:bg-emerald-500/10 text-left transition-all"
                    >
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white">Comma CSV</p>
                      <p className="text-[9.5px] text-muted-foreground truncate">2713009, 27127281</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyCleanFormat("lines")}
                      className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] hover:bg-purple-500/10 text-left transition-all"
                    >
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white">Excel Col</p>
                      <p className="text-[9.5px] text-muted-foreground truncate">1 ticket per line</p>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
                  <p className="font-bold text-blue-800 dark:text-blue-300">Cleaned List Preview:</p>
                  <p className="font-mono text-[11px] text-blue-900 dark:text-blue-200 truncate mt-1">
                    {cleanTicketTokens.join(", ") || "No tickets detected yet"}
                  </p>
                </div>
              </div>
            )}

            {/* TOOL 3: Quick Warranty Lookup */}
            {dockTool === "warranty-lookup" && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search model (e.g. 185V, Vertis)..."
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    className="pl-8 text-xs bg-slate-50 dark:bg-[#06070a] border-slate-200 dark:border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  {filteredModels.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {item.model}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          Comprehensive {item.std}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                        <div className="p-1.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300">
                          Compressor: <strong>{item.comp}</strong>
                        </div>
                        <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
                          PCB Controller: <strong>{item.pcb}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TOOL 4: Fault Codes & Wiring Jump */}
            {dockTool === "manual-search" && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search fault code (E4, E6, F3)..."
                    value={faultQuery}
                    onChange={(e) => setFaultQuery(e.target.value)}
                    className="pl-8 text-xs bg-slate-50 dark:bg-[#06070a] border-slate-200 dark:border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  {filteredFaults.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] space-y-1 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-black px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 font-mono">
                          {f.code}
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {f.desc}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground pl-0.5">
                        <strong className="text-slate-700 dark:text-slate-300">Remedy:</strong> {f.fix}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
