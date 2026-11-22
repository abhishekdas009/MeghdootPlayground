"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  GraduationCap,
  Copy,
  Mail,
  Calendar,
  Clock,
  User,
  Plus,
  Trash2,
  Users,
  Check,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  ListPlus,
  Sparkles,
  Smartphone,
  Layers,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Attendee {
  id: string;
  name: string;
  code: string;
  email: string;
}

export interface TopicSubsection {
  title: string;
  points: string[];
}

export interface TopicModule {
  title: string;
  points: string[];
  subsections?: TopicSubsection[];
}

export const SDE_BASE_TOPICS: TopicModule[] = [
  {
    title: "Home",
    points: [
      "Overview of the Home page and navigation.",
      "Key dashboard components and shortcuts.",
    ],
  },
  {
    title: "Account",
    points: [
      "Account creation and management.",
      "Understanding account-related fields and hierarchy.",
    ],
  },
  {
    title: "Asset",
    points: [
      "Asset creation and maintenance.",
      "Asset relationships and important asset-level details.",
    ],
  },
  {
    title: "Report",
    points: [
      "Report generation and usage.",
      "Filtering, exporting, and analyzing report data.",
    ],
  },
  {
    title: "Ticket",
    points: [
      "Ticket creation and lifecycle.",
      "Ticket status flow and key operational processes.",
    ],
  },
  {
    title: "FGR",
    points: [
      "Overview of FGR process.",
      "Usage and important business scenarios.",
    ],
  },
  {
    title: "Contact",
    points: [
      "Contact creation and management.",
      "Linking contacts with accounts and assets.",
    ],
  },
];

export const CP_BASE_TOPICS: TopicModule[] = [
  {
    title: "1. Home",
    points: [
      "CP Portal login and navigation",
      "Dashboard overview",
      "Notifications",
    ],
  },
  {
    title: "2. Service Tickets",
    points: [
      "Breakdown Tickets",
      "My Open Service Tickets",
    ],
  },
  {
    title: "3. Dispatcher Console",
    points: [
      "Technician allocation",
      "Service Appointment creation",
      "Appointment scheduling",
      "Dispatcher Console refresh",
    ],
  },
  {
    title: "4. Service Resource Management",
    points: [
      "Active technician verification",
      "Technician assignment process",
    ],
  },
  {
    title: "5. Asset Management",
    points: [
      "product registration process",
      "Asset details overview",
      "Asset transfer process",
    ],
  },
  {
    title: "6. Report",
    points: [
      "Product Registration Report download process",
      "Understanding the report structure and key fields",
    ],
  },
  {
    title: "7. Technician Management",
    points: [
      "Technician registration",
      "Technician profile management",
    ],
  },
];

export const FSL_APP_TOPICS: TopicModule[] = [
  {
    title: "FSL App",
    points: [
      "Ticket acceptance",
      "Work Started process",
      "Service Appointment updates",
      "Work completion",
      "Happy Code process",
    ],
    subsections: [
      {
        title: "1.1. Bundle Ticket Process",
        points: [
          "Creating Bundle (BLK) tickets",
          "Bundle process using the FSL App",
          "Bulk PMS ticket handling",
        ],
      },
      {
        title: "1.2 Salesforce Support Request",
        points: [
          "Case creation process",
          "Raising support requests",
          "Common issue reporting",
          "Case follow-up and resolution process",
        ],
      },
    ],
  },
];

export const SDE_BASE_TAKEAWAYS: string[] = [
  "Understood the end-to-end flow of Home, Account, Asset, Report, Ticket, FGR, and Contact modules.",
  "Clarified navigation and operational processes within the system.",
  "Addressed queries related to daily SDE activities and system usage.",
];

export const CP_BASE_TAKEAWAYS: string[] = [
  "Understood CP Portal workflows including Home, Service Tickets, Dispatcher Console, Service Resources, Asset Management, Reports, and Technician Management.",
  "Mastered technician allocation, appointment scheduling, and Dispatcher Console refresh mechanisms.",
  "Clarified daily Channel Partner operational procedures and resolved system queries.",
];

export const FSL_APP_TAKEAWAYS: string[] = [
  "Mastered mobile execution in FSL App including ticket acceptance, work start/completion, and Happy Code validation.",
  "Understood Bundle (BLK) ticket creation and bulk PMS ticket handling in FSL App.",
  "Clarified the Salesforce Support Request case creation and resolution process.",
];

export const CP_CROSS_TAKEAWAY = "Gained practical knowledge of Channel Partner (CP) portal operations, Dispatcher Console, and technician management.";

export const TIME_PRESETS = [
  { start: "10:00 AM", end: "11:30 AM", label: "10:00 AM - 11:30 AM" },
  { start: "11:00 AM", end: "12:30 PM", label: "11:00 AM - 12:30 PM" },
  { start: "02:00 PM", end: "03:30 PM", label: "02:00 PM - 03:30 PM" },
  { start: "03:00 PM", end: "04:30 PM", label: "03:00 PM - 04:30 PM" },
  { start: "04:30 PM", end: "06:00 PM", label: "04:30 PM - 06:00 PM" },
];

const CALENDAR_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const CALENDAR_MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const CALENDAR_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseDisplayDate(dateStr: string): Date {
  const clean = dateStr.trim();
  const parts = clean.split(/[-/ ]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0] ?? "1", 10);
    const mStr = (parts[1] ?? "").toLowerCase();
    const year = parseInt(parts[2] ?? "2026", 10);
    const mIdx = CALENDAR_MONTHS_SHORT.findIndex(
      (m) => m.toLowerCase() === mStr.slice(0, 3)
    );
    if (mIdx !== -1 && !isNaN(day) && !isNaN(year)) {
      return new Date(year, mIdx, day);
    }
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;
  return new Date();
}

