"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModernCalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
  compact?: boolean;
  align?: "left" | "right";
  isAutoDetected?: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function ModernCalendarPicker({
  value,
  onChange,
  className,
  compact = false,
  align = "left",
  isAutoDetected = false,
}: ModernCalendarPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Parse current selected date
  const selectedDate = React.useMemo(() => {
    if (!value) return null;
    const [y, m, d] = value.split("-").map((v) => parseInt(v, 10));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }, [value]);

  // View state for browsing month/year
  const [viewDate, setViewDate] = React.useState(() => {
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Keep viewDate in sync when value changes externally
  React.useEffect(() => {
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);

  // Close when clicking outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handlePrevYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear - 1, viewMonth, 1));
  };

  const handleNextYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear + 1, viewMonth, 1));
  };

  const handleSelectDay = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${year}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const getTodayIso = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const getYesterdayIso = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const handleSetToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = getTodayIso();
    onChange(today);
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setIsOpen(false);
  };

  const handleSetYesterday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const yesterday = getYesterdayIso();
    onChange(yesterday);
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
    setIsOpen(false);
  };

  // Calendar Day Generation
  const calendarDays = React.useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      iso: string;
    }> = [];

    // Previous month tail days
    for (let i = 0; i < firstDayIndex; i++) {
      const d = daysInPrevMonth - firstDayIndex + i + 1;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      days.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        iso: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({
        day: i,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        iso: `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      });
    }

    // Next month head days (fill 42 slots for a fixed 6-row grid)
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      days.push({
        day: i,
        month: m,
        year: y,
        isCurrentMonth: false,
        iso: `${y}-${String(m + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      });
    }

    return days;
  }, [viewYear, viewMonth]);

  const todayIso = getTodayIso();
  const isSelectedToday = value === todayIso;

  // Pretty label for trigger
  const triggerLabel = React.useMemo(() => {
    if (!value) return "Select date";
    const [y, m, d] = value.split("-");
    if (!y || !m || !d) return value;
    const monthIndex = parseInt(m, 10) - 1;
    const monthShort = MONTH_NAMES[monthIndex]?.slice(0, 3) || m;
    return `${d}-${m}-${y} (${d} ${monthShort})`;
  }, [value]);

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      {/* ── Beautiful Modern Trigger Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "group inline-flex items-center gap-2 rounded-xl border transition-all duration-150 select-none",
          compact ? "h-8 px-2.5 text-xs" : "h-9 px-3.5 text-xs sm:text-sm",
          "bg-white/90 dark:bg-[#0c121e]/90 hover:bg-slate-50 dark:hover:bg-[#131c2e]",
          "border-slate-200/90 dark:border-white/[0.12] shadow-2xs hover:shadow-xs",
          isOpen && "ring-2 ring-blue-500/40 border-blue-500 dark:border-blue-400"
        )}
        aria-label="Open modern date picker calendar"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="h-5 w-5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CalendarIcon className="h-3.5 w-3.5" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Date:
          </span>
        </div>

        <span className="font-mono font-bold text-slate-900 dark:text-white tracking-tight">
          {triggerLabel}
        </span>

        {isSelectedToday && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Today
          </span>
        )}

        {isAutoDetected && !isSelectedToday && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <Sparkles className="h-2.5 w-2.5" /> Sheet
          </span>
        )}

        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ml-0.5",
            isOpen && "rotate-180 text-blue-500"
          )}
        />
      </button>

      {/* ── High-End SaaS Popover Dropdown ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={cn(
              "absolute z-50 mt-2 w-[310px] rounded-2xl p-3.5 shadow-2xl backdrop-blur-2xl border",
              "bg-white/95 dark:bg-[#070b14]/95 border-slate-200/90 dark:border-white/15",
              align === "right" ? "right-0" : "left-0"
            )}
            style={{
              boxShadow:
                "0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            }}
          >
            {/* Quick Preset Pills Header */}
            <div className="flex items-center justify-between gap-1 pb-3 mb-2 border-b border-slate-100 dark:border-white/[0.08]">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSetToday}
                  className={cn(
                    "text-[11px] font-black px-2.5 py-1 rounded-lg transition-all flex items-center gap-1",
                    isSelectedToday
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Today (08-11-2026)
                </button>

                <button
                  type="button"
                  onClick={handleSetYesterday}
                  className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Yesterday
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1.5 py-0.5 rounded transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Month & Year Navigator */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                  {MONTH_NAMES[viewMonth]}
                </span>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {viewYear}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                  title="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Weekday Row */}
            <div className="grid grid-cols-7 gap-1 mb-1 text-center">
              {WEEKDAYS.map((day, idx) => (
                <span
                  key={day}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wider py-1",
                    idx === 0 || idx === 6
                      ? "text-rose-500/80 dark:text-rose-400/80"
                      : "text-slate-400 dark:text-slate-500"
                  )}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Month Day Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((d, index) => {
                const isSelected = value === d.iso;
                const isToday = d.iso === todayIso;

                return (
                  <button
                    key={`${d.iso}-${index}`}
                    type="button"
                    onClick={() => handleSelectDay(d.year, d.month, d.day)}
                    className={cn(
                      "h-8 w-8 mx-auto rounded-xl text-xs font-semibold flex items-center justify-center transition-all duration-150 relative",
                      // Selected state (Salesforce Blue Hero)
                      isSelected &&
                        "bg-[#0176D3] text-white font-black shadow-md shadow-blue-500/35 ring-2 ring-blue-400/40 scale-105 z-10",
                      // Not selected, but is Today
                      !isSelected &&
                        isToday &&
                        "border border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-500/15",
                      // Current month days
                      !isSelected &&
                        !isToday &&
                        d.isCurrentMonth &&
                        "text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/[0.08] hover:text-blue-600 dark:hover:text-blue-400",
                      // Other month days (faded)
                      !isSelected &&
                        !isToday &&
                        !d.isCurrentMonth &&
                        "text-slate-300 dark:text-white/20 hover:bg-slate-100/50 dark:hover:bg-white/[0.04]"
                    )}
                  >
                    <span>{d.day}</span>
                    {/* Little dot under today */}
                    {isToday && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer Status Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                <Check className="h-3 w-3 text-emerald-500" />
                <span>Active: <strong>{value}</strong></span>
              </span>

              <button
                type="button"
                onClick={handleSetToday}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                <span>Reset Today</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
