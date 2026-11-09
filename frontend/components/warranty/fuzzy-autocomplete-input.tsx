"use client";

import * as React from "react";
import { searchFuzzyList, FuzzyMatchResult } from "@/lib/fuzzy-matcher";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Zap, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface FuzzyAutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
  className?: string;
  onSelectOption?: (val: string) => void;
}

export function FuzzyAutocompleteInput({
  value,
  onChange,
  options,
  placeholder,
  required = false,
  className,
  onSelectOption,
}: FuzzyAutocompleteInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute fuzzy matches
  const matches: FuzzyMatchResult<string>[] = React.useMemo(() => {
    return searchFuzzyList(value, options, 25);
  }, [value, options]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [value]);

  const handleSelect = (selectedVal: string) => {
    onChange(selectedVal);
    setIsOpen(false);
    if (onSelectOption) {
      onSelectOption(selectedVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const match = matches[selectedIndex];
      if (match) {
        handleSelect(match.item);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const getTagColor = (type: string) => {
    switch (type) {
      case "exact":
        return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
      case "prefix":
        return "bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30";
      case "fuzzy-tokens":
        return "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30";
      case "typo":
        return "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30";
      default:
        return "bg-muted text-muted-foreground border-border/80";
    }
  };

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      <div className="glass-field-well px-3.5 py-1.5 flex items-center justify-between transition-all group">
        <input
          type="text"
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border-none outline-none focus:ring-0 shadow-none text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 p-0"
        />

        <div className="flex items-center gap-1 shrink-0 ml-1.5">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="text-muted-foreground hover:text-rose-500 p-0.5 rounded-full transition-colors"
              title="Clear input"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-muted-foreground hover:text-foreground p-0.5 focus:outline-hidden"
            title="Toggle suggestions"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "rotate-180 text-sky-500"
              )}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 min-w-full sm:min-w-[340px] max-w-[480px] mt-2 rounded-2xl border border-slate-200/90 dark:border-white/15 bg-white/95 dark:bg-[#080b12]/95 backdrop-blur-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto no-scrollbar p-1.5 space-y-0.5"
            ref={listRef}
          >
            <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between gap-2 border-b border-border/60 pb-1.5 mb-1">
              <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap text-slate-700 dark:text-slate-300">
                <Search className="h-3 w-3 text-sky-500 shrink-0" />
                <span>Suggestions</span>
                <span className="px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[9px] font-bold">
                  {matches.length}
                </span>
              </span>
              <span className="text-[9px] text-muted-foreground/80 font-semibold whitespace-nowrap hidden sm:inline-flex items-center gap-1">
                <span>↑↓ navigate</span>
                <span>·</span>
                <span>↵ select</span>
              </span>
            </div>

            {matches.map((match, i) => {
              const isSelected = i === selectedIndex;
              return (
                <div
                  key={`${match.item}-${i}`}
                  onClick={() => handleSelect(match.item)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={cn(
                    "px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2",
                    isSelected
                      ? "bg-sky-500/15 text-sky-600 dark:text-sky-300 font-bold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-sky-500/10 hover:text-sky-500"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono truncate">{match.item}</span>
                  </div>

                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0",
                      getTagColor(match.matchType)
                    )}
                  >
                    {match.matchType === "fuzzy-tokens" ? "Fuzzy Match" : match.matchType}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
