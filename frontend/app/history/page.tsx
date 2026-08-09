"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Trash2, Clock, Terminal, Sheet, Zap, LayoutTemplate } from "lucide-react";

const historyData = [
  { id: "1", type: "query", title: "TS Template — 12 tickets", detail: "SELECT Id, Status FROM WorkOrder...", time: "2 min ago", favourite: true },
  { id: "2", type: "excel", title: "Remove Duplicates", detail: "file.xlsx • 4 rows removed", time: "15 min ago", favourite: false },
  { id: "3", type: "template", title: "Favourited WorkOrder Status", detail: "Template added to favourites", time: "1 hr ago", favourite: true },
  { id: "4", type: "format", title: "SOQL IN Format", detail: "8 tickets formatted", time: "2 hr ago", favourite: false },
  { id: "5", type: "query", title: "Escalation Template — 5 tickets", detail: "SELECT Id, OwnerId FROM Case...", time: "3 hr ago", favourite: false },
  { id: "6", type: "formula", title: "XLOOKUP Formula", detail: "=XLOOKUP(A2, Sheet1!A:A, Sheet1!B:B)", time: "5 hr ago", favourite: true },
];

const typeIcons: Record<string, React.ReactNode> = {
  query: <Terminal className="h-4 w-4" />,
  excel: <Sheet className="h-4 w-4" />,
  template: <LayoutTemplate className="h-4 w-4" />,
  format: <Zap className="h-4 w-4" />,
  formula: <Zap className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  query: "bg-primary/10 text-primary",
  excel: "bg-success/10 text-success",
  template: "bg-warning/10 text-warning",
  format: "bg-secondary/10 text-secondary",
  formula: "bg-muted text-foreground",
};

export default function HistoryPage() {
  const [search, setSearch] = React.useState("");
  const [items, setItems] = React.useState(historyData);

  const filtered = items.filter((i) =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.detail.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFav = (id: string) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, favourite: !i.favourite } : i));
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="workspace-page mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* ─── Header Section ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="page-hero relative flex flex-col gap-6 overflow-hidden rounded-3xl p-8"
      >
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-slate-500/10 blur-3xl dark:bg-slate-500/20 dark:mix-blend-screen" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-zinc-500/20 dark:mix-blend-screen" />
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-zinc-700 shadow-lg shadow-slate-900/30">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-slate-500/10 text-slate-700 border border-slate-300 text-xs font-bold px-3 py-1 flex items-center gap-2 shadow-inner backdrop-blur-sm uppercase tracking-widest dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/40">
                  Activity Log
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 drop-shadow-sm dark:text-white">
                Action <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-zinc-400">History</span>
              </h1>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium max-w-2xl leading-relaxed mt-2 text-sm">
            A complete record of your operations across Meghdoot. Review past queries, Excel automation tasks, and formatting jobs.
          </p>
        </div>
      </motion.div>

      {/* ─── Main Content ──────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="border-0 shadow-xl ring-1 ring-black/5 dark:ring-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-slate-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <CardHeader className="bg-gradient-to-r from-slate-100/50 to-transparent dark:from-slate-800/50 px-8 py-6 border-b border-slate-200/50 dark:border-slate-700/50 relative z-10">
            <div className="flex items-center gap-4 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search history records..."
                  className="pl-10 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-slate-500/40 focus-visible:border-slate-500 shadow-inner text-sm transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 relative z-10">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col gap-4 p-6 transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800/50 sm:flex-row sm:items-center group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                  
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                    item.type === 'query' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                    item.type === 'excel' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                    item.type === 'template' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                    item.type === 'format' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' :
                    'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                  }`}>
                    {typeIcons[item.type]}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-black text-foreground truncate group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{item.title}</p>
                      {item.favourite && <Star className="h-4 w-4 fill-amber-500 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />}
                    </div>
                    <p className="text-sm font-medium text-slate-500 truncate max-w-2xl">{item.detail}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 sm:shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Clock className="h-3.5 w-3.5" /> {item.time}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => toggleFav(item.id)} aria-label={item.favourite ? "Remove favourite" : "Add favourite"} className="h-9 w-9 rounded-xl hover:bg-amber-500/10 hover:text-amber-600 transition-colors">
                      <Star className={`h-4 w-4 transition-colors ${item.favourite ? "fill-amber-500 text-amber-500" : "text-slate-400"}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-500/10 transition-colors" onClick={() => remove(item.id)} aria-label="Delete history item">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4 shadow-inner">
                    <Search className="h-8 w-8" />
                  </div>
                  <p className="text-lg font-bold text-foreground">No history records found</p>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm">We couldn&apos;t find any activity matching your current search filters.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
