"use client";

import * as React from "react";
import { CheckCircle2, ShieldCheck, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface WarrantyTimelineGaugeProps {
  installationDate?: string;
  duration?: number | string;
  unitOfTime?: string;
  termName?: string;
  className?: string;
  onDateChange?: (dateStr: string) => void;
}

export function WarrantyTimelineGauge({
  installationDate,
  duration = 1,
  unitOfTime = "Years",
  className,
  onDateChange,
}: WarrantyTimelineGaugeProps) {
  const [showSimulate, setShowSimulate] = React.useState(false);
  const [simulatedDate, setSimulatedDate] = React.useState<string>(() => {
    if (installationDate) return installationDate;
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split("T")[0] || "";
  });

  const activeDateStr = installationDate || simulatedDate;

  const handleSimulate = (dateStr: string) => {
    setSimulatedDate(dateStr);
    if (onDateChange) {
      onDateChange(dateStr);
    }
  };

  // Calculate Dates
  const { startDate, endDate, daysRemaining, progressPercent, isActive } =
    React.useMemo(() => {
      let start = new Date(activeDateStr);
      if (isNaN(start.getTime())) {
        start = new Date();
      }

      const numDuration = Number(duration) || 1;
      const unit = (unitOfTime || "years").toLowerCase();

      const end = new Date(start);
      if (unit.includes("year")) {
        end.setFullYear(end.getFullYear() + numDuration);
      } else if (unit.includes("month")) {
        end.setMonth(end.getMonth() + numDuration);
      } else if (unit.includes("day")) {
        end.setDate(end.getDate() + numDuration);
      } else {
        end.setFullYear(end.getFullYear() + numDuration);
      }

      const today = new Date();
      const msPerDay = 1000 * 60 * 60 * 24;

      const total = Math.max(1, Math.round((end.getTime() - start.getTime()) / msPerDay));
      const elapsed = Math.round((today.getTime() - start.getTime()) / msPerDay);
      const remaining = Math.round((end.getTime() - today.getTime()) / msPerDay);

      const percent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
      const active = today.getTime() <= end.getTime();

      return {
        startDate: start,
        endDate: end,
        daysRemaining: remaining,
        progressPercent: percent,
        isActive: active,
      };
    }, [activeDateStr, duration, unitOfTime]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-2.5 sm:p-3 backdrop-blur-md transition-all shadow-xs",
        isActive
          ? "border-emerald-500/25 bg-emerald-500/[0.02] dark:bg-emerald-950/[0.10]"
          : "border-amber-500/25 bg-amber-500/[0.02] dark:bg-amber-950/[0.10]",
        className
      )}
    >
      {/* ── Status & Date Range Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full border shadow-2xs shrink-0 inline-flex items-center gap-1",
              isActive
                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                : "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40"
            )}
          >
            {isActive ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
            {isActive ? "ACTIVE" : "EXPIRED"}
          </span>
          <span className="text-xs font-bold text-foreground">
            {isActive
              ? `${daysRemaining} days left (${(daysRemaining / 365).toFixed(1)} yrs)`
              : `Expired ${Math.abs(daysRemaining)} days ago`}
          </span>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            • {progressPercent}% elapsed
          </span>
        </div>

        {/* Milestone Dates & Test Toggle */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground ml-auto">
          <span>{formatDate(startDate)}</span>
          <span className="text-slate-400">→</span>
          <span className="font-semibold text-foreground">{formatDate(endDate)}</span>

          <button
            type="button"
            onClick={() => setShowSimulate(!showSimulate)}
            className="text-[10px] font-semibold text-sky-500 hover:text-sky-400 transition-colors inline-flex items-center gap-0.5 ml-1"
          >
            <span>Test</span>
            {showSimulate ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* ── Slim Progress Bar ── */}
      <div className="relative h-1.5 w-full rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out",
            isActive
              ? "bg-gradient-to-r from-teal-500 via-emerald-500 to-sky-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              : "bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ── Optional Collapsible Simulation Chips ── */}
      {showSimulate && (
        <div className="mt-2.5 pt-2 border-t border-border/40 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground mr-1">Simulate Date:</span>
          {[
            { label: "Today", yearsAgo: 0 },
            { label: "1 Yr Ago", yearsAgo: 1 },
            { label: "3 Yrs Ago", yearsAgo: 3 },
            { label: "5 Yrs Ago", yearsAgo: 5 },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const d = new Date();
                d.setFullYear(d.getFullYear() - item.yearsAgo);
                handleSimulate(d.toISOString().split("T")[0] || "");
              }}
              className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-border/80 bg-background/80 hover:bg-card text-foreground transition-all cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
