"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Trash2, Copy, Sparkles, ShieldCheck } from "lucide-react";
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
    <div className="workspace-page mx-auto min-h-screen w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      
      {/* ─── Hero / Header Section ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="page-hero relative flex flex-col gap-6 overflow-hidden rounded-3xl p-8"
      >
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none dark:bg-emerald-500/20 dark:mix-blend-screen" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none dark:bg-blue-500/10 dark:mix-blend-screen" />
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-[0_0_30px_rgba(16,185,129,0.4)] border border-white/20">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 text-xs font-bold px-3 py-1 flex items-center gap-2 shadow-inner backdrop-blur-md uppercase tracking-widest dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40">
                  Validator Tool
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 drop-shadow-md dark:text-white">
                Ticket <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">Validator</span>
              </h1>
            </div>
            <div className="ml-auto">
               <Button 
                 variant="outline" 
                 onClick={handleClearAll} 
                 className="h-10 rounded-xl border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/30 font-bold text-xs gap-2 transition-all"
               >
                 <Trash2 className="h-4 w-4" /> Clear All
               </Button>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium max-w-2xl leading-relaxed mt-2 text-sm sm:text-base opacity-90">
            Compare a subset of tickets against a master list to instantly identify any missing records or discrepancies.
          </p>
        </div>
      </motion.div>

      {/* ─── Main Content Grid ─────────────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="show" variants={containerVariants} className="grid gap-6 lg:grid-cols-2">
        
        {/* Left Column: Input Blocks */}
        <div className="flex flex-col gap-6">
          {/* Block 1: Total Tickets (Master) */}
          <Card className="flex flex-col border border-white/10 shadow-2xl bg-white/5 dark:bg-white/5 backdrop-blur-3xl rounded-3xl overflow-hidden relative group transition-all duration-500 focus-within:shadow-[0_0_50px_-15px_rgba(16,185,129,0.3)] focus-within:border-emerald-500/40">
            <CardHeader className="bg-transparent px-6 py-5 flex flex-row items-center justify-between relative z-10">
              <CardTitle className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100">
                Block 1: Total Tickets
              </CardTitle>
              <Badge variant="outline" className="text-xs font-bold bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-300 dark:border-slate-700 px-3 py-1 text-emerald-600 dark:text-emerald-400 shadow-sm">
                {masterTickets.length}
              </Badge>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex-1 flex flex-col relative z-10">
              <Textarea
                placeholder="Paste the master list of tickets here..."
                className="flex-1 min-h-[250px] font-mono text-sm leading-relaxed rounded-2xl border border-slate-200/50 dark:border-white/10 bg-transparent text-slate-800 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-500/50 p-5 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                value={masterInput}
                onChange={(e) => setMasterInput(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Block 2: Tickets to Compare */}
          <Card className="flex flex-col border border-white/10 shadow-2xl bg-white/5 dark:bg-white/5 backdrop-blur-3xl rounded-3xl overflow-hidden relative group transition-all duration-500 focus-within:shadow-[0_0_50px_-15px_rgba(59,130,246,0.3)] focus-within:border-blue-500/40">
            <CardHeader className="bg-transparent px-6 py-5 flex flex-row items-center justify-between relative z-10">
              <CardTitle className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100">
                Block 2: Tickets to Check
              </CardTitle>
              <Badge variant="outline" className="text-xs font-bold bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-300 dark:border-slate-700 px-3 py-1 text-blue-600 dark:text-blue-400 shadow-sm">
                {compareTickets.length}
              </Badge>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex-1 flex flex-col relative z-10">
              <Textarea
                placeholder="Paste tickets to check against Block 1..."
                className="flex-1 min-h-[250px] font-mono text-sm leading-relaxed rounded-2xl border border-slate-200/50 dark:border-white/10 bg-transparent text-slate-800 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500/50 p-5 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                value={compareInput}
                onChange={(e) => setCompareInput(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Result Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-6 h-full">
          
          {/* Summary Counts Card */}
          <Card className="flex flex-col border border-white/10 shadow-xl bg-white/5 dark:bg-white/5 backdrop-blur-3xl rounded-3xl overflow-hidden relative transition-all duration-500">
            <CardHeader className="bg-transparent px-6 py-5 flex flex-row items-center justify-between relative z-10 border-b border-white/5">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <CardTitle className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">
                  Summary Counts
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Master</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{masterTickets.length}</span>
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">To Check</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{compareTickets.length}</span>
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Matching</span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{validationResult.matching.length}</span>
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-900/20 border border-rose-200/50 dark:border-rose-800/30">
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Missing</span>
                  <span className="text-2xl font-black text-rose-700 dark:text-rose-300">{validationResult.missing.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Missing Tickets Card */}
          <Card className={cn(
            "flex flex-col border border-white/10 shadow-xl backdrop-blur-3xl rounded-3xl overflow-hidden relative transition-all duration-500",
            validationResult.status === "idle" || validationResult.status === "success" ? "bg-white/5 dark:bg-white/5 opacity-70" :
            "bg-rose-50/80 dark:bg-rose-950/20 border-rose-500/30"
          )}>
            <CardHeader className="bg-transparent px-6 py-5 flex flex-row items-center justify-between relative z-10">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  {validationResult.status === "mismatch" ? <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" /> : <AlertTriangle className="h-5 w-5 text-slate-400" />}
                  <CardTitle className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">
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
            <CardContent className="p-6 pt-0 flex-1 flex flex-col">
              <div className="p-1 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-inner flex-1 flex flex-col min-h-[140px]">
                {validationResult.status === "idle" ? (
                  <div className="flex-1 flex items-center justify-center text-slate-500 font-medium text-center p-4">Waiting for input...</div>
                ) : validationResult.status === "success" ? (
                  <div className="flex-1 flex items-center justify-center text-emerald-600 font-medium text-center p-4">No missing tickets! All tickets match.</div>
                ) : (
                  <Textarea
                    readOnly
                    value={validationResult.missing.join("\n")}
                    className="w-full h-full flex-1 font-mono text-sm leading-relaxed rounded-xl border-transparent bg-transparent text-slate-800 dark:text-slate-200 p-4 focus-visible:ring-0 focus-visible:outline-none resize-none custom-scrollbar"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Matching Tickets Card */}
          <Card className={cn(
            "flex flex-col border border-white/10 shadow-xl backdrop-blur-3xl rounded-3xl overflow-hidden relative transition-all duration-500",
            validationResult.status === "idle" || validationResult.matching.length === 0 ? "bg-white/5 dark:bg-white/5 opacity-70" :
            "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-500/30"
          )}>
            <CardHeader className="bg-transparent px-6 py-5 flex flex-row items-center justify-between relative z-10">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  {validationResult.matching.length > 0 ? <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> : <CheckCircle2 className="h-5 w-5 text-slate-400" />}
                  <CardTitle className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">
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
            <CardContent className="p-6 pt-0 flex-1 flex flex-col">
              <div className="p-1 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-inner flex-1 flex flex-col min-h-[140px]">
                {validationResult.status === "idle" ? (
                  <div className="flex-1 flex items-center justify-center text-slate-500 font-medium text-center p-4">Waiting for input...</div>
                ) : validationResult.matching.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-rose-600 font-medium text-center p-4">No matching tickets found.</div>
                ) : (
                  <Textarea
                    readOnly
                    value={validationResult.matching.join("\n")}
                    className="w-full h-full flex-1 font-mono text-sm leading-relaxed rounded-xl border-transparent bg-transparent text-slate-800 dark:text-slate-200 p-4 focus-visible:ring-0 focus-visible:outline-none resize-none custom-scrollbar"
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
