"use client";

import * as React from "react";
import { DuplicateItem } from "@/lib/ticket-engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, ChevronDown, ChevronUp, Copy, Check, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface DeduplicationInspectorProps {
  duplicateCount: number;
  duplicateItems: DuplicateItem[];
  deduplicateEnabled?: boolean;
  onToggleDeduplicate?: (enabled: boolean) => void;
  className?: string;
}

export function DeduplicationInspector({
  duplicateCount,
  duplicateItems,
  deduplicateEnabled = true,
  onToggleDeduplicate,
  className,
}: DeduplicationInspectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [copiedTicket, setCopiedTicket] = React.useState<string | null>(null);

  if (duplicateCount === 0) {
    return null;
  }

  const handleCopyTicket = (ticket: string) => {
    navigator.clipboard.writeText(ticket);
    setCopiedTicket(ticket);
    setTimeout(() => setCopiedTicket(null), 1500);
    toast.success(`Copied duplicate ticket: ${ticket}`);
  };

  const handleCopyAllDuplicates = () => {
    const list = duplicateItems.map((d) => d.ticket).join("\n");
    navigator.clipboard.writeText(list);
    toast.success(`Copied ${duplicateItems.length} unique duplicate ticket(s) to clipboard`);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 p-3.5 backdrop-blur-md transition-all shadow-xs",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-tight text-amber-950 dark:text-amber-200">
                Deduplication Inspector
              </span>
              <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-extrabold px-2 py-0.2">
                {duplicateCount} duplicate{duplicateCount === 1 ? "" : "s"} {deduplicateEnabled ? "pruned" : "detected"}
              </Badge>
            </div>
            <p className="text-[10px] text-amber-800 dark:text-amber-400/90 mt-0.5">
              {duplicateItems.length} distinct case number{duplicateItems.length === 1 ? "" : "s"} repeated across the pasted list.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {onToggleDeduplicate && (
            <button
              type="button"
              onClick={() => onToggleDeduplicate(!deduplicateEnabled)}
              className={cn(
                "text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer",
                deduplicateEnabled
                  ? "bg-amber-500/25 text-amber-900 dark:text-amber-200 border-amber-500/40 hover:bg-amber-500/35"
                  : "bg-background/80 text-muted-foreground border-border/80 hover:bg-card"
              )}
            >
              {deduplicateEnabled ? "Auto-Deduplication: ON" : "Auto-Deduplication: OFF"}
            </button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-7 px-2.5 rounded-lg text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 text-xs font-bold gap-1"
          >
            <span>{isOpen ? "Hide List" : "Inspect Duplicates"}</span>
            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-amber-500/20 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-300">
                <span className="font-semibold flex items-center gap-1">
                  <Info className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  Click any pill to copy that ticket:
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAllDuplicates}
                  className="h-6 px-2 text-[10px] font-bold rounded-md bg-white/70 dark:bg-black/30 border-amber-500/30 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 gap-1"
                >
                  <Copy className="h-3 w-3" /> Copy All Duplicates
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1.5 rounded-xl bg-white/50 dark:bg-black/40 border border-amber-500/20">
                {duplicateItems.map((item) => {
                  const isCopied = copiedTicket === item.ticket;
                  return (
                    <button
                      key={item.ticket}
                      type="button"
                      onClick={() => handleCopyTicket(item.ticket)}
                      title={`Seen ${item.count} times. Click to copy.`}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all border",
                        isCopied
                          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                          : "bg-card/80 hover:bg-amber-500/20 text-amber-950 dark:text-amber-100 border-amber-500/30 hover:border-amber-500/50"
                      )}
                    >
                      <span>{item.ticket}</span>
                      <span className="text-[9.5px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-sans font-black">
                        ×{item.count}
                      </span>
                      {isCopied && <Check className="h-3 w-3 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
