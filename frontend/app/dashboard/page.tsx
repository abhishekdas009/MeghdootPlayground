"use client";

import * as React from "react";
<<<<<<< Updated upstream
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDashboardStore, getTimeAgo } from "@/lib/dashboard-store";
=======
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useDashboardStore,
  type ActivityEntry,
  type ServerMetric,
  type ServerEvent,
} from "@/lib/dashboard-store";
>>>>>>> Stashed changes
import {
  Terminal,
  FileSpreadsheet,
  History,
  Star,
<<<<<<< Updated upstream
  Zap,
  Bookmark,
=======
  RefreshCw,
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
type DashboardStats = {
  queriesGenerated: number;
  excelOperations: number;
  historyItems: number;
  favourites: number;
  activities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: number;
  }>;
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!started) return;

    if (value === 0) {
      setDisplay(0);
      return;
    }

    const duration = 800;
    const startValue = display;
    const change = value - startValue;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startValue + change * ease));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [started, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString()}
    </span>
  );
=======
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
>>>>>>> Stashed changes
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
      return { icon: Terminal, bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400", ring: "ring-blue-500/20" };
    case "excel-operation":
      return { icon: FileSpreadsheet, bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/20" };
    case "favourite-added":
    case "favourite-removed":
      return { icon: Star, bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/20" };
    case "ticket-formatted":
      return { icon: Ticket, bg: "bg-orange-500/10 dark:bg-orange-500/20", text: "text-orange-600 dark:text-orange-400", ring: "ring-orange-500/20" };
    case "ticket-cancellation":
      return { icon: XCircle, bg: "bg-rose-500/10 dark:bg-rose-500/20", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-500/20" };
    case "asset-transfer":
      return { icon: ArrowRightLeft, bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-400", ring: "ring-purple-500/20" };
    case "case-assignment":
      return { icon: Users, bg: "bg-teal-500/10 dark:bg-teal-500/20", text: "text-teal-600 dark:text-teal-400", ring: "ring-teal-500/20" };
    case "template-created":
    case "template-updated":
    case "template-deleted":
      return { icon: FilePlus, bg: "bg-indigo-500/10 dark:bg-indigo-500/20", text: "text-indigo-600 dark:text-indigo-400", ring: "ring-indigo-500/20" };
    default:
      return { icon: Layers3, bg: "bg-slate-500/10 dark:bg-slate-500/20", text: "text-slate-600 dark:text-slate-400", ring: "ring-slate-500/20" };
  }
}

// ─── KPI Card ─────────────────────────────────────────────────────────

interface KPIConfig {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconBg: string;
  iconText: string;
  delay: number;
}

function KPICard({ label, value, icon: Icon, gradient, iconBg, iconText, delay }: KPIConfig) {
  const [displayValue, setDisplayValue] = React.useState(0);

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

  return (
<<<<<<< Updated upstream
    <Card className="overflow-hidden border-border/70 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              <AnimatedNumber value={value} />
            </p>
          </div>
          <Link href={href}>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color} text-white shadow-sm`}>
              <Icon className="h-5 w-5" />
            </div>
          </Link>
=======
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative group h-full"
    >
      <div className={cn(
        "absolute -inset-0.5 rounded-[20px] blur opacity-40 group-hover:opacity-100 transition duration-500",
        gradient
      )} />
      <div className="relative h-full flex flex-col justify-between rounded-2xl bg-card border border-border/50 p-6 shadow-sm overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Icon className="w-24 h-24 -mr-6 -mt-6 transform rotate-12" />
>>>>>>> Stashed changes
        </div>
        <div className="relative flex items-start justify-between gap-4 z-10">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-muted-foreground tracking-wide">{label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-4xl font-black tabular-nums text-foreground tracking-tight drop-shadow-sm">
                {displayValue.toLocaleString()}
              </p>
            </div>
            {value > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Active Today
              </motion.div>
            )}
          </div>
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
              iconBg, iconText
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </motion.div>
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
<<<<<<< Updated upstream
    <Link href={href}>
      <Card className="overflow-hidden border-border/70 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color} text-white shadow-sm`}>
              <Icon className="h-5 w-5" />
=======
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <Link href={href} className="block h-full">
        <div className="group relative h-full overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-border hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 hover:bg-muted/30">
          <div className={cn("absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100", gradient)} />

          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                iconBg
              )}
            >
              <Icon className="h-6 w-6" />
>>>>>>> Stashed changes
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-foreground transition-colors duration-200">
                {title}
              </p>
              <p className="mt-1 truncate text-sm font-medium text-muted-foreground">
                {description}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted opacity-0 transition-all duration-300 group-hover:opacity-100">
              <ChevronRight className="h-5 w-5 text-foreground" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Live Pulse Indicator ─────────────────────────────────────────────

function LiveIndicator({ isLive }: { isLive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 backdrop-blur-sm px-3 py-1.5 shadow-sm"
    >
      <span className={cn("relative flex h-2.5 w-2.5", !isLive && "opacity-40")}>
        {isLive && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2.5 w-2.5 rounded-full",
            isLive ? "bg-emerald-500" : "bg-muted-foreground"
          )}
        />
      </span>
      <span
        className={cn(
          "text-xs font-bold tracking-wider",
          isLive ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-sm">
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

const kpiRow1: Omit<KPIConfig, "value">[] = [
  {
    label: "Queries Generated",
    icon: Terminal,
    gradient: "bg-blue-500",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-700",
    iconText: "text-white",
    delay: 0.05,
  },
  {
    label: "Excel Operations",
    icon: FileSpreadsheet,
    gradient: "bg-emerald-500",
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    iconText: "text-white",
    delay: 0.1,
  },
  {
    label: "Ticket Cancellations",
    icon: XCircle,
    gradient: "bg-rose-500",
    iconBg: "bg-gradient-to-br from-rose-500 to-rose-700",
    iconText: "text-white",
    delay: 0.15,
  },
  {
    label: "Asset Transfers",
    icon: ArrowRightLeft,
    gradient: "bg-violet-500",
    iconBg: "bg-gradient-to-br from-violet-500 to-violet-700",
    iconText: "text-white",
    delay: 0.2,
  },
];

const kpiRow2: Omit<KPIConfig, "value">[] = [
  {
    label: "Case Assignments",
    icon: Users,
    gradient: "bg-teal-500",
    iconBg: "bg-gradient-to-br from-teal-500 to-teal-700",
    iconText: "text-white",
    delay: 0.25,
  },
  {
    label: "Query Library Templates",
    icon: FilePlus,
    gradient: "bg-indigo-500",
    iconBg: "bg-gradient-to-br from-indigo-500 to-indigo-700",
    iconText: "text-white",
    delay: 0.3,
  },
  {
    label: "History Items",
    icon: History,
    gradient: "bg-amber-500",
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
    iconText: "text-white",
    delay: 0.35,
  },
  {
    label: "Favourites",
    icon: Star,
    gradient: "bg-yellow-400",
    iconBg: "bg-gradient-to-br from-yellow-400 to-amber-500",
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
    title: "Excel Automation",
    description: "Clean and transform spreadsheets",
    href: "/excel-automation",
    icon: FileSpreadsheet,
    gradient: "bg-gradient-to-r from-emerald-500 to-emerald-700",
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    delay: 0.15,
  },
  {
    title: "Ticket Formatter",
    description: "Format tickets for any language",
    href: "/ticket-formatter",
    icon: Ticket,
    gradient: "bg-gradient-to-r from-orange-500 to-amber-500",
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-500",
    delay: 0.2,
  },
  {
    title: "Query Library",
    description: "Create and manage query templates",
    href: "/template-manager",
    icon: Layers3,
    gradient: "bg-gradient-to-r from-violet-500 to-purple-700",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-700",
    delay: 0.25,
  },
];

// ─── Dashboard Page ───────────────────────────────────────────────────

export default function DashboardPage() {
<<<<<<< Updated upstream
  const stats = useDashboardStore();
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    const onFocus = () => setRefreshKey((prev) => prev + 1);
    const onVisibility = () => {
      if (!document.hidden) {
        setRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    toast.success("Dashboard refreshed");
  };

  const activities = [...(stats.activities ?? [])];

  return (
    <div className="space-y-6 max-w-7xl mx-auto" key={refreshKey}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your productivity and recent activity</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Queries Generated"
          value={stats.queriesGenerated ?? 0}
          icon={Terminal}
          color="bg-primary"
          href="/soql-generator"
        />
        <KPICard
          title="Excel Operations"
          value={stats.excelOperations ?? 0}
          icon={Table2}
          color="bg-success"
          href="/excel-automation"
        />
        <KPICard
          title="History Items"
          value={stats.historyItems ?? 0}
          icon={History}
          color="bg-warning"
          href="/history"
        />
        <KPICard
          title="Favourites"
          value={stats.favourites ?? 0}
          icon={Star}
          color="bg-orange-500"
          href="/template-manager"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickActionCard
              title="SOQL Generator"
              description="Generate SOQL from ticket numbers"
              icon={Terminal}
              color="bg-primary"
              href="/soql-generator"
            />
            <QuickActionCard
              title="Excel Automation"
              description="Clean and transform spreadsheets"
              icon={Table2}
              color="bg-success"
              href="/excel-automation"
            />
            <QuickActionCard
              title="Ticket Formatter"
              description="Format tickets for any language"
              icon={Zap}
              color="bg-warning"
              href="/ticket-formatter"
            />
            <QuickActionCard
              title="Template Manager"
              description="Manage query templates"
              icon={Bookmark}
              color="bg-orange-500"
              href="/template-manager"
            />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
            <Link href="/history">
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                View all
              </Button>
            </Link>
          </div>
          <Card className="overflow-hidden border-border/70 shadow-sm">
            <CardContent className="p-0">
              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <History className="h-8 w-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No activity yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start working to see your activity here</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {activities.slice(0, 6).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${activityColor(activity.type)}`}>
                        {activityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {getTimeAgo(activity.timestamp)}
                      </span>
=======
  const soqlGeneratedCount = useDashboardStore((s) => s.soqlGeneratedCount);
  const excelOperationCount = useDashboardStore((s) => s.excelOperationCount);
  const ticketCancellationCount = useDashboardStore((s) => s.ticketCancellationCount);
  const assetTransferCount = useDashboardStore((s) => s.assetTransferCount);
  const caseAssignmentCount = useDashboardStore((s) => s.caseAssignmentCount);
  const templatesCreatedCount = useDashboardStore((s) => s.templatesCreatedCount);
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

  const row1Values = [soqlGeneratedCount, excelOperationCount, ticketCancellationCount, assetTransferCount];
  const row2Values = [caseAssignmentCount, templatesCreatedCount, activity.length, favouritesCount];

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
    <div className="mx-auto w-full max-w-7xl space-y-10 p-4 sm:p-6 lg:p-8">
      {/* ─── Hero Header ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 shadow-2xl lg:p-12 border border-slate-800"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl mix-blend-screen" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl mix-blend-screen" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-sm font-semibold text-indigo-300 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              <span>Welcome back, Commander</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white lg:text-5xl">
              Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Center</span>
            </h1>
            <p className="max-w-xl text-lg font-medium text-slate-400">
              Your centralized hub for automation metrics, system health, and quick actions.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <LiveIndicator isLive={isLive} />
            <span
              className="hidden text-sm font-medium text-slate-400 sm:inline bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 backdrop-blur-sm"
              title={mounted ? formatExactTime(lastRefreshed.toISOString()) : undefined}
              suppressHydrationWarning
            >
              Updated: {mounted ? formatRelativeTime(lastRefreshed.toISOString()) : "just now"}
            </span>
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-xl border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all font-bold"
              onClick={handleReset}
              disabled={isResetting}
            >
              <RotateCcw className={cn("h-4 w-4", isResetting && "animate-spin")} />
              Reset
            </Button>
            <Button
              variant="primary"
              className="h-10 gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all font-bold"
              onClick={handleRefresh}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ─── Primary KPI Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpiRow1.map((kpi, i) => (
          <KPICard key={kpi.label} {...kpi} value={row1Values[i] ?? 0} />
        ))}
      </div>

      {/* ─── Secondary KPI Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpiRow2.map((kpi, i) => (
          <KPICard key={kpi.label} {...kpi} value={row2Values[i] ?? 0} />
        ))}
      </div>

      {/* ─── Quick Actions + Recent Activity ────────────────────────── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr,1fr]">
        {/* Quick Actions */}
        <div className="space-y-6">
          <SectionHeader title="Quick Actions" icon={Zap} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                  {activity.length} events
                </span>
              ) : null
            }
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 rounded-2xl">
              <CardContent className="p-0">
                {activity.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 p-12 text-center bg-gradient-to-b from-transparent to-muted/30">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted shadow-inner">
                      <Clock className="h-8 w-8 text-muted-foreground/50" />
>>>>>>> Stashed changes
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
                  <ul className="divide-y divide-border/40">
                    <AnimatePresence initial={false}>
                      {activity.slice(0, 7).map((entry, index) => {
                        const meta = activityMeta(entry.type);
                        const Icon = meta.icon;
                        return (
                          <motion.li
                            key={entry.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.04, duration: 0.3 }}
                            className="group flex items-center gap-4 px-5 py-4 transition-all hover:bg-muted/50 cursor-default"
                          >
                            <div
                              className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-110",
                                meta.bg, meta.text, meta.ring
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {entry.label}
                              </p>
                              {entry.meta && (
                                <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                                  {entry.meta}
                                </p>
                              )}
                            </div>
                            <span
                              className="shrink-0 text-xs font-bold text-muted-foreground/70 tabular-nums bg-muted/50 px-2 py-1 rounded-md"
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
            </Card>
          </motion.div>

          {activity.length > 7 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-2"
            >
              <Link href="/history">
                <Button
                  variant="outline"
                  className="w-full h-11 gap-2 rounded-xl border-border/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all font-bold"
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
