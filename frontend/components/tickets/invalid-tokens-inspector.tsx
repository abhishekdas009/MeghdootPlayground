"use client";

import * as React from "react";
import { InvalidTokenItem } from "@/lib/ticket-engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ChevronDown, ChevronUp, Copy, Sparkles, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface InvalidTokensInspectorProps {
  invalidTokens: InvalidTokenItem[];
  ruleBadge?: string;
  onStripInvalid?: () => void;
  className?: string;
}

export function InvalidTokensInspector({
  invalidTokens,
  ruleBadge = "7-8 Digits",
  onStripInvalid,
  className,
}: InvalidTokensInspectorProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  if (invalidTokens.length === 0) {
    return null;
  }

  const handleCopyInvalid = () => {
    const text = invalidTokens.map((t) => t.ticket).join("\n");
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${invalidTokens.length} invalid token(s) to clipboard`);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-rose-500/40 bg-rose-500/10 dark:bg-rose-950/20 p-3.5 backdrop-blur-md transition-all shadow-xs",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-tight text-rose-950 dark:text-rose-200">
                Invalid Case Numbers Detected
              </span>
              <Badge className="bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] font-extrabold px-2 py-0.2 animate-pulse">
                {invalidTokens.length} invalid (Rule: {ruleBadge})
              </Badge>
            </div>
            <p className="text-[10px] text-rose-800 dark:text-rose-400/90 mt-0.5">
              These tokens do not match standard Salesforce ticket format and may cause query failures.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {onStripInvalid && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onStripInvalid}
              className="h-7 px-3 rounded-lg text-rose-900 dark:text-rose-200 bg-white/70 dark:bg-black/30 border-rose-500/40 hover:bg-rose-500/20 text-xs font-bold gap-1.5 shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-rose-500" />
              <span>Strip All Invalid</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-7 px-2.5 rounded-lg text-rose-900 dark:text-rose-200 hover:bg-rose-500/20 text-xs font-bold gap-1"
          >
            <span>{isOpen ? "Hide Errors" : "View Errors"}</span>
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
            <div className="pt-3 mt-3 border-t border-rose-500/20 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-rose-900 dark:text-rose-300">
                <span className="font-semibold flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                  Mismatches identified in real-time:
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyInvalid}
                  className="h-6 px-2 text-[10px] font-bold rounded-md bg-white/70 dark:bg-black/30 border-rose-500/30 text-rose-900 dark:text-rose-200 hover:bg-rose-500/20 gap-1"
                >
                  <Copy className="h-3 w-3" /> Copy Invalid
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1.5 rounded-xl bg-white/50 dark:bg-black/40 border border-rose-500/20">
                {invalidTokens.map((item, i) => (
                  <div
                    key={`${item.ticket}-${i}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-card/80 border border-rose-500/30 text-rose-950 dark:text-rose-100"
                  >
                    <span className="underline decoration-rose-500 decoration-wavy">{item.ticket}</span>
                    <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 font-sans font-bold">
                      {item.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
