"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { GlassSpotlightCard } from "@/components/ui/glass-primitives";
import { EASE_120HZ, GLASS_TAB_SPRING } from "@/lib/motion";
import { TypewriterQuotes } from "@/components/ui/typewriter-quotes";
import { TodayHighlightCard } from "@/components/ui/today-highlight-card";

import { Button } from "@/components/ui/button";
import {
  useDashboardStore,
  type ActivityEntry,
  type ServerMetric,
  type ServerEvent,
} from "@/lib/dashboard-store";
import {
  Terminal,
  FileSearch,
  History,
  Star,
  RefreshCw,
  ChevronRight,
  Ticket,
  Layers3,
  Clock,
  XCircle,
  ArrowRightLeft,
  Users,
  FilePlus,
  Activity,
  TrendingUp,
  Zap,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 5_000;

// ─── Helpers ─────────────────────────────────────────────────────────

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function formatExactTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ─── Activity icon + color mapping ────────────────────────────────────

function activityMeta(type: ActivityEntry["type"]) {
  switch (type) {
    case "soql-generated":
      return { icon: Terminal, bg: "bg-blue-500/12 dark:bg-sky-500/15", text: "text-blue-700 dark:text-sky-300", ring: "ring-blue-500/20 dark:ring-sky-400/25" };
    case "excel-operation":
      return { icon: FileSearch, bg: "bg-sky-500/12 dark:bg-sky-500/15", text: "text-blue-700 dark:text-sky-300", ring: "ring-sky-500/20 dark:ring-sky-400/25" };
    case "favourite-added":
    case "favourite-removed":
      return { icon: Star, bg: "bg-blue-500/10 dark:bg-blue-500/15", text: "text-blue-600 dark:text-blue-300", ring: "ring-blue-500/20 dark:ring-blue-400/25" };
    case "ticket-formatted":
      return { icon: Ticket, bg: "bg-sky-500/12 dark:bg-sky-500/15", text: "text-sky-700 dark:text-sky-300", ring: "ring-sky-500/20 dark:ring-sky-400/25" };
    case "ticket-cancellation":
      return { icon: XCircle, bg: "bg-blue-500/12 dark:bg-blue-500/15", text: "text-blue-700 dark:text-blue-300", ring: "ring-blue-500/25 dark:ring-blue-400/25" };
    case "asset-transfer":
      return { icon: ArrowRightLeft, bg: "bg-sky-500/12 dark:bg-sky-500/15", text: "text-blue-700 dark:text-sky-300", ring: "ring-sky-500/20 dark:ring-sky-400/25" };
    case "case-assignment":
      return { icon: Users, bg: "bg-blue-500/12 dark:bg-sky-500/15", text: "text-blue-700 dark:text-sky-300", ring: "ring-blue-500/20 dark:ring-sky-400/25" };
    case "template-created":
    case "template-updated":
    case "template-deleted":
      return { icon: FilePlus, bg: "bg-sky-500/12 dark:bg-blue-500/15", text: "text-blue-700 dark:text-sky-300", ring: "ring-sky-500/20 dark:ring-sky-400/25" };
    default:
      return { icon: Layers3, bg: "bg-slate-500/10 dark:bg-white/[0.06]", text: "text-slate-600 dark:text-slate-300", ring: "ring-slate-500/20 dark:ring-white/10" };
  }
}

// ─── KPI Card ─────────────────────────────────────────────────────────

interface KPIConfig {
  label: string;
  value: number;
  totalValue: number;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconText: string;
  delay: number;
}

function KPICard({ label, value, totalValue, icon: Icon, iconBg, iconText, delay }: KPIConfig) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const [displayTotal, setDisplayTotal] = React.useState(0);

  React.useEffect(() => {
    if (displayValue === value) return;
    const start = displayValue;
    const end = value;
    const duration = 600;
    const startTime = performance.now();

    let frame: number;
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + (end - start) * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, displayValue]);

  React.useEffect(() => {
    if (displayTotal === totalValue) return;
    const start = displayTotal;
    const end = totalValue;
    const duration = 600;
    const startTime = performance.now();

    let frame: number;
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayTotal(Math.round(start + (end - start) * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [totalValue, displayTotal]);

  return (
    <GlassSpotlightCard
      delay={delay}
      interactive
      className="h-full min-h-[11.25rem] rounded-2xl p-[clamp(1rem,2vw,1.5rem)]"
    >
      <div className="relative flex h-full flex-col justify-between overflow-hidden">
        <div className="pointer-events-none absolute top-0 right-0 p-3 opacity-[0.07] dark:opacity-[0.09]">
          <Icon className="h-24 w-24 -mr-6 -mt-6 rotate-12" />
        </div>
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[clamp(0.8125rem,1.2vw,0.95rem)] font-bold tracking-wide text-muted-foreground break-words">
              {label}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-[clamp(2rem,5vw,2.75rem)] font-black tabular-nums text-foreground tracking-tight">
                {displayValue.toLocaleString()}
              </p>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">/ wk</span>
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              All-time: <span className="font-bold text-foreground tabular-nums">{displayTotal.toLocaleString()}</span>
            </p>
            {value > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.24, ease: EASE_120HZ }}
                className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold leading-tight text-blue-700 dark:border-sky-400/30 dark:bg-sky-400/15 dark:text-sky-200"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Active Today
              </motion.div>
            )}
          </div>
          <motion.div
            whileHover={{ scale: 1.08, rotate: 4 }}
            transition={GLASS_TAB_SPRING}
            className={cn(
              "flex h-[var(--icon-box-md)] w-[var(--icon-box-md)] shrink-0 items-center justify-center rounded-2xl shadow-lg ring-1 ring-white/25",
              iconBg, iconText
            )}
          >
            <Icon className="h-[var(--icon-size-md)] w-[var(--icon-size-md)]" />
          </motion.div>
        </div>
      </div>
    </GlassSpotlightCard>
  );
}

