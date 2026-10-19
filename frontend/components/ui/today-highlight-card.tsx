"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Calendar, Info, Quote, PartyPopper, History, Globe } from "lucide-react";
import { getTodayHighlight, type HighlightData } from "@/lib/today-highlight-logic";
import { cn } from "@/lib/utils";

export function TodayHighlightCard({ className }: { className?: string }) {
  const [highlight, setHighlight] = useState<HighlightData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHighlight(getTodayHighlight());
    setMounted(true);
  }, []);

  if (!mounted || !highlight) return null;

  const CategoryIcon = 
    highlight.category === "INDIAN FESTIVALS & CELEBRATIONS" ? PartyPopper :
    highlight.category === "NATIONAL & INTERNATIONAL DAYS" ? Globe :
    highlight.category === "HISTORICAL EVENTS" ? History :
    highlight.category === "FUNNY / LIGHTHEARTED CONTENT" ? Sparkles : Calendar;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className={cn("glass-panel relative overflow-hidden rounded-2xl border border-border/80 bg-card/85 p-6 shadow-md backdrop-blur-xl dark:border-white/10 dark:bg-[#0b0c10]/95", className)}
    >
      {/* Background Decor */}
      <div className="absolute -right-6 -top-6 opacity-5 pointer-events-none">
        <CategoryIcon className="w-32 h-32" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-primary">
            {highlight.category || "TODAY'S HIGHLIGHT"}
          </span>
        </div>

        {/* Title & Date */}
        <div className="mb-4">
          <h3 className="text-2xl font-black tracking-tight text-foreground mb-1">
            {highlight.title}
          </h3>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{highlight.dateFormatted}</span>
            {highlight.historicalYear && (
              <>
                <span className="mx-1">•</span>
                <span>{highlight.historicalYear}</span>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {highlight.description && (
          <p className="text-foreground/90 font-medium leading-relaxed mb-6">
            {highlight.description}
          </p>
        )}

        {/* Fact & Quote Blocks */}
        <div className="mt-auto space-y-3">
          {highlight.fact && (
            <div className="flex items-start gap-3 rounded-xl bg-muted/60 dark:bg-[#06070a] p-4 border border-border/60 dark:border-white/5">
              <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-primary mb-1 block">Fun Fact</span>
                <p className="text-sm font-medium text-foreground/90">{highlight.fact}</p>
              </div>
            </div>
          )}

          {highlight.quote && (
            <div className="flex items-start gap-3 rounded-xl bg-primary/5 dark:bg-[#06070a] p-4 border border-primary/20 dark:border-primary/20">
              <Quote className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-primary mb-1 block">Today&apos;s Line</span>
                <p className="text-sm font-semibold italic text-foreground">&quot;{highlight.quote}&quot;</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
