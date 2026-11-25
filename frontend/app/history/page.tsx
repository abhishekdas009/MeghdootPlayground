"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardContent, CardHeader } from "@/components/ui/card";
import { GlassHero, GlassSpotlightCard, GlassTabRail } from "@/components/ui/glass-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDashboardStore, type ActivityEntry } from "@/lib/dashboard-store";
import { EASE_120HZ } from "@/lib/motion";
import {
  Search,
  Star,
  Trash2,
  Clock,
  Terminal,
  FileSpreadsheet,
  Zap,
  LayoutTemplate,
  History as HistoryIcon,
  Copy,
  Download,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type HistoryCategory = "all" | "favourites" | "query" | "excel" | "format";

interface HistoryItem {
  id: string;
  type: "query" | "excel" | "template" | "format" | "formula";
  title: string;
  detail: string;
  time: string;
  favourite: boolean;
}

const FALLBACK_HISTORY: HistoryItem[] = [
  { id: "1", type: "query", title: "TS Template — 12 tickets", detail: "SELECT Id, Status FROM WorkOrder...", time: "2 min ago", favourite: true },
  { id: "2", type: "excel", title: "Excluded Insights Export", detail: "CCO_Excluded_Insights.xlsx • multi-sheet", time: "15 min ago", favourite: false },
  { id: "3", type: "template", title: "Favourited WorkOrder Status", detail: "Template added to favourites", time: "1 hr ago", favourite: true },
  { id: "4", type: "format", title: "SOQL IN Format", detail: "8 tickets formatted", time: "2 hr ago", favourite: false },
  { id: "5", type: "query", title: "Escalation Template — 5 tickets", detail: "SELECT Id, OwnerId FROM Case...", time: "3 hr ago", favourite: false },
  { id: "6", type: "formula", title: "XLOOKUP Formula", detail: "=XLOOKUP(A2, Sheet1!A:A, Sheet1!B:B)", time: "5 hr ago", favourite: true },
];

function mapActivityToHistory(entry: ActivityEntry): HistoryItem {
  const diffMin = Math.max(0, Math.floor((Date.now() - new Date(entry.timestamp).getTime()) / 60000));
  const time =
    diffMin < 1 ? "Just now" : diffMin < 60 ? `${diffMin}m ago` : diffMin < 1440 ? `${Math.floor(diffMin / 60)}h ago` : `${Math.floor(diffMin / 1440)}d ago`;

  const mappedType: HistoryItem["type"] =
    entry.type === "soql-generated"
      ? "query"
      : entry.type === "excel-operation"
      ? "excel"
      : entry.type.includes("template") || entry.type.includes("favourite")
      ? "template"
      : "format";

  return {
    id: entry.id,
    type: mappedType,
    title: entry.label,
    detail: entry.meta || entry.module || "Workspace operation",
    time,
    favourite: entry.type === "favourite-added",
  };
}

const typeIcons: Record<HistoryItem["type"], React.ReactNode> = {
  query: <Terminal className="h-4.5 w-4.5" />,
  excel: <FileSpreadsheet className="h-4.5 w-4.5" />,
  template: <LayoutTemplate className="h-4.5 w-4.5" />,
  format: <Ticket className="h-4.5 w-4.5" />,
  formula: <Zap className="h-4.5 w-4.5" />,
};

export default function HistoryPage() {
  const liveActivity = useDashboardStore((s) => s.activity);
  const [search, setSearch] = React.useState("");
  const [filterTab, setFilterTab] = React.useState<HistoryCategory>("all");
  const [favIds, setFavIds] = React.useState<Set<string>>(() => new Set(["1", "3", "6"]));
  const [deletedIds, setDeletedIds] = React.useState<Set<string>>(() => new Set());

  const mergedItems = React.useMemo<HistoryItem[]>(() => {
    const liveItems = liveActivity.map(mapActivityToHistory);
    const seen = new Set(liveItems.map((i) => i.id));
    const combined = [...liveItems, ...FALLBACK_HISTORY.filter((f) => !seen.has(f.id))];
    return combined
      .filter((item) => !deletedIds.has(item.id))
      .map((item) => ({ ...item, favourite: favIds.has(item.id) || item.favourite }));
  }, [liveActivity, favIds, deletedIds]);

  const filtered = React.useMemo(() => {
    return mergedItems.filter((item) => {
      if (filterTab === "favourites" && !item.favourite) return false;
      if (filterTab === "query" && item.type !== "query" && item.type !== "template") return false;
      if (filterTab === "excel" && item.type !== "excel" && item.type !== "formula") return false;
      if (filterTab === "format" && item.type !== "format") return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.detail.toLowerCase().includes(q);
      }
      return true;
    });
  }, [mergedItems, filterTab, search]);

  const toggleFav = (id: string) => {
    setFavIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const remove = (id: string) => {
    setDeletedIds((prev) => new Set(prev).add(id));
    toast.info("Removed entry from view");
  };

  const handleCopyDetail = (detail: string) => {
    navigator.clipboard.writeText(detail);
    toast.success("Copied detail snippet to clipboard");
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `meghdoot-history-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} history records`);
  };

  return (
    <div className="workspace-page mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <GlassHero
        icon={HistoryIcon}
        badge="Audit Ledger & Timeline"
        title="Operational"
        highlight="History"
        description="Searchable real-time ledger of generated SOQL queries, Excel operations, ticket formatting batches, and favourites."
        watermark="HISTORY"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            disabled={filtered.length === 0}
            className="h-9 gap-2 rounded-xl border-blue-500/30 bg-blue-500/10 text-blue-700 dark:border-sky-400/30 dark:bg-sky-400/15 dark:text-sky-200 hover:bg-blue-500/20 font-bold"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Log (.json)</span>
          </Button>
        }
      />

      <GlassSpotlightCard delay={0.08} className="overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-border/50 dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.02] backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search history records, queries, sheets..."
                className="pl-10 h-10 text-sm rounded-xl border-slate-200/80 dark:border-white/[0.1] bg-white/70 dark:bg-[#06070a]/75 backdrop-blur-md"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              <GlassTabRail
                layoutId="historyFilterTabRail"
                size="sm"
                value={filterTab}
                onChange={setFilterTab}
                items={[
                  { id: "all", label: "All", badge: mergedItems.length },
                  { id: "favourites", label: "Starred", icon: Star },
                  { id: "query", label: "SOQL" },
                  { id: "excel", label: "Sheets" },
                  { id: "format", label: "Tickets" },
                ]}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border/40 dark:divide-white/[0.06]">
            <AnimatePresence initial={false}>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.24, delay: Math.min(i * 0.03, 0.25), ease: EASE_120HZ }}
                  className="flex flex-col gap-4 p-5 sm:px-6 transition-colors hover:bg-blue-500/[0.04] dark:hover:bg-white/[0.03] sm:flex-row sm:items-center group relative overflow-hidden"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent dark:via-white/[0.04] -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-700 dark:bg-sky-500/15 dark:text-sky-300 border border-blue-500/20 dark:border-sky-400/25 shadow-sm transition-transform duration-200 group-hover:scale-105">
                    {typeIcons[item.type]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-base font-black text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors">
                        {item.title}
                      </p>
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-sky-300 px-2 py-0">
                        {item.type}
                      </Badge>
                      {item.favourite && (
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-mono font-medium text-muted-foreground truncate max-w-2xl">
                      {item.detail}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0 opacity-85 group-hover:opacity-100 transition-opacity">
                    <span className="glass-surface flex items-center gap-1.5 text-xs font-bold text-muted-foreground px-3 py-1.5 rounded-lg">
                      <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400" /> {item.time}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyDetail(item.detail)}
                      aria-label="Copy snippet"
                      className="h-9 w-9 rounded-xl hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-sky-300 transition-colors"
                      title="Copy detail snippet"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFav(item.id)}
                      aria-label={item.favourite ? "Remove favourite" : "Add favourite"}
                      className="h-9 w-9 rounded-xl hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                    >
                      <Star className={cn("h-4 w-4 transition-colors", item.favourite ? "fill-amber-400 text-amber-500" : "text-muted-foreground")} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      onClick={() => remove(item.id)}
                      aria-label="Delete history item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="p-14 text-center flex flex-col items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-sky-300 mb-4 shadow-inner border border-blue-500/20">
                  <Search className="h-8 w-8" />
                </div>
                <p className="text-lg font-bold text-foreground">No history records found</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  We couldn&apos;t find any activity matching your current search or filter tab.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </GlassSpotlightCard>
    </div>
  );
}
