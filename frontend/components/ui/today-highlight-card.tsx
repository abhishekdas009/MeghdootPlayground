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
      className={cn("glass-panel relative overflow-hidden rounded-2xl border border-blue-900/10 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:from-slate-900/50 dark:to-indigo-950/30", className)}
    >
      {/* Background Decor */}
      <div className="absolute -right-6 -top-6 opacity-5 pointer-events-none">
        <CategoryIcon className="w-32 h-32" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            {highlight.category || "TODAY'S HIGHLIGHT"}
          </span>
        </div>

        {/* Title & Date */}
        <div className="mb-4">
          <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
            {highlight.title}
          </h3>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
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
          <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-6">
            {highlight.description}
          </p>
        )}

        {/* Fact & Quote Blocks */}
        <div className="mt-auto space-y-3">
          {highlight.fact && (
            <div className="flex items-start gap-3 rounded-xl bg-white/60 dark:bg-black/20 p-4 border border-white/40 dark:border-white/5">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 mb-1 block">Fun Fact</span>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{highlight.fact}</p>
              </div>
            </div>
          )}

          {highlight.quote && (
            <div className="flex items-start gap-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 p-4 border border-indigo-100/50 dark:border-indigo-900/30">
              <Quote className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 mb-1 block">Today's Line</span>
                <p className="text-sm font-semibold italic text-indigo-900 dark:text-indigo-200">"{highlight.quote}"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
