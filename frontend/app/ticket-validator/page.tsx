"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassHero, GlassSpotlightCard, AnimatedNumber } from "@/components/ui/glass-primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EASE_120HZ } from "@/lib/motion";
import {
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Copy,
  Sparkles,
  ArrowRightLeft,
  ShieldCheck,
  Percent,
  ClipboardPaste,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  analyzeTickets,
  ValidationRuleId,
  VALIDATION_RULES,
} from "@/lib/ticket-engine";
import { QuickExporterBar } from "@/components/tickets/quick-exporter-bar";
import { DeduplicationInspector } from "@/components/tickets/deduplication-inspector";
import { InvalidTokensInspector } from "@/components/tickets/invalid-tokens-inspector";
import { TicketStatsPills } from "@/components/tickets/ticket-stats-pills";

export default function TicketValidatorPage() {
  const [masterInput, setMasterInput] = React.useState("");
  const [compareInput, setCompareInput] = React.useState("");
  const [selectedRule, setSelectedRule] = React.useState<ValidationRuleId>("sf-digits");
  const [deduplicateMaster, setDeduplicateMaster] = React.useState(true);
  const [deduplicateCompare, setDeduplicateCompare] = React.useState(true);
  const [swapRotation, setSwapRotation] = React.useState(0);

  // Analyze Master Block in real time
  const masterAnalysis = React.useMemo(() => {
    return analyzeTickets(masterInput, selectedRule, deduplicateMaster);
  }, [masterInput, selectedRule, deduplicateMaster]);

  // Analyze Check Block in real time
  const compareAnalysis = React.useMemo(() => {
    return analyzeTickets(compareInput, selectedRule, deduplicateCompare);
  }, [compareInput, selectedRule, deduplicateCompare]);

  const masterTickets = deduplicateMaster
    ? masterAnalysis.uniqueTickets
    : masterAnalysis.rawTokens;

  const compareTickets = deduplicateCompare
    ? compareAnalysis.uniqueTickets
    : compareAnalysis.rawTokens;

  // Validation / Diff Result
  const validationResult = React.useMemo(() => {
    if (masterTickets.length === 0 || compareTickets.length === 0) {
      return {
        status: "idle" as const,
        missing: [] as string[],
        matching: [] as string[],
        matchPercentage: 0,
      };
    }

    const masterSet = new Set(masterTickets);
    const missing = compareTickets.filter((ticket) => !masterSet.has(ticket));
    const matching = compareTickets.filter((ticket) => masterSet.has(ticket));
    const matchPercentage =
      compareTickets.length > 0
        ? Math.round((matching.length / compareTickets.length) * 100)
        : 0;

    if (missing.length === 0) {
      return { status: "success" as const, missing, matching, matchPercentage };
    }
    return { status: "mismatch" as const, missing, matching, matchPercentage };
  }, [masterTickets, compareTickets]);

  const handleCopyMissing = () => {
    if (validationResult.missing.length > 0) {
      navigator.clipboard.writeText(validationResult.missing.join("\n"));
      toast.success(`Copied ${validationResult.missing.length} missing ticket(s) to clipboard!`);
    }
  };

  const handleCopyMatching = () => {
    if (validationResult.matching.length > 0) {
      navigator.clipboard.writeText(validationResult.matching.join("\n"));
      toast.success(`Copied ${validationResult.matching.length} matching ticket(s) to clipboard!`);
    }
  };

  const handleClearAll = () => {
    setMasterInput("");
    setCompareInput("");
    toast.info("Cleared all inputs");
  };

  const handleStripMasterInvalid = () => {
    setMasterInput(masterAnalysis.validTickets.join("\n"));
    toast.success(`Removed ${masterAnalysis.invalidTokens.length} invalid token(s) from Block 1`);
  };

  const handleStripCompareInvalid = () => {
    setCompareInput(compareAnalysis.validTickets.join("\n"));
    toast.success(`Removed ${compareAnalysis.invalidTokens.length} invalid token(s) from Block 2`);
  };

  const handleSwapBlocks = () => {
    setSwapRotation((r) => r + 180);
    setMasterInput(compareInput);
    setCompareInput(masterInput);
    toast.info("Swapped Block 1 and Block 2 contents");
  };

  const handlePaste = async (setter: React.Dispatch<React.SetStateAction<string>>, label: string) => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.info("Clipboard is empty");
        return;
      }
      setter(text);
      toast.success(`Pasted clipboard contents into ${label}`);
    } catch {
      toast.error("Unable to access clipboard automatically — use Ctrl+V");
    }
  };

  const handleLoadSample = () => {
    setMasterInput("2713009\n27127281\n27128910\n27134412\n27135501");
    setCompareInput("2713009\n27127281\n27199999\n27188888");
    toast.info("Loaded sample batch comparison");
  };

  const ruleObj = VALIDATION_RULES[selectedRule] || VALIDATION_RULES["sf-digits"];

  return (
    <div className="workspace-page mx-auto min-h-screen w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <GlassHero
        icon={ShieldCheck}
        badge="Real-Time Cross-Check Engine"
        title="Ticket Validator &"
        highlight="Cross-Checker"
        description="Compare WorkOrder batches in real time, auto-detect duplicates, isolate missing records, and export pristine lists."
        watermark="VALIDATE"
        actions={
          <>
            <div className="glass-surface flex items-center gap-2 rounded-xl px-3 py-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Rule:
              </span>
              <select
                value={selectedRule}
                onChange={(e) => setSelectedRule(e.target.value as ValidationRuleId)}
                className="cursor-pointer bg-transparent text-xs font-bold text-foreground focus:outline-none"
              >
                {Object.values(VALIDATION_RULES).map((r) => (
                  <option key={r.id} value={r.id} className="bg-white dark:bg-[#0b0c10] text-foreground">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadSample}
              className="h-9 gap-1.5 rounded-xl border-blue-500/30 bg-blue-500/10 text-blue-700 dark:border-sky-400/30 dark:bg-sky-400/15 dark:text-sky-200 hover:bg-blue-500/20 text-xs font-bold"
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sample</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSwapBlocks}
              disabled={!masterInput && !compareInput}
              title="Swap Block 1 and Block 2"
              className="h-9 gap-1.5 rounded-xl border-border/70 bg-white/60 dark:bg-white/[0.05] backdrop-blur-md hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-sky-300 text-xs font-bold"
            >
              <motion.div animate={{ rotate: swapRotation }} transition={{ duration: 0.35, ease: EASE_120HZ }}>
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </motion.div>
              <span className="hidden sm:inline">Swap</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={!masterInput && !compareInput}
              className="h-9 gap-1.5 rounded-xl border-border/70 bg-white/60 dark:bg-white/[0.05] backdrop-blur-md hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 text-xs font-bold"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </Button>
          </>
        }
      />

      {/* ─── Main Content Grid ─────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Input Blocks */}
        <div className="flex flex-col gap-6">
          {/* Block 1: Master Tickets */}
          <GlassSpotlightCard delay={0.05}>
            <CardHeader className="px-6 py-4 flex flex-col gap-3 border-b border-border/50 dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.02] backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)] shrink-0" />
                  <CardTitle className="text-sm font-black tracking-tight text-foreground">
                    Block 1: Master List (Total Tickets)
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5 text-blue-700 dark:text-sky-300 border-blue-500/30 bg-blue-500/10 whitespace-nowrap">
                    {masterTickets.length} unique
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePaste(setMasterInput, "Block 1")}
                    className="h-7 px-2 text-xs font-bold text-muted-foreground hover:text-blue-600 dark:hover:text-sky-300 rounded-lg gap-1"
                    title="Paste from Clipboard"
                  >
                    <ClipboardPaste className="h-3.5 w-3.5" />
                  </Button>
                  {masterInput && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMasterInput("")}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500 rounded-lg"
                      title="Clear Block 1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <TicketStatsPills
                totalRaw={masterAnalysis.totalRawCount}
                validCount={masterAnalysis.validTickets.length}
                invalidCount={masterAnalysis.invalidTokens.length}
                duplicateCount={masterAnalysis.duplicateCount}
                selectedRule={selectedRule}
              />
            </CardHeader>

            <CardContent className="p-5 flex-1 flex flex-col gap-3">
              <InvalidTokensInspector
                invalidTokens={masterAnalysis.invalidTokens}
                ruleBadge={ruleObj.badge}
                onStripInvalid={handleStripMasterInvalid}
              />

              <DeduplicationInspector
                duplicateCount={masterAnalysis.duplicateCount}
                duplicateItems={masterAnalysis.duplicateItems}
                deduplicateEnabled={deduplicateMaster}
                onToggleDeduplicate={setDeduplicateMaster}
              />

              <div className="glass-inset-well relative flex-1 flex flex-col min-h-[220px] rounded-2xl overflow-hidden">
                <Textarea
                  placeholder={`Paste master ticket list here...\n\n2713009\n27127281\n27128910`}
                  className="flex-1 min-h-[220px] font-mono text-sm leading-relaxed rounded-2xl border-none bg-transparent text-foreground p-4 focus-visible:ring-0 focus-visible:outline-none resize-none no-scrollbar placeholder:text-muted-foreground"
                  value={masterInput}
                  onChange={(e) => setMasterInput(e.target.value)}
                />
              </div>
            </CardContent>
          </GlassSpotlightCard>

          {/* Block 2: Compare Tickets */}
          <GlassSpotlightCard delay={0.1}>
            <CardHeader className="px-6 py-4 flex flex-col gap-3 border-b border-border/50 dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.02] backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)] shrink-0" />
                  <CardTitle className="text-sm font-black tracking-tight text-foreground">
                    Block 2: Tickets to Check
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5 text-sky-700 dark:text-sky-300 border-sky-500/30 bg-sky-500/10 whitespace-nowrap">
                    {compareTickets.length} unique
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePaste(setCompareInput, "Block 2")}
                    className="h-7 px-2 text-xs font-bold text-muted-foreground hover:text-blue-600 dark:hover:text-sky-300 rounded-lg gap-1"
                    title="Paste from Clipboard"
                  >
                    <ClipboardPaste className="h-3.5 w-3.5" />
                  </Button>
                  {compareInput && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCompareInput("")}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500 rounded-lg"
                      title="Clear Block 2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <TicketStatsPills
                totalRaw={compareAnalysis.totalRawCount}
                validCount={compareAnalysis.validTickets.length}
                invalidCount={compareAnalysis.invalidTokens.length}
                duplicateCount={compareAnalysis.duplicateCount}
                selectedRule={selectedRule}
              />
            </CardHeader>

            <CardContent className="p-5 flex-1 flex flex-col gap-3">
              <InvalidTokensInspector
                invalidTokens={compareAnalysis.invalidTokens}
                ruleBadge={ruleObj.badge}
                onStripInvalid={handleStripCompareInvalid}
              />

              <DeduplicationInspector
                duplicateCount={compareAnalysis.duplicateCount}
                duplicateItems={compareAnalysis.duplicateItems}
                deduplicateEnabled={deduplicateCompare}
                onToggleDeduplicate={setDeduplicateCompare}
              />

              <div className="glass-inset-well relative flex-1 flex flex-col min-h-[220px] rounded-2xl overflow-hidden">
                <Textarea
                  placeholder={`Paste tickets to verify against Block 1...\n\n2713009\n27127281`}
                  className="flex-1 min-h-[220px] font-mono text-sm leading-relaxed rounded-2xl border-none bg-transparent text-foreground p-4 focus-visible:ring-0 focus-visible:outline-none resize-none no-scrollbar placeholder:text-muted-foreground"
                  value={compareInput}
                  onChange={(e) => setCompareInput(e.target.value)}
                />
              </div>
            </CardContent>
          </GlassSpotlightCard>
        </div>

        {/* Right Column: Result Cards */}
        <div className="flex flex-col gap-6 h-full">
          {/* Summary Dashboard Card */}
          <GlassSpotlightCard delay={0.12}>
            <CardHeader className="px-6 py-4 flex flex-row flex-wrap items-center justify-between gap-2.5 border-b border-border/50 dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.02] backdrop-blur-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-sky-400 shrink-0" />
                <CardTitle className="text-sm font-black tracking-tight text-foreground">
                  Verification Summary
                </CardTitle>
              </div>

              <AnimatePresence>
                {validationResult.status !== "idle" && (
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs font-black text-blue-700 dark:text-sky-300"
                  >
                    <Percent className="h-3.5 w-3.5" />
                    <span>{validationResult.matchPercentage}% Match</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-surface flex flex-col gap-1 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Master (B1)</span>
                  <span className="text-2xl font-black text-foreground">
                    <AnimatedNumber value={masterTickets.length} />
                  </span>
                </div>
                <div className="glass-surface flex flex-col gap-1 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">To Check (B2)</span>
                  <span className="text-2xl font-black text-foreground">
                    <AnimatedNumber value={compareTickets.length} />
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-blue-500/12 border border-blue-500/30 backdrop-blur-md">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-sky-300 uppercase tracking-wider">Matching</span>
                  <span className="text-2xl font-black text-blue-800 dark:text-sky-200">
                    <AnimatedNumber value={validationResult.matching.length} />
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-slate-500/10 dark:bg-white/[0.05] border border-slate-300/60 dark:border-white/15 backdrop-blur-md">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Missing</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    <AnimatedNumber value={validationResult.missing.length} />
                  </span>
                </div>
              </div>

              {validationResult.status !== "idle" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                    <span>Cross-Check Match Rate</span>
                    <span className="text-foreground">
                      {validationResult.matching.length} of {compareTickets.length} tickets matched
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200/70 dark:bg-white/10 rounded-full overflow-hidden flex p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${validationResult.matchPercentage}%` }}
                      transition={{ duration: 0.45, ease: EASE_120HZ }}
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </GlassSpotlightCard>

          {/* Missing Tickets Card */}
          <GlassSpotlightCard
            delay={0.16}
            className={cn(
              validationResult.status === "mismatch" && "ring-1 ring-blue-400/40"
            )}
          >
            <CardHeader className="px-6 py-4 flex flex-row flex-wrap items-center justify-between gap-2.5 border-b border-border/50 dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.02] backdrop-blur-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <AlertTriangle
                  className={cn(
                    "h-5 w-5 shrink-0",
                    validationResult.status === "mismatch" ? "text-rose-500" : "text-muted-foreground"
                  )}
                />
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <CardTitle className="text-sm font-black tracking-tight text-foreground">
                    Missing Tickets (In B2, Not in B1)
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 shrink-0",
                      validationResult.missing.length > 0
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30"
                        : "text-muted-foreground border-border/80"
                    )}
                  >
                    {validationResult.missing.length}
                  </Badge>
                </div>
              </div>

              {validationResult.status === "mismatch" && (
                <Button
                  onClick={handleCopyMissing}
                  size="sm"
                  className="h-8 px-3 rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 hover:brightness-110 text-white font-bold shadow-xs text-xs gap-1.5 transition-all whitespace-nowrap shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Missing</span>
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-5 flex-1 flex flex-col gap-3">
              {validationResult.missing.length > 0 && (
                <QuickExporterBar
                  tickets={validationResult.missing}
                  title="Quick Export Missing Tickets"
                />
              )}

              <div className="glass-inset-well p-1 rounded-2xl flex-1 flex flex-col min-h-[140px]">
                {validationResult.status === "idle" ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs font-medium p-4">
                    Paste tickets into Block 1 &amp; 2 to run instant validation...
                  </div>
                ) : validationResult.status === "success" ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-blue-700 dark:text-sky-300 text-xs font-bold p-4 gap-1.5">
                    <CheckCircle2 className="h-6 w-6 text-sky-500" />
                    <span>All tickets in Block 2 exist in Block 1! Perfect match.</span>
                  </div>
                ) : (
                  <Textarea
                    readOnly
                    value={validationResult.missing.join("\n")}
                    className="w-full h-full flex-1 font-mono text-sm leading-relaxed rounded-xl border-none bg-transparent text-rose-600 dark:text-rose-400 p-4 focus-visible:ring-0 focus-visible:outline-none resize-none no-scrollbar font-bold"
                  />
                )}
              </div>
            </CardContent>
          </GlassSpotlightCard>

          {/* Matching Tickets Card */}
          <GlassSpotlightCard delay={0.2}>
            <CardHeader className="px-6 py-4 flex flex-row flex-wrap items-center justify-between gap-2.5 border-b border-border/50 dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.02] backdrop-blur-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2
                  className={cn(
                    "h-5 w-5 shrink-0",
                    validationResult.matching.length > 0 ? "text-blue-600 dark:text-sky-400" : "text-muted-foreground"
                  )}
                />
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <CardTitle className="text-sm font-black tracking-tight text-foreground">
                    Matching Tickets (Present in Both)
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 shrink-0",
                      validationResult.matching.length > 0
                        ? "bg-blue-500/10 text-blue-700 dark:text-sky-300 border-blue-500/30"
                        : "text-muted-foreground border-border/80"
                    )}
                  >
                    {validationResult.matching.length}
                  </Badge>
                </div>
              </div>

              {validationResult.matching.length > 0 && (
                <Button
                  onClick={handleCopyMatching}
                  size="sm"
                  className="h-8 px-3 rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 hover:brightness-110 text-white font-bold shadow-xs text-xs gap-1.5 transition-all whitespace-nowrap shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Matching</span>
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-5 flex-1 flex flex-col gap-3">
              {validationResult.matching.length > 0 && (
                <QuickExporterBar
                  tickets={validationResult.matching}
                  title="Quick Export Matching Tickets"
                />
              )}

              <div className="glass-inset-well p-1 rounded-2xl flex-1 flex flex-col min-h-[140px]">
                {validationResult.status === "idle" ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs font-medium p-4">
                    Waiting for tickets...
                  </div>
                ) : validationResult.matching.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs font-medium p-4">
                    No matching tickets found between Block 1 and Block 2.
                  </div>
                ) : (
                  <Textarea
                    readOnly
                    value={validationResult.matching.join("\n")}
                    className="w-full h-full flex-1 font-mono text-sm leading-relaxed rounded-xl border-none bg-transparent text-foreground p-4 focus-visible:ring-0 focus-visible:outline-none resize-none no-scrollbar"
                  />
                )}
              </div>
            </CardContent>
          </GlassSpotlightCard>
        </div>
      </div>
    </div>
  );
}
