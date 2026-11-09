"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Copy, Sparkles, Check, Play, SlidersHorizontal, Hash, Calendar, Layers } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { WorkbenchBridgeButton } from "./workbench-bridge-button";

interface SOQLVariableFormProps {
  templateQuery: string;
  onExecutableQueryChange?: (executableQuery: string) => void;
  className?: string;
}

export function extractSOQLVariables(query: string): string[] {
  const matches = query.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g);
  if (!matches) return [];
  const uniqueVars = new Set<string>();
  for (const m of matches) {
    const varName = m.replace(/^\{\{|\}\}$/g, "").trim();
    if (varName) uniqueVars.add(varName);
  }
  return Array.from(uniqueVars);
}

export function SOQLVariableForm({
  templateQuery,
  onExecutableQueryChange,
  className,
}: SOQLVariableFormProps) {
  const [variableValues, setVariableValues] = React.useState<{ [key: string]: string }>({});
  const [copied, setCopied] = React.useState(false);

  // Extract variables
  const variables = React.useMemo(() => {
    return extractSOQLVariables(templateQuery);
  }, [templateQuery]);

  // Generate executed query with variables replaced
  const executableQuery = React.useMemo(() => {
    let result = templateQuery;
    for (const v of variables) {
      const val = variableValues[v] || "";
      if (v.toLowerCase().includes("ticket") || v.toLowerCase().includes("case")) {
        // Format tickets as single-quoted lines for IN (...) clause
        const tokens = val
          .split(/[\n\r,\t;]+/)
          .map((t) => t.replace(/['"\s\u00A0]+/g, ""))
          .filter(Boolean);

        const formatted =
          tokens.length > 0
            ? tokens.map((t) => `'${t}'`).join(",\n  ")
            : "/* paste ticket numbers here */";

        result = result.replace(new RegExp(`\\{\\{${v}\\}\\}`, "g"), formatted);
      } else {
        result = result.replace(
          new RegExp(`\\{\\{${v}\\}\\}`, "g"),
          val || `/* ${v} */`
        );
      }
    }
    return result;
  }, [templateQuery, variables, variableValues]);

  React.useEffect(() => {
    if (onExecutableQueryChange) {
      onExecutableQueryChange(executableQuery);
    }
  }, [executableQuery, onExecutableQueryChange]);

  const handleCopy = () => {
    navigator.clipboard.writeText(executableQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied executable SOQL query to clipboard!");
  };

  if (variables.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-3xl border border-sky-500/30 bg-gradient-to-b from-sky-500/[0.06] via-card/80 to-card/90 p-5 backdrop-blur-xl shadow-xs space-y-4",
        className
      )}
    >
      {/* ── Top Header Bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                Form-Driven Query Execution
              </h3>
              <Badge className="bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30 text-[10px] font-extrabold px-2 py-0">
                {variables.length} variable{variables.length === 1 ? "" : "s"} detected
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Fill in the parameters below. The executable SOQL query is assembled automatically.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <WorkbenchBridgeButton query={executableQuery} />
          <Button
            type="button"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs gap-1.5 shadow-xs transition-all active:scale-95"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied!" : "Copy Executable SOQL"}</span>
          </Button>
        </div>
      </div>

      {/* ── Variable Input Pills ────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        {variables.map((varName) => {
          const isTicketVar =
            varName.toLowerCase().includes("ticket") || varName.toLowerCase().includes("case");
          const isDateVar =
            varName.toLowerCase().includes("date") || varName.toLowerCase().includes("time");
          const isStatusVar = varName.toLowerCase().includes("status");

          const value = variableValues[varName] || "";

          return (
            <div
              key={varName}
              className={cn(
                "p-3.5 rounded-2xl border border-border/80 bg-background/80 dark:bg-[#08090d]/80 space-y-2",
                isTicketVar && "sm:col-span-2"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                    {"{{"}
                    {varName}
                    {"}}"}
                  </span>
                </div>
                {isTicketVar && (
                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0">
                    {
                      value
                        .split(/[\n\r,\t;]+/)
                        .filter(Boolean).length
                    }{" "}
                    tickets entered
                  </Badge>
                )}
              </div>

              {isTicketVar ? (
                <Textarea
                  placeholder={`Paste ticket numbers here (one per line or comma-separated)...\n2713009\n27127281`}
                  value={value}
                  onChange={(e) =>
                    setVariableValues((prev) => ({ ...prev, [varName]: e.target.value }))
                  }
                  className="font-mono text-xs min-h-[90px] rounded-xl border-border/80 bg-card/60 p-3 leading-relaxed"
                />
              ) : isStatusVar ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Open", "New", "In Progress", "Cancellation Requested", "Closed"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setVariableValues((prev) => ({ ...prev, [varName]: `'${s}'` }))
                      }
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                        value === `'${s}'`
                          ? "bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/40"
                          : "bg-background/80 hover:bg-card border-border/80 text-foreground"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : isDateVar ? (
                <Input
                  type="date"
                  value={value}
                  onChange={(e) =>
                    setVariableValues((prev) => ({ ...prev, [varName]: e.target.value }))
                  }
                  className="h-8 text-xs font-semibold rounded-xl"
                />
              ) : (
                <Input
                  placeholder={`Enter value for ${varName}...`}
                  value={value}
                  onChange={(e) =>
                    setVariableValues((prev) => ({ ...prev, [varName]: e.target.value }))
                  }
                  className="h-8 text-xs font-semibold rounded-xl"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Live Executable Output Preview ──────────────────────────────────────── */}
      <div className="space-y-1.5 pt-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-sky-500" />
          Live Executable Query Output Preview:
        </span>
        <div className="p-3.5 rounded-2xl bg-[#06070a] border border-border/80 font-mono text-xs text-sky-300 dark:text-sky-200 leading-relaxed overflow-x-auto max-h-40 no-scrollbar select-all">
          <pre>{executableQuery}</pre>
        </div>
      </div>
    </div>
  );
}