function formatDateToDisplay(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = CALENDAR_MONTHS_SHORT[d.getMonth()] ?? "Nov";
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function TrainingCalendarPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedDate = React.useMemo(() => parseDisplayDate(value), [value]);

  const [viewYear, setViewYear] = React.useState(() => selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(() => selectedDate.getMonth());

  React.useEffect(() => {
    setViewYear(selectedDate.getFullYear());
    setViewMonth(selectedDate.getMonth());
  }, [selectedDate]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const picked = new Date(viewYear, viewMonth, day);
    onChange(formatDateToDisplay(picked));
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onChange(formatDateToDisplay(today));
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    const now = new Date();
    return (
      now.getDate() === day &&
      now.getMonth() === viewMonth &&
      now.getFullYear() === viewYear
    );
  };

  const isSelected = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getFullYear() === viewYear
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => setIsOpen(true)}
          placeholder="e.g. 16-Nov-2026"
          className="bg-surface-recessed/60 dark:bg-[#06070a] border-border/70 dark:border-white/[0.08] text-foreground text-xs font-semibold rounded-xl h-10 shadow-inner pr-10 cursor-pointer"
        />
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-2 h-7 w-7 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 flex items-center justify-center transition-colors"
          title="Open interactive calendar"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 z-50 w-[300px] rounded-2xl p-3.5 shadow-2xl backdrop-blur-2xl border bg-white/95 dark:bg-[#090d16]/95 border-slate-200/90 dark:border-white/15"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-sky-500" />
                {CALENDAR_MONTHS[viewMonth]} {viewYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleSelectToday}
                  className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-300 hover:bg-sky-500/20"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 pt-2 text-center text-[10px] font-extrabold text-muted-foreground uppercase">
              {CALENDAR_WEEKDAYS.map((wd) => (
                <span key={wd} className="py-1">
                  {wd}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 pt-1 text-center text-xs">
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <span key={`empty-${idx}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const active = isSelected(dayNum);
                const current = isToday(dayNum);

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    onClick={() => handleSelectDay(dayNum)}
                    className={cn(
                      "h-7 w-7 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all",
                      active
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-md shadow-sky-500/25"
                        : current
                        ? "border border-sky-500 text-sky-500 font-bold hover:bg-sky-500/10"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function parseTimeInput(timeStr: string): { hour: number; minute: number; period: "AM" | "PM" } {
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (match) {
    let hour = parseInt(match[1] ?? "11", 10);
    const minute = parseInt(match[2] ?? "00", 10);
    let period: "AM" | "PM" = (match[3] as "AM" | "PM") || "AM";
    if (hour > 12) {
      hour -= 12;
      period = "PM";
    }
    if (hour === 0) hour = 12;
    return { hour, minute, period };
  }
  return { hour: 11, minute: 0, period: "AM" };
}

function formatClockTimeOutput(hour: number, minute: number, period: "AM" | "PM"): string {
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${h}:${m} ${period}`;
}

export function TrainingClockPicker({
  value,
  onChange,
  placeholder = "11:00 AM",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-surface-recessed/60 dark:bg-[#06070a] border-border/70 dark:border-white/[0.08] text-foreground text-xs font-semibold rounded-xl h-9 shadow-inner"
    />
  );
}

export function TrainingTimePickerSection({
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  sessionTime,
}: {
  startTime: string;
  setStartTime: (val: string) => void;
  endTime: string;
  setEndTime: (val: string) => void;
  sessionTime: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTarget, setActiveTarget] = React.useState<"start" | "end">("start");
  const [clockMode, setClockMode] = React.useState<"hour" | "minute">("hour");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const currentValue = activeTarget === "start" ? startTime : endTime;
  const parsed = React.useMemo(() => parseTimeInput(currentValue), [currentValue]);

  const [currentHour, setCurrentHour] = React.useState(() => parsed.hour);
  const [currentMinute, setCurrentMinute] = React.useState(() => parsed.minute);
  const [currentPeriod, setCurrentPeriod] = React.useState<"AM" | "PM">(() => parsed.period);

  React.useEffect(() => {
    setCurrentHour(parsed.hour);
    setCurrentMinute(parsed.minute);
    setCurrentPeriod(parsed.period);
  }, [parsed]);

  const updateCurrentTime = (h: number, m: number, p: "AM" | "PM") => {
    setCurrentHour(h);
    setCurrentMinute(m);
    setCurrentPeriod(p);
    const formatted = formatClockTimeOutput(h, m, p);
    if (activeTarget === "start") {
      setStartTime(formatted);
    } else {
      setEndTime(formatted);
    }
  };

  const handleSelectHour = (h: number) => {
    updateCurrentTime(h, currentMinute, currentPeriod);
    setClockMode("minute");
  };

  const handleSelectMinute = (m: number) => {
    updateCurrentTime(currentHour, m, currentPeriod);
  };

  const handleSelectPeriod = (p: "AM" | "PM") => {
    updateCurrentTime(currentHour, currentMinute, p);
  };

  const openClockFor = (target: "start" | "end") => {
    setActiveTarget(target);
    setClockMode("hour");
    setIsOpen(true);
  };

  const cx = 110;
  const cy = 110;
  const radius = 76;

  let targetAngleDeg = 0;
  if (clockMode === "hour") {
    targetAngleDeg = (currentHour % 12) * 30;
  } else {
    targetAngleDeg = (currentMinute / 60) * 360;
  }
  const targetRad = (targetAngleDeg - 90) * (Math.PI / 180);
  const handTargetX = Math.round(cx + radius * Math.cos(targetRad));
  const handTargetY = Math.round(cy + radius * Math.sin(targetRad));

  const hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Top Header: Label & Live Range Display */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-sky-500" />
          Time (Start & End Time)
        </label>
        <span className="text-[11px] font-bold text-sky-500">
          {sessionTime}
        </span>
      </div>

      {/* Start Time & End Time Inputs */}
      <div className="grid grid-cols-2 gap-3">
        {/* Start Time */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Start Time
            </span>
            <button
              type="button"
              onClick={() => openClockFor("start")}
              className={cn(
                "text-[9px] font-bold transition-colors",
                isOpen && activeTarget === "start"
                  ? "text-sky-400 font-extrabold underline"
                  : "text-sky-500 hover:text-sky-400"
              )}
            >
              {isOpen && activeTarget === "start" ? "(picking)" : "(clock)"}
            </button>
          </div>
          <div className="relative flex items-center">
            <Input
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              onClick={() => openClockFor("start")}
              placeholder="10:00 AM"
              className={cn(
                "bg-surface-recessed/60 dark:bg-[#06070a] text-foreground text-xs font-semibold rounded-xl h-9 shadow-inner pr-8 cursor-pointer transition-all",
                isOpen && activeTarget === "start"
                  ? "border-sky-500 ring-2 ring-sky-500/30"
                  : "border-border/70 dark:border-white/[0.08]"
              )}
            />
            <button
              type="button"
              onClick={() =>
                isOpen && activeTarget === "start" ? setIsOpen(false) : openClockFor("start")
              }
              className={cn(
                "absolute right-1.5 h-6 w-6 rounded-lg flex items-center justify-center transition-colors",
                isOpen && activeTarget === "start"
                  ? "bg-sky-500 text-white shadow-sm"
                  : "bg-sky-500/10 hover:bg-sky-500/20 text-sky-500"
              )}
              title="Open interactive clock dial for Start Time"
            >
              <Clock className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* End Time */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              End Time
            </span>
            <button
              type="button"
              onClick={() => openClockFor("end")}
              className={cn(
                "text-[9px] font-bold transition-colors",
                isOpen && activeTarget === "end"
                  ? "text-sky-400 font-extrabold underline"
                  : "text-sky-500 hover:text-sky-400"
              )}
            >
              {isOpen && activeTarget === "end" ? "(picking)" : "(clock)"}
            </button>
          </div>
          <div className="relative flex items-center">
            <Input
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              onClick={() => openClockFor("end")}
              placeholder="11:30 AM"
              className={cn(
                "bg-surface-recessed/60 dark:bg-[#06070a] text-foreground text-xs font-semibold rounded-xl h-9 shadow-inner pr-8 cursor-pointer transition-all",
                isOpen && activeTarget === "end"
                  ? "border-sky-500 ring-2 ring-sky-500/30"
                  : "border-border/70 dark:border-white/[0.08]"
              )}
            />
            <button
              type="button"
              onClick={() =>
                isOpen && activeTarget === "end" ? setIsOpen(false) : openClockFor("end")
              }
              className={cn(
                "absolute right-1.5 h-6 w-6 rounded-lg flex items-center justify-center transition-colors",
                isOpen && activeTarget === "end"
                  ? "bg-sky-500 text-white shadow-sm"
                  : "bg-sky-500/10 hover:bg-sky-500/20 text-sky-500"
              )}
              title="Open interactive clock dial for End Time"
            >
              <Clock className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Integrated Interactive Clock Dial Drawer (100% Contained, Never Clipped) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl p-3.5 bg-white/95 dark:bg-[#070b14]/95 border border-sky-500/40 shadow-2xl backdrop-blur-2xl space-y-3">
              {/* Target Switcher Tabs */}
              <div className="flex items-center justify-between pb-2 border-b border-border/70">
                <div className="flex items-center gap-1.5 p-1 bg-surface-recessed/70 dark:bg-[#04060a] rounded-xl border border-border/60">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTarget("start");
                      setClockMode("hour");
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                      activeTarget === "start"
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/25"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Clock className="h-3 w-3" />
                    <span>Start: {startTime}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTarget("end");
                      setClockMode("hour");
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                      activeTarget === "end"
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/25"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Clock className="h-3 w-3" />
                    <span>End: {endTime}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="h-7 px-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Close clock dial"
                >
                  ✕ Close
                </button>
              </div>

              {/* Digital Clock Header with Switchable Hour/Minute and AM/PM */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface-recessed/80 dark:bg-[#0c121e] border border-border/70">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                    {activeTarget === "start" ? "Start" : "End"}:
                  </span>
                  <button
                    type="button"
                    onClick={() => setClockMode("hour")}
                    className={cn(
                      "px-2.5 py-0.5 rounded-lg font-mono text-base font-black transition-all",
                      clockMode === "hour"
                        ? "bg-sky-500 text-white shadow-sm shadow-sky-500/25"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Switch to Hour dial"
                  >
                    {String(currentHour).padStart(2, "0")}
                  </button>
                  <span className="font-mono text-base font-bold text-muted-foreground animate-pulse">:</span>
                  <button
                    type="button"
                    onClick={() => setClockMode("minute")}
                    className={cn(
                      "px-2.5 py-0.5 rounded-lg font-mono text-base font-black transition-all",
                      clockMode === "minute"
                        ? "bg-sky-500 text-white shadow-sm shadow-sky-500/25"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Switch to Minute dial"
                  >
                    {String(currentMinute).padStart(2, "0")}
                  </button>
                </div>

                {/* AM / PM Segmented Switcher */}
                <div className="flex items-center rounded-lg bg-muted/60 p-0.5 border border-border/60">
                  <button
                    type="button"
                    onClick={() => handleSelectPeriod("AM")}
                    className={cn(
                      "px-2.5 py-0.5 rounded text-[11px] font-black tracking-wider transition-all",
                      currentPeriod === "AM"
                        ? "bg-sky-500 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPeriod("PM")}
                    className={cn(
                      "px-2.5 py-0.5 rounded text-[11px] font-black tracking-wider transition-all",
                      currentPeriod === "PM"
                        ? "bg-sky-500 text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* Mode Subtitle / Prompt */}
              <div className="flex items-center justify-between px-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                <span className="text-sky-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {clockMode === "hour"
                    ? `Pick Hour (${activeTarget === "start" ? "Start Time" : "End Time"})`
                    : `Pick Minute (${activeTarget === "start" ? "Start Time" : "End Time"})`}
                </span>
                <button
                  type="button"
                  onClick={() => setClockMode(clockMode === "hour" ? "minute" : "hour")}
                  className="text-slate-400 hover:text-sky-400 lowercase font-medium transition-colors"
                >
                  switch to {clockMode === "hour" ? "minutes" : "hours"}
                </button>
              </div>

              {/* Circular Analog Clock Dial */}
              <div className="w-[220px] h-[220px] mx-auto rounded-full relative bg-slate-100/90 dark:bg-[#0c121e]/90 border border-border/80 shadow-inner flex items-center justify-center select-none overflow-hidden">
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 220 220">
                  <line
                    x1={cx}
                    y1={cy}
                    x2={handTargetX}
                    y2={handTargetY}
                    stroke="rgb(14, 165, 233)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx={cx} cy={cy} r="4" fill="rgb(14, 165, 233)" />
                  <circle
                    cx={handTargetX}
                    cy={handTargetY}
                    r="15"
                    fill="rgb(14, 165, 233)"
                    className="transition-all duration-150"
                  />
                </svg>

                {clockMode === "hour" ? (
                  hoursList.map((h) => {
                    const angle = (h % 12) * 30;
                    const rad = (angle - 90) * (Math.PI / 180);
                    const x = Math.round(cx + radius * Math.cos(rad));
                    const y = Math.round(cy + radius * Math.sin(rad));
                    const isSelected = currentHour === h;

                    return (
                      <button
                        key={`clock-h-${h}`}
                        type="button"
                        onClick={() => handleSelectHour(h)}
                        style={{
                          position: "absolute",
                          left: `${x}px`,
                          top: `${y}px`,
                          transform: "translate(-50%, -50%)",
                        }}
                        className={cn(
                          "w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all z-10",
                          isSelected
                            ? "text-white font-black"
                            : "text-foreground hover:bg-sky-500/15 hover:text-sky-500"
                        )}
                      >
                        {h}
                      </button>
                    );
                  })
                ) : (
                  minutesList.map((m) => {
                    const angle = (m / 60) * 360;
                    const rad = (angle - 90) * (Math.PI / 180);
                    const x = Math.round(cx + radius * Math.cos(rad));
                    const y = Math.round(cy + radius * Math.sin(rad));
                    const isSelected = currentMinute === m;

                    return (
                      <button
                        key={`clock-m-${m}`}
                        type="button"
                        onClick={() => handleSelectMinute(m)}
                        style={{
                          position: "absolute",
                          left: `${x}px`,
                          top: `${y}px`,
                          transform: "translate(-50%, -50%)",
                        }}
                        className={cn(
                          "w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center transition-all z-10",
                          isSelected
                            ? "text-white font-black"
                            : "text-foreground hover:bg-sky-500/15 hover:text-sky-500"
                        )}
                      >
                        {String(m).padStart(2, "0")}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Quick Minute Shortcuts */}
              <div className="flex items-center justify-between gap-1 pt-1 border-t border-border/60">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Quick Minutes:
                </span>
                <div className="flex items-center gap-1">
                  {[0, 15, 30, 45].map((m) => (
                    <button
                      key={`qm-${m}`}
                      type="button"
                      onClick={() => handleSelectMinute(m)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold transition-all border",
                        currentMinute === m
                          ? "bg-sky-500/20 text-sky-400 border-sky-500/40"
                          : "bg-surface-recessed/40 border-border/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      :{String(m).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {activeTarget === "start" ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setActiveTarget("end");
                        setClockMode("hour");
                      }}
                      className="flex-1 h-8 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-xl gap-1"
                    >
                      <span>Next: Set End Time</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      className="h-8 px-3 text-xs font-bold rounded-xl"
                    >
                      Done
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActiveTarget("start");
                        setClockMode("hour");
                      }}
                      className="h-8 px-3 text-xs font-bold rounded-xl gap-1"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Start Time</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 h-8 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-xl gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Done ({startTime} - {endTime})</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TrainingMOMMaker() {
  // Mode: SDE or CP
  const [trainingMode, setTrainingMode] = React.useState<"SDE" | "CP">("SDE");

  // Optional cross-training modules
  const [includeCP, setIncludeCP] = React.useState(false);
  const [includeFSL, setIncludeFSL] = React.useState(false);

  // Recipient / Manager
  const [recipientName, setRecipientName] = React.useState("@Soumyakanta Routray Sir");
  const [recipientEmail, setRecipientEmail] = React.useState("soumyakanta.routray@bluestarindia.com");

  // Date formatted as current date (e.g. 16-Nov-2026)
  const [sessionDate, setSessionDate] = React.useState(() => {
    const d = new Date();
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
  });

  // Separate Start Time and End Time
  const [startTime, setStartTime] = React.useState("11:00 AM");
  const [endTime, setEndTime] = React.useState("12:30 PM");

  // Combined session time string
  const sessionTime = React.useMemo(() => {
    if (startTime && endTime) return `${startTime} - ${endTime}`;
    if (startTime) return startTime;
    if (endTime) return endTime;
    return "11:00 AM - 12:30 PM";
  }, [startTime, endTime]);

  // Attendees list
  const [attendees, setAttendees] = React.useState<Attendee[]>([
    { id: "1", name: "", code: "", email: "" },
  ]);

  // Bulk paste modal state
  const [showBulkPaste, setShowBulkPaste] = React.useState(false);
  const [bulkPasteText, setBulkPasteText] = React.useState("");

  const [copiedType, setCopiedType] = React.useState<"html" | "text" | null>(null);

  // Collapsible Curriculum summary state for clean UI
  const [isCurriculumOpen, setIsCurriculumOpen] = React.useState(false);

  // Computed Topics list based on active mode & optional add-ons
  const activeTopics = React.useMemo<TopicModule[]>(() => {
    const list: TopicModule[] = [];

    if (trainingMode === "SDE") {
      list.push(...SDE_BASE_TOPICS);
      if (includeCP) {
        list.push(...CP_BASE_TOPICS);
      }
      if (includeFSL) {
        list.push(...FSL_APP_TOPICS);
      }
    } else {
      // CP Mode
      list.push(...CP_BASE_TOPICS);
      if (includeFSL) {
        list.push(...FSL_APP_TOPICS);
      }
    }

    return list;
  }, [trainingMode, includeCP, includeFSL]);

  // Computed Key Takeaways based on active mode & optional add-ons
  const activeTakeaways = React.useMemo<string[]>(() => {
    const list: string[] = [];

    if (trainingMode === "SDE") {
      list.push(...SDE_BASE_TAKEAWAYS);
      if (includeCP) {
        list.push(CP_CROSS_TAKEAWAY);
      }
      if (includeFSL) {
        list.push(...FSL_APP_TAKEAWAYS);
      }
    } else {
      list.push(...CP_BASE_TAKEAWAYS);
      if (includeFSL) {
        list.push(...FSL_APP_TAKEAWAYS);
      }
    }

    return list;
  }, [trainingMode, includeCP, includeFSL]);

  // Add new attendee row
  const handleAddAttendee = () => {
    setAttendees((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", code: "", email: "" },
    ]);
  };

  // Remove attendee row
  const handleRemoveAttendee = (id: string) => {
    setAttendees((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      return filtered.length === 0 ? [{ id: Date.now().toString(), name: "", code: "", email: "" }] : filtered;
    });
  };

  // Update attendee field
  const handleUpdateAttendee = (id: string, field: "name" | "code" | "email", val: string) => {
    setAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: val } : a))
    );
  };

  // Process bulk paste (intelligent parser for Name, Employee Code / L Code, Email)
  const handleProcessBulkPaste = () => {
    if (!bulkPasteText.trim()) {
      setShowBulkPaste(false);
      return;
    }

    const lines = bulkPasteText
      .split(/[\r\n]+/)
      .map((l) => l.trim())
      .filter(Boolean);

    const parsed: Attendee[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(/\t|,|;| {2,}/).map((p) => p.trim()).filter(Boolean);
      let name = "";
      let code = "";
      let email = "";

      if (parts.length >= 3) {
        name = parts[0] ?? "";
        if ((parts[1] ?? "").includes("@")) {
          email = parts[1] ?? "";
          code = parts[2] ?? "";
        } else if ((parts[2] ?? "").includes("@")) {
          code = parts[1] ?? "";
          email = parts[2] ?? "";
        } else {
          code = parts[1] ?? "";
          email = parts[2] ?? "";
        }
      } else if (parts.length === 2) {
        const p0 = parts[0] ?? "";
        const p1 = parts[1] ?? "";
        if (p1.includes("@")) {
          name = p0;
          email = p1;
        } else if (p0.includes("@")) {
          name = (p0.split("@")[0] ?? "").replace(/[._]/g, " ");
          email = p0;
          code = p1;
        } else {
          name = p0;
          code = p1;
        }
      } else if (parts.length === 1) {
        const p0 = parts[0] ?? "";
        if (p0.includes("@")) {
          name = (p0.split("@")[0] ?? "").replace(/[._]/g, " ");
          email = p0;
        } else {
          name = p0;
        }
      }

      if (name || code || email) {
        parsed.push({
          id: (Date.now() + idx).toString(),
          name,
          code,
          email,
        });
      }
    });

    if (parsed.length > 0) {
      setAttendees((prev) => {
        const cleanPrev = prev.filter((a) => a.name.trim() || a.code.trim() || a.email.trim());
        return [...cleanPrev, ...parsed];
      });
      toast.success(`Imported ${parsed.length} attendee${parsed.length === 1 ? "" : "s"}!`);
    } else {
      toast.error("Could not parse attendees. Format: Name [Tab] Code [Tab] Email");
    }

    setBulkPasteText("");
    setShowBulkPaste(false);
  };

  // Clear attendees
  const handleClearAttendees = () => {
    setAttendees([{ id: Date.now().toString(), name: "", code: "", email: "" }]);
    toast.info("Cleared attendee table");
  };

  // Filter valid attendees for email
  const validAttendees = React.useMemo(() => {
    return attendees.filter((a) => a.name.trim() || a.code.trim() || a.email.trim());
  }, [attendees]);

  // Build Plain Text MOM
  const generatePlainTextMOM = () => {
    const lines: string[] = [];
    lines.push(`Dear ${recipientName},`);
    lines.push("");

    let modeDescription = `${trainingMode} Training session`;
    if (trainingMode === "SDE") {
      if (includeCP && includeFSL) modeDescription += " (with CP & FSL App modules)";
      else if (includeCP) modeDescription += " (with CP modules)";
      else if (includeFSL) modeDescription += " (with FSL App modules)";
    } else if (trainingMode === "CP" && includeFSL) {
      modeDescription += " (with FSL App modules)";
    }

    lines.push(
      `Please find below the Minutes of Meeting (MOM) for the ${modeDescription} conducted today.`
    );
    lines.push("");
    lines.push(`Date: ${sessionDate}`);
    lines.push(`Time: ${sessionTime}`);
    lines.push("");

    if (validAttendees.length > 0) {
      lines.push("Attendees:");
      lines.push("---------------------------------------------------------------------------------------------------------");
      const codeHeader = trainingMode === "SDE" ? "Employee Code" : "L Code/Dealer Code";
      lines.push(`Sl No. | ${"Name".padEnd(26, " ")} | ${codeHeader.padEnd(20, " ")} | Email Id`);
      lines.push("---------------------------------------------------------------------------------------------------------");
      validAttendees.forEach((att, idx) => {
        const num = String(idx + 1).padEnd(6, " ");
        const name = (att.name || "-").padEnd(26, " ");
        const code = (att.code || "-").padEnd(20, " ");
        const email = att.email || "-";
        lines.push(`${num} | ${name} | ${code} | ${email}`);
      });
      lines.push("---------------------------------------------------------------------------------------------------------");
      lines.push("");
    }

    lines.push("Topics Covered:");
    lines.push("");
    activeTopics.forEach((mod) => {
      lines.push(mod.title);
      mod.points.forEach((pt) => {
        lines.push(`- ${pt}`);
      });
      if (mod.subsections && mod.subsections.length > 0) {
        mod.subsections.forEach((sub) => {
          lines.push(`  ${sub.title}`);
          sub.points.forEach((pt) => {
            lines.push(`  - ${pt}`);
          });
        });
      }
      lines.push("");
    });

    lines.push("Key Takeaways:");
    activeTakeaways.forEach((tk) => {
      lines.push(`- ${tk}`);
    });

    return lines.join("\n");
  };

  // Copy Email as Rich HTML & Plain Text
  const handleCopyEmail = async () => {
    const el = document.getElementById("training-mom-email-preview");
    if (!el) return;

    const innerContent = el.innerHTML;
    const html = `<div style="font-family: 'Aptos', 'Aptos (Body)', Aptos, Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000000; mso-ascii-font-family: Aptos; mso-fareast-font-family: Aptos; mso-hansi-font-family: Aptos; mso-bidi-font-family: Aptos;">${innerContent}</div>`;
    const plainText = generatePlainTextMOM();

    try {
      if (window.ClipboardItem) {
        const data = [
          new window.ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([plainText], { type: "text/plain" }),
          }),
        ];
        await navigator.clipboard.write(data);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      setCopiedType("html");
      setTimeout(() => setCopiedType(null), 2000);
      toast.success("Training MOM email copied with table formatting! Paste directly into Gmail/Outlook.");
    } catch {
      await navigator.clipboard.writeText(plainText);
      setCopiedType("html");
      setTimeout(() => setCopiedType(null), 2000);
      toast.success("Training MOM copied as plain text!");
    }
  };

  // Copy Plain Text only
  const handleCopyPlainText = async () => {
    const plainText = generatePlainTextMOM();
    try {
      await navigator.clipboard.writeText(plainText);
      setCopiedType("text");
      setTimeout(() => setCopiedType(null), 2000);
      toast.success("Plain text copied to clipboard!");
    } catch {
      toast.error("Failed to copy plain text");
    }
  };

  // Open default mail client draft addressed to manager
  const handleOpenMailDraft = () => {
    const targetEmail = recipientEmail.trim() || "soumyakanta.routray@bluestarindia.com";
    const subject = encodeURIComponent(`Minutes of Meeting (MOM) - ${trainingMode} Training Session [${sessionDate}]`);
    const plainText = encodeURIComponent(generatePlainTextMOM());
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${plainText}`;
    toast.info(`Opening mail draft addressed to ${targetEmail}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto w-full px-4 sm:px-6">
      {/* ── Left Column: Configuration & Inputs ── */}
      <div className="lg:col-span-5 space-y-6">
        {/* Card 1: Session Details */}
        <Card className="app-card border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl backdrop-blur-2xl p-0 overflow-visible relative z-20">
          <CardHeader className="pb-4 px-6 pt-5 border-b border-border/70 bg-muted/20 rounded-t-2xl">
            <CardTitle className="flex items-center justify-between text-lg font-bold text-foreground">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-sky-500" />
                <span>Training MOM Configuration</span>
              </div>
              <Badge variant="outline" className="text-[11px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20">
                {trainingMode} Mode
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 p-6">
            {/* Mode Switcher */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2 p-1 bg-surface-recessed/70 dark:bg-[#06070a] rounded-xl border border-border/70 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setTrainingMode("SDE")}
                  className={cn(
                    "py-2 px-3 rounded-lg text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1.5",
                    trainingMode === "SDE"
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-foreground"
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>SDE Training</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTrainingMode("CP")}
                  className={cn(
                    "py-2 px-3 rounded-lg text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1.5",
                    trainingMode === "CP"
                      ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-foreground"
                  )}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>CP Training</span>
                </button>
              </div>

              {/* Quick Cross-Training Add-on Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">
                  Add Topics:
                </span>
                {trainingMode === "SDE" && (
                  <button
                    type="button"
                    onClick={() => setIncludeCP(!includeCP)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1.5",
                      includeCP
                        ? "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/40 shadow-xs"
                        : "bg-surface-recessed/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-surface-recessed"
                    )}
                  >
                    <Layers className="h-3 w-3" />
                    <span>+ CP Portal (7 Modules)</span>
                    {includeCP && <Check className="h-3 w-3 text-purple-500" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIncludeFSL(!includeFSL)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1.5",
                    includeFSL
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/40 shadow-xs"
                      : "bg-surface-recessed/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-surface-recessed"
                  )}
                >
                  <Smartphone className="h-3 w-3 text-emerald-500" />
                  <span>+ FSL App (Bundle & Case)</span>
                  {includeFSL && <Check className="h-3 w-3 text-emerald-500" />}
                </button>
              </div>
            </div>

            {/* Recipient / Manager Inputs */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-sky-500" />
                  Recipient / Manager
                </span>
                <span className="text-[10px] text-sky-500 font-semibold lowercase">
                  (sends to this address)
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Name / Salutation
                  </span>
                  <Input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="@Soumyakanta Routray Sir"
                    className="bg-surface-recessed/60 dark:bg-[#06070a] border-border/70 dark:border-white/[0.08] text-foreground text-xs font-semibold rounded-xl h-9 shadow-inner"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Manager Email
                  </span>
                  <Input
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="soumyakanta.routray@bluestarindia.com"
                    className="bg-surface-recessed/60 dark:bg-[#06070a] border-border/70 dark:border-white/[0.08] text-foreground text-xs font-semibold rounded-xl h-9 shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Date Field with Calendar Picker */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-sky-500" />
                  Date (Calendar Selection)
                </span>
                <span className="text-[10px] text-sky-500 font-semibold lowercase">
                  (click icon or input to pick)
                </span>
              </label>
              <TrainingCalendarPicker
                value={sessionDate}
                onChange={setSessionDate}
              />
            </div>

            {/* Start Time & End Time with Unified Interactive Clock Drawer */}
            <div className="space-y-2.5">
              <TrainingTimePickerSection
                startTime={startTime}
                setStartTime={setStartTime}
                endTime={endTime}
                setEndTime={setEndTime}
                sessionTime={sessionTime}
              />

              {/* Time Presets Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Quick Time Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {TIME_PRESETS.map((preset) => {
                    const isSelected = startTime === preset.start && endTime === preset.end;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setStartTime(preset.start);
                          setEndTime(preset.end);
                        }}
                        className={cn(
                          "px-2.5 py-1 text-[11px] rounded-lg border font-semibold transition-all",
                          isSelected
                            ? "bg-sky-500/20 text-sky-600 dark:text-sky-300 border-sky-500/40 font-bold"
                            : "bg-surface-recessed/40 dark:bg-white/[0.02] border-border/60 text-muted-foreground hover:text-foreground hover:bg-surface-recessed"
                        )}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Attendees Table Manager */}
        <Card className="app-card border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl backdrop-blur-2xl p-0 overflow-hidden">
          <CardHeader className="pb-3 px-6 pt-5 border-b border-border/70 bg-muted/20 flex flex-row items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Users className="h-4 w-4 text-emerald-500" />
              <span>Attendees Table</span>
              <span className="text-xs font-bold text-muted-foreground">
                ({validAttendees.length})
              </span>
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBulkPaste(!showBulkPaste)}
                className="h-7 px-2.5 text-[11px] font-bold rounded-lg border-border/80 dark:border-white/10 hover:bg-surface-elevated gap-1"
                title="Paste multiple attendees at once"
              >
                <ListPlus className="h-3 w-3 text-sky-500" />
                <span>Bulk Paste</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAttendee}
                className="h-7 px-2.5 text-[11px] font-bold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30 gap-1"
              >
                <Plus className="h-3 w-3" />
                <span>Add Row</span>
              </Button>
              {attendees.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAttendees}
                  className="h-7 px-2 text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg"
                  title="Clear attendees"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-3">
            {/* Bulk Paste Box */}
            {showBulkPaste && (
              <div className="p-3.5 rounded-xl bg-surface-recessed/80 dark:bg-[#06070a] border border-sky-500/30 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between text-[11px] font-bold text-sky-600 dark:text-sky-400">
                  <span>Paste Attendees from Excel (Name, {trainingMode === "SDE" ? "Employee Code" : "L Code/Dealer Code"}, Email)</span>
                  <span className="text-[10px] text-muted-foreground">Tab / Comma separated</span>
                </div>
                <Textarea
                  value={bulkPasteText}
                  onChange={(e) => setBulkPasteText(e.target.value)}
                  placeholder={`Rahul Sharma\t${trainingMode === "SDE" ? "5001234" : "L-12345"}\trahul.sharma@bluestarindia.com\nPriya Patel\t${trainingMode === "SDE" ? "5005678" : "D-98765"}\tpriya.patel@bluestarindia.com`}
                  className="min-h-[90px] font-mono text-[11px] bg-background border-border/70 rounded-lg resize-y p-2.5"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowBulkPaste(false);
                      setBulkPasteText("");
                    }}
                    className="h-7 text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleProcessBulkPaste}
                    className="h-7 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg px-3"
                  >
                    Import Attendees
                  </Button>
                </div>
              </div>
            )}

            {/* Table Rows Input */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              <div className="grid grid-cols-[24px_1.1fr_1fr_1.2fr_26px] gap-2 px-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground items-center">
                <span className="text-center">#</span>
                <span>Name</span>
                <span>{trainingMode === "SDE" ? "Employee Code" : "L Code/Dealer Code"}</span>
                <span>Email ID</span>
                <span className="text-center">Del</span>
              </div>

              {attendees.map((attendee, index) => (
                <div key={attendee.id} className="grid grid-cols-[24px_1.1fr_1fr_1.2fr_26px] gap-2 items-center">
                  <span className="text-center text-xs font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <Input
                      value={attendee.name}
                      onChange={(e) => handleUpdateAttendee(attendee.id, "name", e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="h-8 text-xs bg-surface-recessed/60 dark:bg-[#06070a] border-border/70 rounded-lg px-2 font-medium"
                    />
                  </div>
                  <div>
                    <Input
                      value={attendee.code}
                      onChange={(e) => handleUpdateAttendee(attendee.id, "code", e.target.value)}
                      placeholder={trainingMode === "SDE" ? "e.g. 5001234" : "e.g. L-12345"}
                      className="h-8 text-xs bg-surface-recessed/60 dark:bg-[#06070a] border-border/70 rounded-lg px-2 font-medium font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <Input
                      value={attendee.email}
                      onChange={(e) => handleUpdateAttendee(attendee.id, "email", e.target.value)}
                      placeholder="name@bluestarindia.com"
                      className="h-8 text-xs bg-surface-recessed/60 dark:bg-[#06070a] border-border/70 rounded-lg px-2 font-medium"
                    />
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(attendee.id)}
                      className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                      title="Remove attendee"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAttendee}
              className="w-full h-8 text-xs font-bold border-dashed border-border/80 hover:border-primary/40 text-muted-foreground hover:text-primary gap-1.5 mt-2 rounded-xl"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Another Attendee Row</span>
            </Button>
          </CardContent>
        </Card>

        {/* Card 3: Topics Overview & Takeaways (Collapsible) */}
        <Card className="app-card border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl backdrop-blur-2xl p-0 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsCurriculumOpen(!isCurriculumOpen)}
            className="w-full pb-3 px-5 pt-3.5 border-b border-border/70 bg-muted/20 flex flex-row items-center justify-between text-left hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-bold text-foreground">Curriculum & Takeaways</span>
              <Badge variant="outline" className="text-[10px] font-bold text-sky-500 border-sky-500/30">
                {activeTopics.length} Modules · {activeTakeaways.length} Key Points
              </Badge>
            </div>
            <div className="text-muted-foreground">
              {isCurriculumOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </button>

          {isCurriculumOpen && (
            <CardContent className="p-4 sm:p-5 space-y-4 text-xs animate-in fade-in duration-200">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Included in Email MOM:
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeTopics.map((t) => (
                    <Badge
                      key={t.title}
                      variant="secondary"
                      className="bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 text-[11px]"
                    >
                      ✓ {t.title}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-recessed/40 dark:bg-[#06070a]/50 border border-border/70 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Key Takeaways ({activeTakeaways.length})
                </span>
                <ul className="space-y-1.5 pl-3 list-disc text-muted-foreground leading-relaxed">
                  {activeTakeaways.map((tk, idx) => (
                    <li key={idx}>{tk}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* ── Right Column: Generated Output / Live Email Preview ── */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="app-card h-full border border-border/80 dark:border-white/[0.08] bg-card/50 dark:bg-[#0b0c10]/45 shadow-xl backdrop-blur-2xl flex flex-col p-0 overflow-hidden">
          {/* Header */}
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border/70 bg-muted/20 px-6 py-4 gap-3 flex-wrap">
            <div>
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>Generated Output</span>
                <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20">
                  MOM Email Preview
                </span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Formatted with tables, bold headers, and bullets for Gmail / Outlook
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPlainText}
                className="flex-1 sm:flex-none gap-1.5 border-border/80 dark:border-white/[0.08] bg-card/80 dark:bg-[#06070a]/80 text-foreground hover:bg-surface-elevated rounded-xl font-bold text-xs h-9 px-3"
                title="Copy pure plain text"
              >
                {copiedType === "text" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Copied Text</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>Plain Text</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenMailDraft}
                className="flex-1 sm:flex-none gap-1.5 border-border/80 dark:border-white/[0.08] bg-card/80 dark:bg-[#06070a]/80 text-foreground hover:bg-surface-elevated rounded-xl font-bold text-xs h-9 px-3.5 shadow-sm"
                title="Open mail draft in Outlook or default mail client"
              >
                <Mail className="h-3.5 w-3.5 text-sky-500" />
                <span>Open Mail Draft</span>
              </Button>

              <Button
                size="sm"
                onClick={handleCopyEmail}
                className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs h-9 px-4 rounded-xl shadow-md shadow-sky-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
                title="Copy HTML formatted email table to clipboard for Outlook / Gmail"
              >
                {copiedType === "html" ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300 animate-in zoom-in-75 duration-150" />
                    <span className="text-white font-black">Copied Table HTML!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Email Body</span>
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          {/* Email Body Preview Container */}
          <CardContent className="p-0 flex-1 rounded-b-xl overflow-hidden relative">
            <div className="p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[850px] space-y-4 select-text">
              {/* Email Envelope Meta Header */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-recessed/60 dark:bg-[#07090e] border border-border/80 dark:border-white/[0.08] shadow-sm space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider min-w-[50px]">
                      To:
                    </span>
                    <a
                      href={`mailto:${recipientEmail}`}
                      className="font-bold text-sky-500 hover:underline flex items-center gap-1"
                    >
                      <span>{recipientEmail}</span>
                    </a>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-border/70">
                    Aptos (Body) · 11pt
                  </Badge>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1.5 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs flex-1">
                    <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider min-w-[50px]">
                      Subject:
                    </span>
                    <span className="font-semibold text-foreground">
                      Minutes of Meeting (MOM) - {trainingMode} Training Session [{sessionDate}]
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`Minutes of Meeting (MOM) - ${trainingMode} Training Session [${sessionDate}]`);
                      toast.success("Subject line copied!");
                    }}
                    className="h-6 px-2 text-[10px] font-bold rounded-md hover:bg-surface-elevated text-muted-foreground hover:text-foreground gap-1"
                    title="Copy subject line"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy Subject</span>
                  </Button>
                </div>
              </div>

              {/* White Mail Container Preview */}
              <div
                id="training-mom-email-preview"
                className="bg-white dark:bg-[#0e1017] text-slate-800 dark:text-slate-100 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm transition-all"
                style={{
                  fontFamily: "'Aptos', 'Aptos (Body)', Aptos, Calibri, Arial, sans-serif",
                  fontSize: "14.5px",
                  lineHeight: "1.6",
                }}
              >
                {/* Salutation */}
                <p style={{ margin: "0 0 16px 0", fontSize: "15px" }}>
                  Dear{" "}
                  <a
                    href={`mailto:${recipientEmail}`}
                    style={{ color: "#0284c7", fontWeight: "600", textDecoration: "none" }}
                    title={`Send email to ${recipientEmail}`}
                  >
                    {recipientName}
                  </a>
                  ,
                </p>

                {/* Introduction */}
                <p style={{ margin: "0 0 18px 0", lineHeight: "1.6" }}>
                  Please find below the Minutes of Meeting (MOM) for the{" "}
                  <strong>
                    {trainingMode} Training session
                    {trainingMode === "SDE" && includeCP && includeFSL
                      ? " (including CP & FSL App modules)"
                      : trainingMode === "SDE" && includeCP
                      ? " (including CP modules)"
                      : (trainingMode === "SDE" || trainingMode === "CP") && includeFSL
                      ? " (including FSL App modules)"
                      : ""}
                  </strong>{" "}
                  conducted today.
                </p>

                {/* Date & Time */}
                <p style={{ margin: "0 0 4px 0" }}>
                  <strong>Date:</strong> {sessionDate}
                </p>
                <p style={{ margin: "0 0 18px 0" }}>
                  <strong>Time:</strong> {sessionTime}
                </p>

                {/* Attendees Table */}
                {validAttendees.length > 0 ? (
                  <div style={{ margin: "18px 0 24px 0" }}>
                    <table
                      style={{
                        width: "100%",
                        maxWidth: "700px",
                        borderCollapse: "collapse",
                        marginBottom: "16px",
                        fontFamily: "'Aptos', 'Aptos (Body)', Aptos, Calibri, Arial, sans-serif",
                        fontSize: "13.5px",
                        textAlign: "left",
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
                          <th
                            style={{
                              padding: "8px 10px",
                              border: "1px solid #cbd5e1",
                              fontWeight: "bold",
                              width: "55px",
                              textAlign: "center",
                              color: "#0f172a",
                            }}
                          >
                            Sl No.
                          </th>
                          <th
                            style={{
                              padding: "8px 12px",
                              border: "1px solid #cbd5e1",
                              fontWeight: "bold",
                              color: "#0f172a",
                            }}
                          >
                            Name
                          </th>
                          <th
                            style={{
                              padding: "8px 12px",
                              border: "1px solid #cbd5e1",
                              fontWeight: "bold",
                              color: "#0f172a",
                              width: "160px",
                            }}
                          >
                            {trainingMode === "SDE" ? "Employee Code" : "L Code / Dealer Code"}
                          </th>
                          <th
                            style={{
                              padding: "8px 12px",
                              border: "1px solid #cbd5e1",
                              fontWeight: "bold",
                              color: "#0f172a",
                            }}
                          >
                            Email Id
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {validAttendees.map((att, idx) => (
                          <tr
                            key={att.id}
                            style={{
                              backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                            }}
                          >
                            <td
                              style={{
                                padding: "8px 10px",
                                border: "1px solid #cbd5e1",
                                textAlign: "center",
                                color: "#334155",
                              }}
                            >
                              {idx + 1}
                            </td>
                            <td
                              style={{
                                padding: "8px 12px",
                                border: "1px solid #cbd5e1",
                                fontWeight: "500",
                                color: "#0f172a",
                              }}
                            >
                              {att.name || "-"}
                            </td>
                            <td
                              style={{
                                padding: "8px 12px",
                                border: "1px solid #cbd5e1",
                                color: "#334155",
                                fontFamily: "monospace",
                                fontSize: "13px",
                              }}
                            >
                              {att.code || "-"}
                            </td>
                            <td
                              style={{
                                padding: "8px 12px",
                                border: "1px solid #cbd5e1",
                                color: "#0284c7",
                              }}
                            >
                              {att.email ? (
                                <a
                                  href={`mailto:${att.email}`}
                                  style={{ color: "#0284c7", textDecoration: "none" }}
                                >
                                  {att.email}
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    style={{
                      margin: "16px 0 22px 0",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: "1px dashed #cbd5e1",
                      backgroundColor: "#f8fafc",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    <em>
                      No attendees added yet. Add Name, {trainingMode === "SDE" ? "Employee Code" : "L Code / Dealer Code"}, and Email in the table to include attendees.
                    </em>
                  </div>
                )}

                {/* Topics Covered */}
                <p
                  style={{
                    margin: "24px 0 14px 0",
                    fontWeight: "bold",
                    fontSize: "15px",
                    color: "#0f172a",
                  }}
                >
                  Topics Covered:
                </p>

                <div style={{ paddingLeft: "4px" }}>
                  {activeTopics.map((mod) => (
                    <div key={mod.title} style={{ marginBottom: "14px" }}>
                      <p
                        style={{
                          margin: "0 0 4px 0",
                          fontWeight: "bold",
                          fontSize: "14px",
                          color: "#1e293b",
                        }}
                      >
                        {mod.title}
                      </p>
                      <ul
                        style={{
                          margin: "0 0 10px 0",
                          paddingLeft: "22px",
                          lineHeight: "1.6",
                          color: "#334155",
                        }}
                      >
                        {mod.points.map((pt, idx) => (
                          <li key={idx} style={{ marginBottom: "3px" }}>
                            {pt}
                          </li>
                        ))}
                      </ul>

                      {mod.subsections && mod.subsections.length > 0 && (
                        <div style={{ paddingLeft: "16px", marginTop: "8px" }}>
                          {mod.subsections.map((sub) => (
                            <div key={sub.title} style={{ marginBottom: "10px" }}>
                              <p
                                style={{
                                  margin: "0 0 4px 0",
                                  fontWeight: "bold",
                                  fontSize: "13.5px",
                                  color: "#334155",
                                }}
                              >
                                {sub.title}
                              </p>
                              <ul
                                style={{
                                  margin: "0 0 8px 0",
                                  paddingLeft: "20px",
                                  lineHeight: "1.6",
                                  color: "#475569",
                                }}
                              >
                                {sub.points.map((spt, sidx) => (
                                  <li key={sidx} style={{ marginBottom: "3px" }}>
                                    {spt}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Key Takeaways */}
                <p
                  style={{
                    margin: "24px 0 12px 0",
                    fontWeight: "bold",
                    fontSize: "15px",
                    color: "#0f172a",
                  }}
                >
                  Key Takeaways:
                </p>
                <ul
                  style={{
                    margin: "0 0 16px 0",
                    paddingLeft: "26px",
                    lineHeight: "1.6",
                    color: "#334155",
                  }}
                >
                  {activeTakeaways.map((tk, idx) => (
                    <li key={idx} style={{ marginBottom: "5px" }}>
                      {tk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
