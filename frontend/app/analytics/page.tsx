"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Sheet, Star, History, TrendingUp, Clock } from "lucide-react";

const stats = [
  { label: "Queries Generated", value: "1,248", icon: Terminal, color: "primary" as const },
  { label: "Excel Operations", value: "342", icon: Sheet, color: "success" as const },
  { label: "History Items", value: "892", icon: History, color: "warning" as const },
  { label: "Favourites", value: "56", icon: Star, color: "secondary" as const },
];

const topTemplates = [
  { name: "TS Template", count: 412, pct: 33 },
  { name: "Escalation Query", count: 198, pct: 16 },
  { name: "WorkOrder Status", count: 156, pct: 12 },
  { name: "Case Owner Check", count: 124, pct: 10 },
  { name: "Asset Transfer", count: 98, pct: 8 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Usage insights and productivity metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hover">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Most Used Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTemplates.map((t) => (
                  <div key={t.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{t.name}</span>
                      <span className="text-muted-foreground">{t.count} uses</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${t.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "SOQL Generated", time: "2 min ago", badge: "Query" },
                  { label: "Excel processed", time: "15 min ago", badge: "Excel" },
                  { label: "Template favourited", time: "1 hr ago", badge: "Template" },
                  { label: "Tickets formatted", time: "2 hr ago", badge: "Format" },
                  { label: "Formula built", time: "3 hr ago", badge: "Formula" },
                ].map((a, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-hover transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium text-foreground">{a.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{a.badge}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {a.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
