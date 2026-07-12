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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">History</h1>
        <p className="text-sm text-muted-foreground">Every operation you perform is saved here</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-4 hover:bg-hover transition-colors"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-md ${typeColors[item.type]}`}>
                  {typeIcons[item.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    {item.favourite && <Star className="h-3 w-3 fill-warning text-warning" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {item.time}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFav(item.id)}>
                    <Star className={`h-4 w-4 ${item.favourite ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-danger" onClick={() => remove(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No history found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
