"use client";

import * as React from "react";
import {
  SALESFORCE_OBJECT_GRAPH,
  buildSOQLFromSchemaSelection,
  SchemaObject,
} from "@/lib/soql-schema-graph";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Network,
  Check,
  ChevronRight,
  Database,
  Copy,
  Sparkles,
  Layers,
  ArrowRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SOQLRelationshipGraphProps {
  onInsertQuery?: (query: string) => void;
  className?: string;
  defaultBaseObject?: string;
}

export function SOQLRelationshipGraph({
  onInsertQuery,
  className,
  defaultBaseObject = "Case",
}: SOQLRelationshipGraphProps) {
  const [baseObject, setBaseObject] = React.useState<string>(defaultBaseObject);
  const [selectedFields, setSelectedFields] = React.useState<{ [objName: string]: string[] }>({
    Case: ["Id", "CaseNumber", "Status", "Subject"],
    Contact: ["Name", "Phone"],
    Asset: ["SerialNumber"],
  });
  const [whereClause, setWhereClause] = React.useState<string>("Status = 'Open'");
  const [copied, setCopied] = React.useState(false);

  // Available related objects for current base object
  const currentBaseSchema: SchemaObject =
    SALESFORCE_OBJECT_GRAPH[baseObject] || SALESFORCE_OBJECT_GRAPH["Case"]!;

  const handleToggleField = (objName: string, fieldName: string) => {
    setSelectedFields((prev) => {
      const current = prev[objName] || [];
      const exists = current.includes(fieldName);
      const next = exists
        ? current.filter((f) => f !== fieldName)
        : [...current, fieldName];
      return { ...prev, [objName]: next };
    });
  };

  // Build query
  const generatedQuery = React.useMemo(() => {
    return buildSOQLFromSchemaSelection(baseObject, selectedFields, whereClause);
  }, [baseObject, selectedFields, whereClause]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied generated SOQL query to clipboard!");
  };

  const handleInsert = () => {
    if (onInsertQuery) {
      onInsertQuery(generatedQuery);
      toast.success("Transferred query to editor!");
    } else {
      handleCopy();
    }
  };

  const totalSelectedCount = Object.values(selectedFields).reduce(
    (acc, list) => acc + list.length,
    0
  );

  return (
    <div
      className={cn(
        "rounded-3xl border border-border/80 bg-card/60 dark:bg-[#07090e]/80 p-5 backdrop-blur-xl shadow-xs space-y-4",
        className
      )}
    >
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Network className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                Visual Schema Relationship Graph & Object Linker
              </h3>
              <Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30 text-[10px] font-extrabold px-2 py-0">
                {totalSelectedCount} fields linked
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Select objects and check fields. SOQL dot-notation joins (e.g. Case.Contact.Name) are generated in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleInsert}
            className="h-8 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs gap-1.5 shadow-xs transition-all active:scale-95"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{onInsertQuery ? "Insert Into Query" : copied ? "Copied!" : "Copy Query"}</span>
          </Button>
        </div>
      </div>

      {/* ── Object Selector Pills ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground shrink-0">
          Base Object:
        </span>
        {Object.keys(SALESFORCE_OBJECT_GRAPH).map((objKey) => {
          const isSelected = baseObject === objKey;
          return (
            <button
              key={objKey}
              type="button"
              onClick={() => {
                setBaseObject(objKey);
                // Pre-populate with default ID
                if (!selectedFields[objKey] || selectedFields[objKey].length === 0) {
                  setSelectedFields((prev) => ({ ...prev, [objKey]: ["Id"] }));
                }
              }}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer flex items-center gap-1.5",
                isSelected
                  ? "bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/40 shadow-xs"
                  : "bg-background/80 hover:bg-card border-border/80 text-foreground"
              )}
            >
              <Database className="h-3 w-3 text-sky-500" />
              <span>{objKey}</span>
            </button>
          );
        })}
      </div>

      {/* ── Interactive Relationship Cards Grid ─────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Base Object Card */}
        <div className="rounded-2xl border-2 border-sky-500/40 bg-sky-500/[0.04] p-3.5 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500 shadow-xs" />
              <span className="font-mono text-xs font-black text-sky-700 dark:text-sky-300">
                {currentBaseSchema.name} (Root Table)
              </span>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">
              {selectedFields[baseObject]?.length || 0} selected
            </span>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar pr-1">
            {currentBaseSchema.fields.map((f) => {
              const isChecked = selectedFields[baseObject]?.includes(f.name) || false;
              return (
                <label
                  key={f.name}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-sky-500/10 cursor-pointer transition-colors text-xs"
                >
                  <span className="flex items-center gap-2 truncate">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleField(baseObject, f.name)}
                      className="rounded-sm border-border text-sky-600 focus:ring-sky-500/30"
                    />
                    <span className="font-mono text-[11px] font-bold text-foreground truncate">
                      {f.name}
                    </span>
                  </span>
                  <span className="text-[9.5px] text-muted-foreground uppercase">{f.type}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Related Joined Objects */}
        {currentBaseSchema.relationships.map((rel) => {
          const targetSchema = SALESFORCE_OBJECT_GRAPH[rel.targetObject];
          if (!targetSchema) return null;

          const relFields = selectedFields[rel.name] || [];
          const isJoined = relFields.length > 0;

          return (
            <div
              key={rel.name}
              className={cn(
                "rounded-2xl border p-3.5 space-y-2.5 transition-all shadow-2xs",
                isJoined
                  ? "border-indigo-500/40 bg-indigo-500/[0.04]"
                  : "border-border/70 bg-background/60"
              )}
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <div className="flex items-center gap-1.5 truncate">
                  <ArrowRight className="h-3 w-3 text-indigo-500 shrink-0" />
                  <span className="font-mono text-xs font-black text-foreground truncate">
                    {rel.name}
                  </span>
                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold uppercase">
                    {rel.relationshipType}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">
                  {relFields.length} selected
                </span>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar pr-1">
                {targetSchema.fields.map((f) => {
                  const isChecked = relFields.includes(f.name);
                  return (
                    <label
                      key={f.name}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-indigo-500/10 cursor-pointer transition-colors text-xs"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleField(rel.name, f.name)}
                          className="rounded-sm border-border text-indigo-600 focus:ring-indigo-500/30"
                        />
                        <span className="font-mono text-[11px] font-bold text-foreground truncate">
                          {rel.name}.{f.name}
                        </span>
                      </span>
                      <span className="text-[9.5px] text-muted-foreground uppercase">{f.type}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Generated SOQL Query Box ────────────────────────────────────────────── */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-sky-500" />
            Assembled SOQL Query:
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {totalSelectedCount} fields in SELECT clause
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#06070a] border border-border/80 font-mono text-xs text-sky-300 dark:text-sky-200 leading-relaxed overflow-x-auto max-h-36 no-scrollbar select-all">
          <pre>{generatedQuery}</pre>
        </div>
      </div>
    </div>
  );
}
