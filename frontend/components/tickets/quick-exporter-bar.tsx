"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { QUICK_EXPORTERS, QuickExporterPreset } from "@/lib/ticket-engine";
import { Database, FileSpreadsheet, List, Quote, CheckSquare, Code2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuickExporterBarProps {
  tickets: string[];
  title?: string;
  className?: string;
  onExport?: (preset: QuickExporterPreset, formattedText: string) => void;
}

export function QuickExporterBar({
  tickets,
  title = "Quick 1-Click Exporters",
  className,
  onExport,
}: QuickExporterBarProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const getIcon = (id: string) => {
    switch (id) {
      case "soql-in":
        return <Database className="h-3.5 w-3.5" />;
      case "excel-column":
        return <FileSpreadsheet className="h-3.5 w-3.5" />;
      case "comma":
        return <List className="h-3.5 w-3.5" />;
      case "quoted-csv":
        return <Quote className="h-3.5 w-3.5" />;
      case "jira-slack":
        return <CheckSquare className="h-3.5 w-3.5" />;
      case "json-array":
        return <Code2 className="h-3.5 w-3.5" />;
      default:
        return <Copy className="h-3.5 w-3.5" />;
    }
  };

  const handleQuickCopy = (preset: QuickExporterPreset) => {
    if (tickets.length === 0) {
      toast.error("No tickets to export");
      return;
    }

    const formatted = preset.format(tickets);
    navigator.clipboard.writeText(formatted);
    setCopiedId(preset.id);
    setTimeout(() => setCopiedId(null), 2000);

    toast.success(`Copied as ${preset.label} (${tickets.length} tickets)`, {
      description: preset.description,
    });

    if (onExport) {
      onExport(preset, formatted);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card/60 dark:bg-[#08090d]/80 p-3.5 backdrop-blur-md transition-all",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {title}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {tickets.length} ticket{tickets.length === 1 ? "" : "s"}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground italic hidden sm:inline">
          1-click to copy formatted output directly to clipboard
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {QUICK_EXPORTERS.map((preset) => {
          const isCopied = copiedId === preset.id;
          return (
            <Button
              key={preset.id}
              type="button"
              variant="outline"
              size="sm"
              disabled={tickets.length === 0}
              onClick={() => handleQuickCopy(preset)}
              title={preset.description}
              className={cn(
                "h-9 px-2.5 flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all relative group",
                isCopied
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-xs"
                  : "bg-background/80 hover:bg-primary/10 hover:border-primary/40 text-foreground active:scale-95"
              )}
            >
              <span className={cn(
                "shrink-0 transition-transform group-hover:scale-110",
                isCopied ? "text-emerald-500" : "text-primary"
              )}>
                {isCopied ? <Check className="h-3.5 w-3.5" /> : getIcon(preset.id)}
              </span>
              <span className="truncate text-[11px]">
                {isCopied ? "Copied!" : preset.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
