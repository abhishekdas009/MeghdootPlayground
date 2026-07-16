"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDashboardStore, getTimeAgo } from "@/lib/dashboard-store";
import {
  Terminal,
  Table2,
  History,
  Star,
  Zap,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

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
}

function KPICard({
  title,
  value,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
}) {
  return (
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
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="overflow-hidden border-border/70 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color} text-white shadow-sm`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

const activityIcon = (type: string) => {
  switch (type) {
    case "soql":
      return <Terminal className="h-4 w-4 text-primary" />;
    case "excel":
      return <Table2 className="h-4 w-4 text-success" />;
    case "ticket":
      return <Zap className="h-4 w-4 text-warning" />;
    case "favourite":
      return <Star className="h-4 w-4 text-orange-500" />;
    default:
      return <History className="h-4 w-4 text-muted-foreground" />;
  }
};

const activityColor = (type: string) => {
  switch (type) {
    case "soql":
      return "bg-primary/10";
    case "excel":
      return "bg-success/10";
    case "ticket":
      return "bg-warning/10";
    case "favourite":
      return "bg-orange-500/10";
    default:
      return "bg-muted";
  }
};

export default function DashboardPage() {
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
