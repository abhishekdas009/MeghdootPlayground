"use client";

import * as React from "react";
import { ValidationRuleId, VALIDATION_RULES } from "@/lib/ticket-engine";
import { CheckCircle2, AlertTriangle, Layers, Hash, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketStatsPillsProps {
  totalRaw: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  selectedRule: ValidationRuleId;
  onRuleChange?: (rule: ValidationRuleId) => void;
  className?: string;
}

export function TicketStatsPills({
  totalRaw,
  validCount,
  invalidCount,
  duplicateCount,
  selectedRule,
  onRuleChange,
  className,
}: TicketStatsPillsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Total Raw */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-card/80 border border-border/80 text-foreground text-xs font-bold shadow-2xs">
        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-muted-foreground text-[11px] font-medium">Total:</span>
        <span className="font-extrabold">{totalRaw}</span>
      </div>

      {/* Valid */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-2xs">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-[11px] font-medium">Valid:</span>
        <span className="font-extrabold">{validCount}</span>
      </div>

      {/* Invalid (shown if any exist or highlighted) */}
      {invalidCount > 0 ? (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-700 dark:text-rose-300 text-xs font-bold shadow-2xs animate-pulse">
          <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
          <span className="text-[11px] font-medium">Invalid:</span>
          <span className="font-extrabold">{invalidCount}</span>
        </div>
      ) : (
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-card/60 border border-border/60 text-muted-foreground text-xs font-bold">
          <span className="text-[11px] font-medium">Invalid:</span>
          <span>0</span>
        </div>
      )}

      {/* Duplicates Pruned */}
      {duplicateCount > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-2xs">
          <Layers className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span className="text-[11px] font-medium">Duplicates:</span>
          <span className="font-extrabold">{duplicateCount}</span>
        </div>
      )}

      {/* Validation Rule Selector */}
      {onRuleChange && (
        <div className="ml-auto flex items-center gap-1.5 pl-2">
          <Settings2 className="h-3.5 w-3.5 text-muted-foreground hidden sm:inline" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hidden sm:inline">
            Rule:
          </span>
          <select
            value={selectedRule}
            onChange={(e) => onRuleChange(e.target.value as ValidationRuleId)}
            className="text-xs font-bold rounded-xl border border-border/80 bg-background/80 dark:bg-card px-2.5 py-1 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 cursor-pointer transition-all shadow-2xs"
          >
            {Object.values(VALIDATION_RULES).map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
