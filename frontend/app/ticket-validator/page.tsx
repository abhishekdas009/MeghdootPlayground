"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Trash2, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function TicketValidatorPage() {
  const [masterInput, setMasterInput] = React.useState("");
  const [compareInput, setCompareInput] = React.useState("");

  const masterTickets = React.useMemo(() => {
    return Array.from(new Set(
      masterInput
        .split(/[\n\r,\t]+/)
        .map((t) => t.replace(/['\s\u00A0]+/g, ""))
        .filter((t) => t.length > 0)
    ));
  }, [masterInput]);

  const compareTickets = React.useMemo(() => {
    return Array.from(new Set(
      compareInput
        .split(/[\n\r,\t]+/)
        .map((t) => t.replace(/['\s\u00A0]+/g, ""))
        .filter((t) => t.length > 0)
    ));
  }, [compareInput]);

  const validationResult = React.useMemo(() => {
    if (masterTickets.length === 0 || compareTickets.length === 0) {
      return { status: "idle", missing: [] as string[], matching: [] as string[] };
    }

    const masterSet = new Set(masterTickets);
    const missing = compareTickets.filter(ticket => !masterSet.has(ticket));
    const matching = compareTickets.filter(ticket => masterSet.has(ticket));

    if (missing.length === 0) {
      return { status: "success", missing, matching };
    } else {
      return { status: "mismatch", missing, matching };
    }
  }, [masterTickets, compareTickets]);

  const handleCopyMissing = () => {
    if (validationResult.missing.length > 0) {
      navigator.clipboard.writeText(validationResult.missing.join("\n"));
      toast.success("Copied missing tickets to clipboard!");
    }
  };

  const handleCopyMatching = () => {
    if (validationResult.matching.length > 0) {
      navigator.clipboard.writeText(validationResult.matching.join("\n"));
      toast.success("Copied matching tickets to clipboard!");
    }
  };

  const handleClearAll = () => {
    setMasterInput("");
    setCompareInput("");
    toast.info("Cleared all inputs");
  };

  return (
    <div className="workspace-page mx-auto min-h-screen w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ─── Main Content Grid ─────────────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="show" variants={containerVariants} className="grid gap-6 lg:grid-cols-2">
        
        {/* Left Column: Input Blocks */}
        <div className="flex flex-col gap-6">
          {/* Block 1: Total Tickets (Master) */}
          <Card className="flex flex-col rounded-3xl overflow-hidden relative group">
            <CardHeader className="px-6 py-5 flex flex-row items-center justify-between relative z-10 border-b border-border/60">
              <CardTitle className="text-base font-extrabold tracking-tight text-foreground">
                Block 1: Total Tickets
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-bold px-3 py-0.5 text-primary border-primary/30">
                  {masterTickets.length}
                </Badge>
                {masterInput && (
                  <Button variant="ghost" size="sm" onClick={() => setMasterInput("")} className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500" title="Clear Block 1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col relative z-10">
              <Textarea
                placeholder="Paste the master list of tickets here..."
                className="flex-1 min-h-[250px] font-mono text-sm leading-relaxed rounded-2xl p-4 transition-all resize-none"
                value={masterInput}
                onChange={(e) => setMasterInput(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Block 2: Tickets to Compare */}
          <Card className="flex flex-col rounded-3xl overflow-hidden relative group">
            <CardHeader className="px-6 py-5 flex flex-row items-center justify-between relative z-10 border-b border-border/60">
              <CardTitle className="text-base font-extrabold tracking-tight text-foreground">
                Block 2: Tickets to Check
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-bold px-3 py-0.5 text-secondary border-secondary/30">
                  {compareTickets.length}
                </Badge>
                {compareInput && (
                  <Button variant="ghost" size="sm" onClick={() => setCompareInput("")} className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500" title="Clear Block 2">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col relative z-10">
              <Textarea
                placeholder="Paste tickets to check against Block 1..."
                className="flex-1 min-h-[250px] font-mono text-sm leading-relaxed rounded-2xl p-4 transition-all resize-none"
                value={compareInput}
                onChange={(e) => setCompareInput(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Result Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-6 h-full">
          
          {/* Summary Counts Card */}
          <Card className="flex flex-col rounded-3xl overflow-hidden relative">
            <CardHeader className="px-6 py-5 flex flex-row items-center justify-between relative z-10 border-b border-border/60">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-extrabold tracking-tight text-foreground">
                  Summary Counts
                </CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearAll} 
                disabled={!masterInput && !compareInput}
                className="h-8 rounded-xl border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/30 font-bold text-xs gap-1.5 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-card/70 dark:bg-[#08090d] border border-border/80 dark:border-white/10">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Master</span>
                  <span className="text-2xl font-black text-foreground">{masterTickets.length}</span>
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-card/70 dark:bg-[#08090d] border border-border/80 dark:border-white/10">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">To Check</span>
                  <span className="text-2xl font-black text-foreground">{compareTickets.length}</span>
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Matching</span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{validationResult.matching.length}</span>
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Missing</span>
                  <span className="text-2xl font-black text-rose-700 dark:text-rose-300">{validationResult.missing.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Missing Tickets Card */}
          <Card className={cn(
            "flex flex-col rounded-3xl overflow-hidden relative transition-all duration-300",
            validationResult.status === "mismatch" && "border-rose-500/40"
          )}>
            <CardHeader className="px-6 py-5 flex flex-row items-center justify-between relative z-10 border-b border-border/60">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className={cn("h-5 w-5", validationResult.status === "mismatch" ? "text-rose-500" : "text-muted-foreground")} />
                  <CardTitle className="text-base font-extrabold tracking-tight text-foreground">
                    Missing Tickets
                  </CardTitle>
                </div>
                {validationResult.status === "mismatch" && (
                  <Button 
                    onClick={handleCopyMissing}
                    className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-500/20 text-xs gap-2 transition-all"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy Missing
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="p-1 rounded-2xl bg-card/60 dark:bg-[#06070a] border border-border/80 dark:border-white/10 flex-1 flex flex-col min-h-[140px]">
                {validationResult.status === "idle" ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground font-medium text-center p-4">Waiting for input...</div>
                ) : validationResult.status === "success" ? (
                  <div className="flex-1 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-center p-4">No missing tickets! All tickets match.</div>
                ) : (
                  <Textarea
                    readOnly
                    value={validationResult.missing.join("\n")}
                    className="w-full h-full flex-1 font-mono text-sm leading-relaxed rounded-xl border-none bg-transparent text-foreground p-4 focus-visible:ring-0 focus-visible:outline-none resize-none no-scrollbar"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Matching Tickets Card */}
          <Card className={cn(
            "flex flex-col rounded-3xl overflow-hidden relative transition-all duration-300",
            validationResult.matching.length > 0 && "border-emerald-500/40"
          )}>
            <CardHeader className="px-6 py-5 flex flex-row items-center justify-between relative z-10 border-b border-border/60">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={cn("h-5 w-5", validationResult.matching.length > 0 ? "text-emerald-500" : "text-muted-foreground")} />
                  <CardTitle className="text-base font-extrabold tracking-tight text-foreground">
                    Matching Tickets
                  </CardTitle>
                </div>
                {validationResult.matching.length > 0 && (
                  <Button 
                    onClick={handleCopyMatching}
                    className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-500/20 text-xs gap-2 transition-all"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy Matching
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="p-1 rounded-2xl bg-card/60 dark:bg-[#06070a] border border-border/80 dark:border-white/10 flex-1 flex flex-col min-h-[140px]">
                {validationResult.status === "idle" ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground font-medium text-center p-4">Waiting for input...</div>
                ) : validationResult.matching.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-rose-500 font-medium text-center p-4">No matching tickets found.</div>
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