// ─── Quick Action Card ────────────────────────────────────────────────

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  gradient,
  iconBg,
  delay,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconBg: string;
  delay: number;
}) {
  return (
    <Link href={href} className="block h-full">
      <GlassSpotlightCard
        delay={delay}
        interactive
        className="h-full rounded-2xl p-5"
      >
        <div className={cn("absolute inset-x-0 top-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100", gradient)} />
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-13 w-13 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ring-1 ring-white/25 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
              iconBg
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-foreground transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-sky-300">
              {title}
            </p>
            <p className="mt-1 truncate text-sm font-medium text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-sky-400/15 dark:text-sky-300 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            <ChevronRight className="h-4.5 w-4.5" />
          </div>
        </div>
      </GlassSpotlightCard>
    </Link>
  );
}

// ─── Live Pulse Indicator ─────────────────────────────────────────────

function LiveIndicator({ isLive }: { isLive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-white/60 dark:bg-white/[0.06] backdrop-blur-md px-3 py-1.5 shadow-sm"
    >
      <span className={cn("relative flex h-2.5 w-2.5", !isLive && "opacity-40")}>
        {isLive && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2.5 w-2.5 rounded-full",
            isLive ? "bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.8)]" : "bg-muted-foreground"
          )}
        />
      </span>
      <span
        className={cn(
          "text-xs font-bold tracking-wider",
          isLive ? "text-blue-700 dark:text-sky-200" : "text-muted-foreground"
        )}
      >
        {isLive ? "SYSTEM LIVE" : "OFFLINE"}
      </span>
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────

function SectionHeader({
  title,
  icon: Icon,
  badge,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/25 shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <h2 className="text-xl font-extrabold tracking-tight text-foreground">{title}</h2>
      </div>
      {badge}
    </div>
  );
}

// ─── KPI Definitions ──────────────────────────────────────────────────

const kpiRow1: Omit<KPIConfig, "value" | "totalValue">[] = [
  {
    label: "Queries Generated",
    icon: Terminal,
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-700",
    iconText: "text-white",
    delay: 0.05,
  },
  {
    label: "Warranty Checks",
    icon: FileSearch,
    iconBg: "bg-gradient-to-br from-sky-400 to-blue-700",
    iconText: "text-white",
    delay: 0.1,
  },
  {
    label: "Ticket Cancellations",
    icon: XCircle,
    iconBg: "bg-gradient-to-br from-cyan-400 to-blue-700",
    iconText: "text-white",
    delay: 0.15,
  },
  {
    label: "Asset Transfers",
    icon: ArrowRightLeft,
    iconBg: "bg-gradient-to-br from-indigo-400 to-blue-800",
    iconText: "text-white",
    delay: 0.2,
  },
];

const kpiRow2: Omit<KPIConfig, "value" | "totalValue">[] = [
  {
    label: "Case Assignments",
    icon: Users,
    iconBg: "bg-gradient-to-br from-blue-400 to-blue-800",
    iconText: "text-white",
    delay: 0.25,
  },
  {
    label: "Query Library Templates",
    icon: FilePlus,
    iconBg: "bg-gradient-to-br from-indigo-400 to-blue-800",
    iconText: "text-white",
    delay: 0.3,
  },
  {
    label: "History Items",
    icon: History,
    iconBg: "bg-gradient-to-br from-sky-400 to-blue-700",
    iconText: "text-white",
    delay: 0.35,
  },
  {
    label: "Favourites",
    icon: Star,
    iconBg: "bg-gradient-to-br from-cyan-400 to-blue-700",
    iconText: "text-white",
    delay: 0.4,
  },
];

const quickActions = [
  {
    title: "SOQL Generator",
    description: "Generate SOQL from ticket numbers",
    href: "/soql-generator",
    icon: Terminal,
    gradient: "bg-gradient-to-r from-blue-500 to-blue-700",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-700",
    delay: 0.1,
  },
  {
    title: "Warranty Finder",
    description: "Check product warranty details",
    href: "/warranty-finder",
    icon: FileSearch,
    gradient: "bg-gradient-to-r from-cyan-400 to-blue-700",
    iconBg: "bg-gradient-to-br from-cyan-400 to-blue-700",
    delay: 0.15,
  },
  {
    title: "Ticket Formatter",
    description: "Format tickets for any language",
    href: "/ticket-formatter",
    icon: Ticket,
    gradient: "bg-gradient-to-r from-sky-400 to-blue-700",
    iconBg: "bg-gradient-to-br from-sky-400 to-blue-700",
    delay: 0.2,
  },
  {
    title: "Query Library",
    description: "Create and manage query templates",
    href: "/template-manager",
    icon: Layers3,
    gradient: "bg-gradient-to-r from-indigo-400 to-blue-800",
    iconBg: "bg-gradient-to-br from-indigo-400 to-blue-800",
    delay: 0.25,
  },
];

// ─── Dashboard Page ───────────────────────────────────────────────────

export default function DashboardPage() {
  const soqlGeneratedCount = useDashboardStore((s) => s.soqlGeneratedCount);
  const soqlGeneratedCountTotal = useDashboardStore((s) => s.soqlGeneratedCountTotal);
  const warrantyCheckCount = useDashboardStore((s) => s.warrantyCheckCount);
  const warrantyCheckCountTotal = useDashboardStore((s) => s.warrantyCheckCountTotal);
  const ticketCancellationCount = useDashboardStore((s) => s.ticketCancellationCount);
  const ticketCancellationCountTotal = useDashboardStore((s) => s.ticketCancellationCountTotal);
  const assetTransferCount = useDashboardStore((s) => s.assetTransferCount);
  const assetTransferCountTotal = useDashboardStore((s) => s.assetTransferCountTotal);
  const caseAssignmentCount = useDashboardStore((s) => s.caseAssignmentCount);
  const caseAssignmentCountTotal = useDashboardStore((s) => s.caseAssignmentCountTotal);
  const templatesCreatedCount = useDashboardStore((s) => s.templatesCreatedCount);
  const templatesCreatedCountTotal = useDashboardStore((s) => s.templatesCreatedCountTotal);
  const activity = useDashboardStore((s) => s.activity);
  const favouritesCount = useDashboardStore((s) => s.favourites.size);
  const hydrateFromServer = useDashboardStore((s) => s.hydrateFromServer);
  const resetStore = useDashboardStore((s) => s.resetStore);

  const [mounted, setMounted] = React.useState(false);
  const [isLive, setIsLive] = React.useState(false);
  const [lastRefreshed, setLastRefreshed] = React.useState(() => new Date());
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const row1Values = [soqlGeneratedCount, warrantyCheckCount, ticketCancellationCount, assetTransferCount];
  const row1TotalValues = [soqlGeneratedCountTotal, warrantyCheckCountTotal, ticketCancellationCountTotal, assetTransferCountTotal];
  const row2Values = [caseAssignmentCount, templatesCreatedCount, activity.length, favouritesCount];
  const row2TotalValues = [caseAssignmentCountTotal, templatesCreatedCountTotal, activity.length, favouritesCount]; // No total for activity/favorites

  const fetchDashboard = React.useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const json = (await res.json()) as {
        success: boolean;
        data: { metrics: ServerMetric[]; events: ServerEvent[] };
      };
      if (json.success && json.data) {
        hydrateFromServer(json.data.metrics, json.data.events);
        setIsLive(true);
        setLastRefreshed(new Date());
      }
    } catch {
      setIsLive(false);
    }
  }, [hydrateFromServer]);

  React.useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  
  const [greeting, setGreeting] = React.useState("Welcome");
  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboard();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all KPI counters for the new month?")) return;
    setIsResetting(true);
    try {
      const res = await fetch("/api/dashboard/reset", { method: "POST" });
      if (res.ok) {
        resetStore();
        toast.success("Dashboard KPIs reset for the new month!");
        await fetchDashboard();
      } else {
        toast.error("Failed to reset dashboard");
      }
    } catch {
      toast.error("Error resetting dashboard");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="workspace-page mx-auto w-full max-w-7xl space-y-10 p-4 sm:p-6 lg:p-8">
      {/* ─── Hero Header ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="page-hero relative flex flex-col gap-6 overflow-hidden rounded-3xl p-8 lg:p-12"
      >
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/20 dark:mix-blend-screen" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl dark:bg-blue-500/20 dark:mix-blend-screen" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-6 flex-1 min-w-0 max-w-2xl">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-700 backdrop-blur-md dark:bg-sky-500/15 dark:border-sky-400/30 dark:text-sky-200">
                <Sparkles className="h-4 w-4" />
                <span>Salesforce operations workspace</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white lg:text-5xl">
                {greeting}, <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-blue-700 dark:from-sky-300 dark:via-blue-400 dark:to-white bg-clip-text text-transparent">Team</span>
              </h1>
              <p className="max-w-xl text-lg font-medium text-slate-600 dark:text-slate-300">
                <TypewriterQuotes />
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <LiveIndicator isLive={isLive} />
              <span
                className="hidden rounded-full border border-blue-300/30 bg-white/55 px-3 py-1.5 text-sm font-medium text-slate-600 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 sm:inline"
                title={mounted ? formatExactTime(lastRefreshed.toISOString()) : undefined}
                suppressHydrationWarning
              >
                Updated: {mounted ? formatRelativeTime(lastRefreshed.toISOString()) : "just now"}
              </span>
              <Button
                variant="outline"
                className="h-10 gap-2 rounded-xl border-border/70 bg-white/60 dark:bg-white/[0.05] backdrop-blur-md text-slate-700 dark:text-slate-200 hover:border-blue-400/50 hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-sky-300 transition-all font-bold"
                onClick={handleReset}
                disabled={isResetting}
              >
                <RotateCcw className={cn("h-4 w-4", isResetting && "animate-spin")} />
                Reset
              </Button>
              <Button
                variant="primary"
                className="h-10 gap-2 rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:brightness-110 font-bold"
                onClick={handleRefresh}
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="hidden xl:flex relative w-[335px] shrink-0 h-full min-h-[220px] pointer-events-auto items-center justify-end pr-2 group cursor-pointer">
            <div className="relative w-[320px] h-[200px]">
              {/* Card 1 (Bottom, Portrait) */}
              <a href="https://drive.google.com/file/d/1h5JcEitXxFsXPWN5_kDkbhsKNhKyFBHB/view" target="_blank" rel="noopener noreferrer" 
                 className="absolute left-6 top-0 z-10 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom-left group-hover:-rotate-12 group-hover:-translate-x-12 group-hover:scale-105 hover:!z-30 shadow-[0_10px_30px_rgba(0,10,40,0.2)] dark:shadow-black/60 hover:shadow-[0_20px_50px_rgba(1,118,211,0.4)] rounded-xl">
                <div className="relative rounded-xl overflow-hidden w-[170px] h-[230px] group/item bg-white/5 dark:bg-black/20">
                  <Image src="/soql-sheet-portrait.jpg" alt="SOQL Queries Sheet" fill sizes="170px" className="object-cover" />
                  <div className="absolute inset-0 bg-blue-900/0 group-hover/item:bg-blue-900/10 dark:group-hover/item:bg-black/20 backdrop-blur-[0px] group-hover/item:backdrop-blur-[2px] transition-all duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover/item:opacity-100 text-white font-black tracking-widest text-[11px] bg-blue-600/90 px-4 py-2 rounded-full shadow-lg transform translate-y-4 group-hover/item:translate-y-0 transition-all duration-300">VIEW</span>
                  </div>
                </div>
              </a>
              
              {/* Card 2 (Top, Landscape) */}
              <a href="https://drive.google.com/file/d/1mvatxSx3Y29qkzJVmflv5PvPzb2eOuai/view" target="_blank" rel="noopener noreferrer" 
                 className="absolute right-0 top-10 z-20 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom-right group-hover:rotate-6 group-hover:translate-x-8 group-hover:scale-105 hover:!z-30 shadow-[0_15px_40px_rgba(0,10,40,0.25)] dark:shadow-black/80 hover:shadow-[0_20px_50px_rgba(1,118,211,0.4)] rounded-xl">
                <div className="relative rounded-xl overflow-hidden w-[260px] h-[155px] group/item bg-white/5 dark:bg-black/20">
                  <Image src="/soql-sheet-landscape.jpg" alt="Salesforce Inspector" fill sizes="260px" className="object-cover" />
                  <div className="absolute inset-0 bg-blue-900/0 group-hover/item:bg-blue-900/10 dark:group-hover/item:bg-black/20 backdrop-blur-[0px] group-hover/item:backdrop-blur-[2px] transition-all duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover/item:opacity-100 text-white font-black tracking-widest text-[11px] bg-blue-600/90 px-4 py-2 rounded-full shadow-lg transform translate-y-4 group-hover/item:translate-y-0 transition-all duration-300">VIEW</span>
                  </div>
                </div>
              </a>
            </div>
            
            <div className="absolute bottom-[-10px] right-24 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform translate-y-2 group-hover:translate-y-0">
               <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Cheat Sheets</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Primary KPI Row ────────────────────────────────────────── */}
      <div className="responsive-grid">
        {kpiRow1.map((kpi, i) => (
          <KPICard key={kpi.label} {...kpi} value={row1Values[i] ?? 0} totalValue={row1TotalValues[i] ?? 0} />
        ))}
      </div>

      {/* ─── Secondary KPI Row ──────────────────────────────────────── */}
      <div className="responsive-grid">
        {kpiRow2.map((kpi, i) => (
          <KPICard key={kpi.label} {...kpi} value={row2Values[i] ?? 0} totalValue={row2TotalValues[i] ?? 0} />
        ))}
      </div>

      {/* ─── Quick Actions + Recent Activity ────────────────────────── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr,1fr]">
        {/* Quick Actions */}
        <div className="space-y-6">
          <SectionHeader title="Quick Actions" icon={Zap} />
          <div className="responsive-grid-sm">
            {quickActions.map((action) => (
              <QuickActionCard key={action.href} {...action} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <SectionHeader
            title="Recent Activity"
            icon={Activity}
            badge={
              activity.length > 0 ? (
                <span className="inline-flex items-center rounded-full bg-blue-500/10 dark:bg-sky-500/15 border border-blue-500/20 dark:border-sky-400/25 px-3 py-1 text-xs font-bold text-blue-700 dark:text-sky-300">
                  {activity.length} events
                </span>
              ) : null
            }
          />

          <GlassSpotlightCard delay={0.22} className="rounded-2xl">
            <CardContent className="p-0">
              {activity.length === 0 ? (
                <div className="flex flex-col items-center gap-4 p-12 text-center bg-gradient-to-b from-transparent to-muted/20">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-600 dark:text-sky-300 shadow-inner border border-blue-500/20">
                    <Clock className="h-8 w-8 opacity-75" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">
                      No activity yet
                    </p>
                    <p className="mt-1 text-sm font-medium text-muted-foreground/80 max-w-[200px] mx-auto">
                      Generate a query or run an operation to see it here.
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-border/40 dark:divide-white/[0.06]">
                  <AnimatePresence initial={false}>
                    {activity.slice(0, 7).map((entry, index) => {
                      const meta = activityMeta(entry.type);
                      const Icon = meta.icon;
                      return (
                        <motion.li
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.035, duration: 0.25, ease: EASE_120HZ }}
                          className="group relative flex items-center gap-4 px-5 py-4 transition-colors hover:bg-blue-500/[0.04] dark:hover:bg-white/[0.03] cursor-default overflow-hidden"
                        >
                          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                          <div
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-110",
                              meta.bg, meta.text, meta.ring
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors">
                              {entry.label}
                            </p>
                            {entry.meta && (
                              <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                                {entry.meta}
                              </p>
                            )}
                          </div>
                          <span
                            className="shrink-0 rounded-md border border-border/45 dark:border-white/10 bg-muted/60 dark:bg-white/[0.04] px-2 py-1 text-xs font-bold tabular-nums text-muted-foreground"
                            title={formatExactTime(entry.timestamp)}
                          >
                            {formatRelativeTime(entry.timestamp)}
                          </span>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </CardContent>
          </GlassSpotlightCard>

          {activity.length > 7 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="pt-2"
            >
              <Link href="/history">
                <Button
                  variant="outline"
                  className="w-full h-11 gap-2 rounded-xl border-border/60 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-sky-300 hover:border-blue-500/30 transition-all font-bold"
                >
                  View complete history
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
