"use client";

import * as React from "react";
import {
  DailyReportSnapshot,
  loadReportHistory,
  compareWithPreviousReport,
  ReportDiffResult,
} from "@/lib/daily-report-history";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  History,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  RotateCcw,
  Trash2,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ReportHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSnapshot?: (snapshot: DailyReportSnapshot) => void;
  currentReport?: {
    department: "UCPG" | "CPSD";
    reportDate: string;
    totalQueries: number;
    categories: { category: string; count: number }[];
  };
}

export function ReportHistoryDrawer({
  isOpen,
  onClose,
  onRestoreSnapshot,
  currentReport,
}: ReportHistoryDrawerProps) {
  const [history, setHistory] = React.useState<DailyReportSnapshot[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setHistory(loadReportHistory());
    }
  }, [isOpen]);

  const handleClearHistory = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("meghdoot_daily_report_history_v1");
      setHistory([]);
      toast.success("Cleared report history");
    }
  };

  const handleRestore = (snap: DailyReportSnapshot) => {
    if (onRestoreSnapshot) {
      onRestoreSnapshot(snap);
      toast.success(`Restored report for ${snap.formattedDate} (${snap.department})`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="w-full max-w-md h-full bg-white dark:bg-[#080b12] border-l border-border/80 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-5 border-b border-border/60 bg-slate-50/70 dark:bg-[#0c101a]/80">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                Daily Report History & Diffs
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {history.length} saved version{history.length === 1 ? "" : "s"} (30-day retention)
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ── Body List ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-4">
              <History className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-bold text-muted-foreground">No reports saved yet</p>
              <p className="text-[11px] text-muted-foreground/70 mt-1 max-w-xs">
                When you download or copy a daily report, it is automatically archived here for day-over-day tracking.
              </p>
            </div>
          ) : (
            history.map((snap, i) => {
              const diff: ReportDiffResult = compareWithPreviousReport(
                snap,
                history.slice(i + 1)
              );

              return (
                <div
                  key={snap.id}
                  className="p-3.5 rounded-2xl border border-border/80 bg-card/70 dark:bg-[#0d121f]/70 space-y-2.5 shadow-2xs hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-foreground font-mono">
                        {snap.formattedDate || snap.reportDate}
                      </span>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[9.5px] font-bold px-2 py-0 uppercase">
                        {snap.department}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-foreground">
                        {snap.totalQueries} queries
                      </span>
                      {diff.hasPrevious && (
                        <span
                          className={cn(
                            "text-[9.5px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5",
                            diff.totalDelta >= 0
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          {diff.totalDelta >= 0 ? (
                            <TrendingUp className="h-2.5 w-2.5" />
                          ) : (
                            <TrendingDown className="h-2.5 w-2.5" />
                          )}
                          <span>
                            {diff.totalDelta >= 0 ? `+${diff.totalDelta}` : diff.totalDelta}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Top categories breakdown */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {snap.categories.slice(0, 5).map((cat) => (
                      <span
                        key={cat.category}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted/60 dark:bg-white/5 border border-border/60 text-muted-foreground"
                      >
                        {cat.category}: <strong className="text-foreground">{cat.count}</strong>
                      </span>
                    ))}
                    {snap.categories.length > 5 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 text-muted-foreground">
                        +{snap.categories.length - 5} more
                      </span>
                    )}
                  </div>

                  {onRestoreSnapshot && (
                    <div className="flex justify-end pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestore(snap)}
                        className="h-6 px-2 text-[10px] font-bold rounded-lg gap-1 border-primary/30 text-primary hover:bg-primary/10"
                      >
                        <RotateCcw className="h-2.5 w-2.5" />
                        <span>Restore into Workspace</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        {history.length > 0 && (
          <div className="p-4 border-t border-border/60 bg-slate-50/70 dark:bg-[#0c101a]/80 flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="h-8 px-2.5 text-xs font-bold text-rose-600 hover:bg-rose-500/10 gap-1 rounded-xl"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear History</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={onClose}
              className="h-8 px-4 rounded-xl text-xs font-bold"
            >
              Close
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
