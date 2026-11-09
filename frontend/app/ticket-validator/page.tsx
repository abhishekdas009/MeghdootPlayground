"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Copy,
  Sparkles,
  ArrowRightLeft,
  ShieldCheck,
  Percent,
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

export default function TicketValidatorPage() {
  const [masterInput, setMasterInput] = React.useState("");
  const [compareInput, setCompareInput] = React.useState("");
  const [selectedRule, setSelectedRule] = React.useState<ValidationRuleId>("sf-digits");
  const [deduplicateMaster, setDeduplicateMaster] = React.useState(true);
  const [deduplicateCompare, setDeduplicateCompare] = React.useState(true);

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
    } else {
      return { status: "mismatch" as const, missing, matching, matchPercentage };
    }
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
    const temp = masterInput;
    setMasterInput(compareInput);
    setCompareInput(temp);
    toast.info("Swapped Block 1 and Block 2 contents");
  };

  const ruleObj = VALIDATION_RULES[selectedRule] || VALIDATION_RULES["sf-digits"];

  return (
    <div className="workspace-page mx-auto min-h-screen w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ─── Top Control & Rule Bar ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-card/60 dark:bg-[#08090d]/80 border border-border/80 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
              Ticket Validator & Cross-Checker
              <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] font-bold px-2 py-0.2">
                Real-Time Validation
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">
              Compare ticket batches, inspect duplicates, and validate against Salesforce case formats.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Validation Rule Selector */}
          <div className="flex items-center gap-2 bg-background/80 dark:bg-card px-3 py-1.5 rounded-2xl border border-border/80 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Rule:
            </span>
            <select
              value={selectedRule}
              onChange={(e) => setSelectedRule(e.target.value as ValidationRuleId)}
              className="text-xs font-bold bg-transparent text-foreground focus:outline-hidden cursor-pointer"
            >
              {Object.values(VALIDATION_RULES).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapBlocks}
            disabled={!masterInput && !compareInput}
            title="Swap Block 1 and Block 2"
            className="h-9 px-3 rounded-2xl border-border/80 bg-background/80 hover:bg-primary/10 hover:text-primary text-xs font-bold gap-1.5 shadow-2xs"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Swap Blocks</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={!masterInput && !compareInput}
            className="h-9 px-3 rounded-2xl border-border/80 bg-background/80 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 text-xs font-bold gap-1.5 shadow-2xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear All</span>
          </Button>
        </div>
      </div>

      {/* ─── Main Content Grid ─────────────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="show" variants={containerVariants} className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Input Blocks */}
        <div className="flex flex-col gap-6">
          {/* Block 1: Master Tickets */}
          <Card className="flex flex-col rounded-3xl overflow-hidden relative group border-border/80 shadow-xs">
            <CardHeader className="px-6 py-4 flex flex-col gap-3 relative z-10 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <CardTitle className="text-sm font-black tracking-tight text-foreground">
                    Block 1: Master List (Total Tickets)
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5 text-blue-600 dark:text-blue-400 border-blue-500/30">
                    {masterTickets.length} unique
                  </Badge>
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

              {/* Real-time stats pills for Block 1 */}
              <TicketStatsPills
                totalRaw={masterAnalysis.totalRawCount}
                validCount={masterAnalysis.validTickets.length}
                invalidCount={masterAnalysis.invalidTokens.length}
                duplicateCount={masterAnalysis.duplicateCount}
                selectedRule={selectedRule}
              />
            </CardHeader>

            <CardContent className="p-5 flex-1 flex flex-col gap-3 relative z-10">
              {/* Invalid Tokens Inspector for Block 1 */}
              <InvalidTokensInspector
                invalidTokens={masterAnalysis.invalidTokens}
                ruleBadge={ruleObj.badge}
                onStripInvalid={handleStripMasterInvalid}
              />

              {/* Deduplication Inspector for Block 1 */}
              <DeduplicationInspector
                duplicateCount={masterAnalysis.duplicateCount}
                duplicateItems={masterAnalysis.duplicateItems}
                deduplicateEnabled={deduplicateMaster}
                onToggleDeduplicate={setDeduplicateMaster}
              />

              <div className="relative flex-1 flex flex-col min-h-[220px] rounded-2xl bg-card/60 dark:bg-[#06070a] border border-border/80">
                <Textarea
                  placeholder={`Paste master ticket list here...\n\n2713009\n27127281\n27128910`}
                  className="flex-1 min-h-[220px] font-mono text-sm leading-relaxed rounded-2xl border-none bg-transparent text-foreground p-4 focus-visible:ring-0 focus-visible:outline-none resize-none no-scrollbar placeholder:text-muted-foreground"
                  value={masterInput}
                  onChange={(e) => setMasterInput(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Block 2: Compare Tickets */}
          <Card className="flex flex-col rounded-3xl overflow-hidden relative group border-border/80 shadow-xs">
            <CardHeader className="px-6 py-4 flex flex-col gap-3 relative z-10 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  <CardTitle className="text-sm font-black tracking-tight text-foreground">
                    Block 2: Tickets to Check
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5 text-violet-600 dark:text-violet-400 border-violet-500/30">
                    {compareTickets.length} unique
                  </Badge>
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

              {/* Real-time stats pills for Block 2 */}
              <TicketStatsPills
                totalRaw={compareAnalysis.totalRawCount}
                validCount={compareAnalysis.validTickets.length}
                invalidCount={compareAnalysis.invalidTokens.length}
                duplicateCount={compareAnalysis.duplicateCount}
                selectedRule={selectedRule}
              />
            </CardHeader>

            <CardContent className="p-5 flex-1 flex flex-col gap-3 relative z-10">
              {/* Invalid Tokens Inspector for Block 2 */}
              <InvalidTokensInspector
                invalidTokens={compareAnalysis.invalidTokens}
                ruleBadge={ruleObj.badge}
                onStripInvalid={handleStripCompareInvalid}
              />

              {/* Deduplication Inspector for Block 2 */}
              <DeduplicationInspector
                duplicateCount={compareAnalysis.duplicateCount}
                duplicateItems={compareAnalysis.duplicateItems}
                deduplicateEnabled={deduplicateCompare}
                onToggleDeduplicate={setDeduplicateCompare}
              />

              <div className="relative flex-1 flex flex-col min-h-[220px] rounded-2xl bg-card/60 dark:bg-[#06070a] border border-border/80">
                <Textarea
                  placeholder={`Paste tickets to verify against Block 1...\n\n2713009\n27127281`}
                  className="flex-1 min-h-[220px] font-mono text-sm leading-relaxed rounded-2xl border-none bg-transparent text-foreground p-4 focus-visible:ring-0 focus-visible:outline-none resize-none no-scrollbar placeholder:text-muted-foreground"
                  value={compareInput}
                  onChange={(e) => setCompareInput(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Result Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-col gap-6 h-full">
          {/* Summary Dashboard Card */}
          <Card className="flex flex-col rounded-3xl overflow-hidden relative border-border/80 shadow-xs">
            <CardHeader className="px-6 py-4 flex flex-row items-center justify-between relative z-10 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-black tracking-tight text-foreground">
                  Verification Summary
                </CardTitle>
              </div>

              {validationResult.status !== "idle" && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                  <Percent className="h-3.5 w-3.5" />
                  <span>{validationResult.matchPercentage}% Match</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-card/70 dark:bg-[#08090d] border border-border/80">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Master (B1)</span>
                  <span className="text-2xl font-black text-foreground">{masterTickets.length}</span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-card/70 dark:bg-[#08090d] border border-border/80">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">To Check (B2)</span>
                  <span className="text-2xl font-black text-foreground">{compareTickets.length}</span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Matching</span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{validationResult.matching.length}</span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Missing</span>
                  <span className="text-2xl font-black text-rose-700 dark:text-rose-300">{validationResult.missing.length}</span>
                </div>
              </div>

              {/* Progress bar */}
              {validationResult.status !== "idle" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                    <span>Cross-Check Match Rate</span>
                    <span className="text-foreground">{validationResult.matching.length} of {compareTickets.length} tickets matched</span>
                  </div>
                  <div className="h-2 w-full bg-border/60 dark:bg-white/10 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 transition-all duration-500"
                      style={{ width: `${validationResult.matchPercentage}%` }}
                    />
                    <div
                      className="bg-rose-500 transition-all duration-500"
                      style={{ width: `${100 - validationResult.matchPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Missing Tickets Card */}
          <Card
            className={cn(
              "flex flex-col rounded-3xl overflow-hidden relative transition-all duration-300 border-border/80 shadow-xs",
              validationResult.status === "mismatch" && "border-rose-500/40"
            )}
          >
            <CardHeader className="px-6 py-4 flex flex-row items-center justify-between relative z-10 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <AlertTriangle
                  className={cn(
                    "h-5 w-5",
                    validationResult.status === "mismatch" ? "text-rose-500" : "text-muted-foreground"
                  )}
                />
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-black tracking-tight text-foreground">
                    Missing Tickets (In B2, Not in B1)
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-bold px-2 py-0.2",
                      validationResult.missing.length > 0
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
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
                  className="h-8 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs text-xs gap-1.5 transition-all"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy List</span>
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-5 flex-1 flex flex-col gap-3">
              {/* Quick Exporters for Missing Tickets */}
              {validationResult.missing.length > 0 && (
                <QuickExporterBar
                  tickets={validationResult.missing}
                  title="Quick Export Missing Tickets"
                />
              )}

              <div className="p-1 rounded-2xl bg-card/60 dark:bg-[#06070a] border border-border/80 flex-1 flex flex-col min-h-[140px]">
                {validationResult.status === "idle" ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs font-medium p-4">
                    Paste tickets into Block 1 & 2 to run instant validation...
                  </div>
                ) : validationResult.status === "success" ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold p-4 gap-1.5">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
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
          </Card>

          {/* Matching Tickets Card */}
          <Card
            className={cn(
              "flex flex-col rounded-3xl overflow-hidden relative transition-all duration-300 border-border/80 shadow-xs",
              validationResult.matching.length > 0 && "border-emerald-500/40"
            )}
          >
            <CardHeader className="px-6 py-4 flex flex-row items-center justify-between relative z-10 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <CheckCircle2
                  className={cn(
                    "h-5 w-5",
                    validationResult.matching.length > 0 ? "text-emerald-500" : "text-muted-foreground"
                  )}
                />
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-black tracking-tight text-foreground">
                    Matching Tickets (Present in Both)
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-bold px-2 py-0.2",
                      validationResult.matching.length > 0
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
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
                  className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs text-xs gap-1.5 transition-all"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy List</span>
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-5 flex-1 flex flex-col gap-3">
              {/* Quick Exporters for Matching Tickets */}
              {validationResult.matching.length > 0 && (
                <QuickExporterBar
                  tickets={validationResult.matching}
                  title="Quick Export Matching Tickets"
                />
              )}

              <div className="p-1 rounded-2xl bg-card/60 dark:bg-[#06070a] border border-border/80 flex-1 flex flex-col min-h-[140px]">
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
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
