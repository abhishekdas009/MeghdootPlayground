"use client";

import * as React from "react";
import {
  MessageSquare,
  Check,
  CheckCheck,
  FileSpreadsheet,
  Download,
  Copy,
  ExternalLink,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WhatsAppChatBubbleSimulatorProps {
  reportMode: "UCPG" | "CPSD";
  numericDate: string; // e.g. 07-11-2026
  alphaDate: string; // e.g. 07Nov2026
  totalQueries: number;
  previewImageUrl?: string | null;
  onDownloadExcel?: () => void;
  onDownloadImage?: () => void;
  className?: string;
}

export function WhatsAppChatBubbleSimulator({
  reportMode,
  numericDate,
  alphaDate,
  totalQueries,
  previewImageUrl,
  onDownloadExcel,
  onDownloadImage,
  className,
}: WhatsAppChatBubbleSimulatorProps) {
  const [copiedCaption, setCopiedCaption] = React.useState(false);

  const captionText = `Please find the today's summary of queries which are raised in whatsapp also find the attached Excel for ${reportMode} (${numericDate})`;
  const excelFileName = `${reportMode} Report ${alphaDate}.xlsx`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(captionText);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
    toast.success("WhatsApp sharing message copied to clipboard!");
  };

  const handleOpenWhatsAppWeb = () => {
    const encoded = encodeURIComponent(captionText);
    window.open(`https://web.whatsapp.com/send?text=${encoded}`, "_blank");
    toast.success("Opening WhatsApp Web with pre-filled message!");
  };

  const currentTime = React.useMemo(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  return (
    <div
      className={cn(
        "rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-950/[0.1] p-5 backdrop-blur-xl shadow-xs space-y-4",
        className
      )}
    >
      {/* ── Simulator Header Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-2xl bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0 border border-[#25D366]/30 shadow-xs">
            <MessageSquare className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                WhatsApp Dispatch Simulator & Live Preview
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#25D366]/15 text-emerald-700 dark:text-emerald-300 border border-[#25D366]/30 uppercase">
                {reportMode} Group
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Pixel-perfect preview of how the daily query summary appears when shared in WhatsApp groups.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleCopyCaption}
            className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-xs transition-all active:scale-95"
          >
            {copiedCaption ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedCaption ? "Copied!" : "Copy Caption"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenWhatsAppWeb}
            className="h-8 px-3 rounded-xl border-emerald-500/30 bg-white/70 dark:bg-black/30 hover:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold text-xs gap-1.5 shadow-2xs transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Open in WhatsApp</span>
          </Button>
        </div>
      </div>

      {/* ── WhatsApp Phone / Chat Mockup Window ───────────────────────────────── */}
      <div className="max-w-xl mx-auto rounded-2xl overflow-hidden border border-slate-300 dark:border-white/10 shadow-lg bg-[#efeae2] dark:bg-[#0b141a]">
        {/* Chat Header */}
        <div className="bg-[#008069] dark:bg-[#202c33] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
              {reportMode}
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">
                Blue Star {reportMode} Support & Operations
              </p>
              <p className="text-[10px] text-emerald-100/80 leading-tight">
                {totalQueries} queries tracked today
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/20 text-white/90">
            {numericDate}
          </span>
        </div>

        {/* Chat Body (Message Bubble Area) */}
        <div className="p-4 sm:p-5 flex flex-col items-end space-y-2">
          {/* Outgoing Message Bubble */}
          <div className="max-w-[92%] sm:max-w-[85%] rounded-2xl rounded-tr-xs bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] p-2.5 shadow-md space-y-2 text-xs relative">
            {/* 1. Attachment Chip: Excel Spreadsheet */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/80 dark:bg-black/30 border border-emerald-600/20 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileSpreadsheet className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[11px] truncate text-slate-900 dark:text-white" title={excelFileName}>
                    {excelFileName}
                  </p>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400">
                    Excel Workbook · Verified Formulas
                  </p>
                </div>
              </div>

              {onDownloadExcel && (
                <button
                  type="button"
                  onClick={onDownloadExcel}
                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 transition-colors"
                  title="Download Excel Spreadsheet"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* 2. Optional Table PNG Thumbnail */}
            {previewImageUrl && (
              <div className="rounded-xl overflow-hidden border border-emerald-600/20 bg-white/40 dark:bg-black/20 relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImageUrl}
                  alt="Daily Report Summary Table"
                  className="w-full h-auto object-cover max-h-48"
                />
                {onDownloadImage && (
                  <button
                    type="button"
                    onClick={onDownloadImage}
                    className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 hover:bg-black/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-md transition-all"
                  >
                    <Download className="h-3 w-3" />
                    <span>Save PNG</span>
                  </button>
                )}
              </div>
            )}

            {/* 3. Message Caption Text */}
            <p className="text-[12px] font-medium leading-relaxed px-1 select-all break-words">
              {captionText}
            </p>

            {/* 4. Timestamp & Double Blue Checkmarks */}
            <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 dark:text-emerald-200/70 pt-0.5">
              <span>{currentTime}</span>
              <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
