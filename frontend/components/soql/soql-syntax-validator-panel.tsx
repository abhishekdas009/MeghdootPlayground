"use client";

import * as React from "react";
import { validateSOQL, autoFixSOQL, SOQLValidationReport } from "@/lib/soql-validator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, AlertCircle, Wrench, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WorkbenchBridgeButton } from "./workbench-bridge-button";

interface SOQLSyntaxValidatorPanelProps {
  query: string;
  onApplyFix?: (fixedQuery: string) => void;
  className?: string;
  showWorkbench?: boolean;
}

export function SOQLSyntaxValidatorPanel({
  query,
  onApplyFix,
  className,
  showWorkbench = false,
}: SOQLSyntaxValidatorPanelProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  const report: SOQLValidationReport = React.useMemo(() => {
    return validateSOQL(query);
  }, [query]);

  const handleAutoFix = () => {
    const { fixedQuery, changesApplied } = autoFixSOQL(query);
    if (changesApplied.length === 0) {
      toast.info("No automatic fixes needed.");
      return;
    }
    if (onApplyFix) {
      onApplyFix(fixedQuery);
      toast.success(`Applied ${changesApplied.length} automatic fixes:`, {
        description: changesApplied.join(" · "),
      });
    }
  };

  if (!query || !query.trim()) {
    return null;
  }

  const hasErrors = report.errors.length > 0;
  const hasWarnings = report.warnings.length > 0;

  return (
    <div
      className={cn(
        "rounded-2xl border p-3.5 backdrop-blur-md transition-all shadow-xs space-y-2.5",
        hasErrors
          ? "border-rose-500/40 bg-rose-500/[0.06] dark:bg-rose-950/20"
          : hasWarnings
          ? "border-amber-500/40 bg-amber-500/[0.06] dark:bg-amber-950/20"
          : "border-emerald-500/30 bg-emerald-500/[0.04] dark:bg-emerald-950/15",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {hasErrors ? (
            <div className="h-7 w-7 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="h-4 w-4" />
            </div>
          ) : hasWarnings ? (
            <div className="h-7 w-7 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
          ) : (
            <div className="h-7 w-7 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-tight text-foreground">
                {hasErrors
                  ? "SOQL Syntax Errors Detected"
                  : hasWarnings
                  ? "SOQL Syntax Warnings"
                  : "SOQL Syntax Valid"}
              </span>

              {hasErrors ? (
                <Badge className="bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[10px] font-bold px-2 py-0 animate-pulse">
                  {report.errors.length} error{report.errors.length === 1 ? "" : "s"}
                </Badge>
              ) : hasWarnings ? (
                <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold px-2 py-0">
                  {report.warnings.length} warning{report.warnings.length === 1 ? "" : "s"}
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold px-2 py-0">
                  Ready to Execute
                </Badge>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground mt-0.5">
              {hasErrors
                ? "This query contains syntax issues that will fail execution in Salesforce."
                : hasWarnings
                ? "Query will parse, but check recommended best practices below."
                : "Valid Salesforce Object Query Language structure."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {hasErrors && onApplyFix && (
            <Button
              type="button"
              size="sm"
              onClick={handleAutoFix}
              className="h-7 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs gap-1 shadow-xs"
            >
              <Wrench className="h-3 w-3" />
              <span>Auto-Fix Syntax</span>
            </Button>
          )}

          {showWorkbench && <WorkbenchBridgeButton query={query} />}

          {(hasErrors || hasWarnings) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="h-7 px-2 text-xs font-bold text-muted-foreground hover:text-foreground gap-1"
            >
              <span>{showDetails ? "Hide Details" : "View Details"}</span>
              {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          )}
        </div>
      </div>

      {/* ── Diagnostic Error Details ────────────────────────────────────────────── */}
      {showDetails && (hasErrors || hasWarnings) && (
        <div className="pt-2 border-t border-border/60 space-y-1.5">
          {report.errors.map((err, i) => (
            <div
              key={`err-${i}`}
              className="flex items-start gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-medium text-rose-950 dark:text-rose-200"
            >
              <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <span>{err.message}</span>
                {err.suggestion && (
                  <span className="block text-[10.5px] text-rose-700 dark:text-rose-300 font-mono mt-0.5">
                    💡 Suggestion: {err.suggestion}
                  </span>
                )}
              </div>
            </div>
          ))}

          {report.warnings.map((warn, i) => (
            <div
              key={`warn-${i}`}
              className="flex items-start gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-medium text-amber-950 dark:text-amber-200"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <span>{warn.message}</span>
                {warn.suggestion && (
                  <span className="block text-[10.5px] text-amber-700 dark:text-amber-300 font-mono mt-0.5">
                    💡 Suggestion: {warn.suggestion}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
