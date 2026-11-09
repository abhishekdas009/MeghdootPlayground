"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check, Terminal, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WorkbenchBridgeButtonProps {
  query: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function WorkbenchBridgeButton({
  query,
  className,
  size = "sm",
}: WorkbenchBridgeButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const getCleanQuery = () => {
    return query.trim();
  };

  const getWorkbenchUrl = () => {
    const clean = getCleanQuery();
    return `https://workbench.developerforce.com/query.php?query=${encodeURIComponent(clean)}`;
  };

  const handleOpenWorkbench = () => {
    const clean = getCleanQuery();
    if (!clean) {
      toast.error("Query is empty");
      return;
    }
    const url = getWorkbenchUrl();
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Opening Salesforce Workbench with query pre-loaded!", {
      description: "Workbench query session launched in a new tab.",
    });
  };

  const handleCopyWorkbenchLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const clean = getCleanQuery();
    if (!clean) {
      toast.error("Query is empty");
      return;
    }
    const url = getWorkbenchUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Workbench deeplink copied to clipboard!");
  };

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={handleOpenWorkbench}
        disabled={!query || !query.trim()}
        title="Open in Salesforce Workbench with pre-loaded query"
        className="h-8 px-3 rounded-xl border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold text-xs gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
      >
        <Terminal className="h-3.5 w-3.5 text-sky-500" />
        <span>Open in Workbench</span>
        <ExternalLink className="h-3 w-3 opacity-70 ml-0.5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleCopyWorkbenchLink}
        disabled={!query || !query.trim()}
        title="Copy Workbench URL"
        className="h-8 w-8 rounded-xl text-sky-700 dark:text-sky-300 hover:bg-sky-500/10 transition-colors"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
