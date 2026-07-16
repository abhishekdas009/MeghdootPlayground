"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Sheet, Star, History, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Data & Mappings ---

const stats = [
  { label: "Queries Generated", value: "1,248", icon: Terminal, color: "primary" },
  { label: "Excel Operations", value: "342", icon: Sheet, color: "success" },
  { label: "History Items", value: "892", icon: History, color: "warning" },
  { label: "Favourites", value: "56", icon: Star, color: "secondary" },
] as const;

// Map logical colors to Tailwind utility classes
const colorMap: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  secondary: "bg-secondary/20 text-secondary-foreground",
};

const topTemplates = [
  { name: "TS Template", count: 412, pct: 33 },
  { name: "Escalation Query", count: 198, pct: 16 },
  { name: "WorkOrder Status", count: 156, pct: 12 },
  { name: "Case Owner Check", count: 124, pct: 10 },
  { name: "Asset Transfer", count: 98, pct: 8 },
];

const recentActivity = [
  { label: "SOQL Generated", time: "2 min ago", badge: "Query" },
  { label: "Excel processed", time: "15 min ago", badge: "Excel" },
  { label: "Template favourited", time: "1 hr ago", badge: "Template" },
  { label: "Tickets formatted", time: "2 hr ago", badge: "Format" },
  { label: "Formula built", time: "3 hr ago", badge: "Formula" },
];

// --- Animation Variants ---

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
};

export default function AnalyticsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold leading-tight tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Usage insights and productivity metrics
        </p>
      </div>

      {/* Top Stats Grid */}
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={itemVariants}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="mt-1 text-[clamp(1.5rem,3vw,1.875rem)] font-bold text-foreground">
                      {s.value}
                    </p>
                  </div>
                  <div 
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                      colorMap[s.color] || colorMap.primary
                    )}
                  >
                    <s.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom Layout Grid */}
      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        
        {/* Most Used Templates */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Most Used Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <ul role="list" className="space-y-5">
                {topTemplates.map((t) => (
                  <li key={t.name} className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-medium text-foreground">{t.name}</span>
                      <span className="text-muted-foreground tabular-nums">{t.count} uses</span>
                    </div>
                    {/* Accessible Progress Bar */}
                    <div 
                      role="progressbar" 
                      aria-valuenow={t.pct} 
                      aria-valuemin={0} 
                      aria-valuemax={100}
                      className="h-2 w-full overflow-hidden rounded-full bg-muted"
                    >
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${t.pct}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                        className="h-full rounded-full bg-primary" 
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul role="list" className="space-y-3">
                {recentActivity.map((a, i) => (
                  <li 
                    key={i} 
                    className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3.5 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      <span className="text-sm font-medium text-foreground">
                        {a.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                        {a.badge}
                      </Badge>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" /> 
                        {a.time}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
