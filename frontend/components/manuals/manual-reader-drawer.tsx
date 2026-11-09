"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  ExternalLink,
  Download,
  Maximize2,
  Minimize2,
  FileText,
  Tag,
  Sparkles,
  Columns,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ManualItem {
  id: string;
  title: string;
  description: string | null;
  version: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

interface ManualReaderDrawerProps {
  manual: ManualItem | null;
  onClose: () => void;
  isSplitMode?: boolean;
  onToggleSplitMode?: () => void;
}

const COMMON_SERVICE_KEYWORDS = [
  "E4 Error",
  "Error Code",
  "Wiring Diagram",
  "PCB Circuit",
  "Gas Pressure",
  "Compressor",
  "Installation",
  "Troubleshooting",
];

export function ManualReaderDrawer({
  manual,
  onClose,
  isSplitMode = true,
  onToggleSplitMode,
}: ManualReaderDrawerProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeKeyword, setActiveKeyword] = React.useState("");
  const [isMaximized, setIsMaximized] = React.useState(false);

  const iframeSrc = React.useMemo(() => {
    if (!manual) return "";
    const base = manual.fileUrl;
    const params: string[] = ["toolbar=1", "navpanes=1"];
    if (activeKeyword) {
      params.push(`search="${encodeURIComponent(activeKeyword)}"`);
    }
    return `${base}#${params.join("&")}`;
  }, [manual, activeKeyword]);

  if (!manual) return null;

  const handleKeywordClick = (keyword: string) => {
    setSearchTerm(keyword);
    setActiveKeyword(keyword);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveKeyword(searchTerm.trim());
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className={cn(
          "flex flex-col h-full bg-white dark:bg-[#07090e] border-l border-slate-200 dark:border-white/10 shadow-2xl z-40 transition-all",
          isMaximized
            ? "fixed inset-0 z-50"
            : isSplitMode
            ? "w-full lg:w-[60%] xl:w-[65%]"
            : "w-full"
        )}
      >
        {/* ── Drawer Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#0b0d14]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black tracking-tight text-foreground truncate" title={manual.title}>
                    {manual.title}
                  </h2>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold px-2 py-0 text-sky-600 dark:text-sky-300 border-sky-500/30 uppercase shrink-0"
                  >
                    {manual.version}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {manual.fileName} · {formatSize(manual.fileSize)}
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {onToggleSplitMode && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onToggleSplitMode}
                  title="Toggle Split Screen View"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <Columns className="h-4 w-4" />
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? "Restore view" : "Maximize view"}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>

              <a
                href={manual.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in new window / tab"
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-sky-500 hover:bg-sky-500/10 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>

              <a
                href={manual.fileUrl}
                download
                title="Download PDF"
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
              >
                <Download className="h-4 w-4" />
              </a>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                title="Close Reader"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* In-Document Search & Fast Jump Bar */}
          <div className="flex flex-col gap-2 pt-1 border-t border-border/50">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="In-document search (e.g. error code E4, wiring diagram, PCB)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-4 py-1.5 rounded-xl border border-border/80 bg-background text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="h-8 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs gap-1 shadow-xs"
              >
                <Sparkles className="h-3 w-3" />
                <span>Jump</span>
              </Button>
              {activeKeyword && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveKeyword("");
                  }}
                  className="h-8 px-2 text-xs font-bold text-muted-foreground hover:text-rose-500"
                >
                  Clear
                </Button>
              )}
            </form>

            {/* Keyword Quick Jump Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Tag className="h-2.5 w-2.5" /> Quick Jumps:
              </span>
              {COMMON_SERVICE_KEYWORDS.map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => handleKeywordClick(keyword)}
                  className={cn(
                    "px-2.5 py-0.5 rounded-lg text-[10.5px] font-bold transition-all border whitespace-nowrap shrink-0 cursor-pointer",
                    activeKeyword === keyword
                      ? "bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/40 shadow-xs"
                      : "bg-background/80 hover:bg-card text-muted-foreground hover:text-foreground border-border/70"
                  )}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Document Viewer Iframe ───────────────────────────────────────────── */}
        <div className="flex-1 relative bg-slate-100 dark:bg-black/60 overflow-hidden">
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            title={manual.title}
            className="w-full h-full border-none"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
