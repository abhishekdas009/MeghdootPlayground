"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  Search,
  Check,
  X,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Users,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useUIStore, type CaseOwnerSummary } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { EASE_120HZ } from "@/lib/motion";

function getOwnerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function UserIdentityModal() {
  const userModalOpen = useUIStore((s) => s.userModalOpen);
  const activeUserId = useUIStore((s) => s.activeUserId);
  const activeUserName = useUIStore((s) => s.activeUserName);
  const activeUserOwnerId = useUIStore((s) => s.activeUserOwnerId);
  const askNameOnStart = useUIStore((s) => s.askNameOnStart);
  const caseOwnersList = useUIStore((s) => s.caseOwnersList);
  const loadState = useUIStore((s) => s.caseOwnersLoadState);
  const refreshCaseOwners = useUIStore((s) => s.refreshCaseOwners);
  const setActiveUser = useUIStore((s) => s.setActiveUser);
  const setAskNameOnStart = useUIStore((s) => s.setAskNameOnStart);
  const dismissUserModalForSession = useUIStore((s) => s.dismissUserModalForSession);

  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const owners = React.useMemo(
    () => caseOwnersList.filter((owner) => owner.isActive),
    [caseOwnersList]
  );

  React.useEffect(() => {
    if (!userModalOpen) return;
    setSearchQuery("");
    void refreshCaseOwners();

    const focusTimer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 80);
    return () => window.clearTimeout(focusTimer);
  }, [userModalOpen, refreshCaseOwners]);

  // Dismiss cleanly with Escape
  React.useEffect(() => {
    if (!userModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismissUserModalForSession();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [userModalOpen, dismissUserModalForSession]);

  const filteredOwners = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return owners;
    return owners.filter(
      (owner) =>
        owner.name.toLowerCase().includes(query) ||
        owner.ownerId.toLowerCase().includes(query)
    );
  }, [owners, searchQuery]);

  const handleSelectOwner = React.useCallback(
    (owner: CaseOwnerSummary) => {
      setActiveUser({ id: owner.id, name: owner.name, ownerId: owner.ownerId });
      toast.success(`Signed in as ${owner.name}`, {
        description: askNameOnStart
          ? "Printed vertically on the right edge • Will ask again next session"
          : "Printed vertically on the right edge • Saved for future launches",
      });
    },
    [setActiveUser, askNameOnStart]
  );

  if (!userModalOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meghdoot-user-picker-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissUserModalForSession}
          className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: EASE_120HZ }}
          className="relative w-full max-w-xl max-h-[88vh] flex flex-col rounded-3xl border border-slate-200/80 dark:border-white/15 bg-white/95 dark:bg-[#080d19]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
          style={{
            boxShadow:
              "0 30px 80px -20px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 shrink-0 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="meghdoot-user-picker-title"
                    className="text-base font-black tracking-tight text-slate-900 dark:text-white"
                  >
                    Who is using Meghdoot today?
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 whitespace-nowrap shrink-0">
                    <Sparkles className="h-2.5 w-2.5" /> Case Owners
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose your name from active Case Owners to display it vertically along the workspace edge.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => void refreshCaseOwners()}
                disabled={loadState === "loading"}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
                title="Refresh active Case Owners list"
                aria-label="Refresh active Case Owners list"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", loadState === "loading" && "animate-spin")} />
              </button>
              <button
                type="button"
                onClick={dismissUserModalForSession}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Close"
                aria-label="Close name picker"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="px-6 pt-4 pb-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && filteredOwners.length > 0) {
                    event.preventDefault();
                    handleSelectOwner(filteredOwners[0]!);
                  }
                }}
                placeholder="Search active Case Owner name or Owner ID..."
                className="pl-10 h-10 min-h-10 text-xs font-semibold rounded-xl"
              />
            </div>
          </div>

          {/* Active Owners List */}
          <div className="flex-1 overflow-y-auto px-6 py-2 space-y-2 min-h-[200px] max-h-[340px] no-scrollbar">
            {loadState === "loading" && owners.length === 0 ? (
              <div className="space-y-2 py-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-14 w-full rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-slate-100/70 dark:bg-white/[0.03] animate-pulse"
                  />
                ))}
              </div>
            ) : loadState === "error" && owners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-2xl border border-dashed border-rose-300/60 dark:border-rose-500/25 bg-rose-500/[0.04]">
                <AlertCircle className="h-7 w-7 text-rose-500 mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Unable to load Case Owners from database
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Check that PostgreSQL is running, then click retry.
                </p>
                <button
                  type="button"
                  onClick={() => void refreshCaseOwners()}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 px-3 py-1.5 text-xs font-bold transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </button>
              </div>
            ) : owners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/40 dark:bg-white/[0.02]">
                <Users className="h-7 w-7 text-sky-500 mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  No active Case Owners found
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Add or activate employee Case Owners in Case Assignment inside SOQL Generator to choose your name here.
                </p>
                <Link
                  href="/soql-generator"
                  onClick={dismissUserModalForSession}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-300 px-3 py-1.5 text-xs font-bold transition-colors"
                >
                  Open Case Owners Setup <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : filteredOwners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Search className="h-6 w-6 text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No Case Owner matched &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            ) : (
              filteredOwners.map((owner) => {
                const isSelected =
                  (activeUserId && owner.id === activeUserId) ||
                  (activeUserOwnerId && owner.ownerId === activeUserOwnerId) ||
                  (!activeUserOwnerId &&
                    activeUserName.toLowerCase() === owner.name.toLowerCase());

                return (
                  <button
                    key={owner.id}
                    type="button"
                    onClick={() => handleSelectOwner(owner)}
                    aria-pressed={isSelected}
                    className={cn(
                      "group w-full flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50",
                      isSelected
                        ? "border-sky-500/60 bg-sky-500/10 dark:bg-sky-500/15 shadow-sm shadow-sky-500/10"
                        : "border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.02] hover:border-sky-400/50 hover:bg-sky-500/[0.06] dark:hover:bg-white/[0.06]"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black tracking-tight transition-colors",
                          isSelected
                            ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/30"
                            : "bg-slate-100 dark:bg-white/[0.07] text-slate-700 dark:text-slate-200 group-hover:bg-sky-500/15 group-hover:text-sky-600 dark:group-hover:text-sky-300"
                        )}
                      >
                        {getOwnerInitials(owner.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {owner.name}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-300">
                              <Check className="h-2.5 w-2.5" /> Selected
                            </span>
                          )}
                        </div>
                        <span className="block truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {owner.ownerId}
                        </span>
                      </div>
                    </div>

                    <ArrowRight
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-150",
                        isSelected
                          ? "text-sky-500 translate-x-0"
                          : "text-slate-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-sky-500"
                      )}
                    />
                  </button>
                );
              })
            )}
          </div>

          {/* Startup Option Footer: Ask Name First Toggle + Action */}
          <div className="px-6 py-4 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                role="switch"
                aria-checked={askNameOnStart}
                aria-label="Ask name first when Meghdoot starts"
                onClick={() => setAskNameOnStart(!askNameOnStart)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50",
                  askNameOnStart
                    ? "bg-sky-500 border-sky-400 shadow-inner"
                    : "bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/15"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                    askNameOnStart ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  Ask name first on startup
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {askNameOnStart
                    ? "Prompts at each new session start"
                    : "Remembers saved name automatically"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={dismissUserModalForSession}
                className="rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.1] px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
              >
                {activeUserName ? `Continue as ${activeUserName.split(" ")[0]}` : "Skip for now"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
