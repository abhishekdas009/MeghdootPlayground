"use client";

import * as React from "react";
import { UserCheck } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

/**
 * Extracts the vertical display name (first name only),
 * expanding "JP" variations to "JNANA" for the vertical watermark.
 */
function getVerticalDisplayName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  if (/^j\.?\s*p\.?(?=$|\s)/i.test(trimmed)) {
    return "JNANA";
  }
  return trimmed.split(/\s+/)[0] || "";
}

/**
 * Displays the active Case Owner's name vertically along the right workspace margin
 * using the translucent etched-noise + wallpaper-matched gradient style.
 * Clicking opens the startup name selector and "Ask name first" toggle.
 */
export function VerticalUserRail() {
  const userIdentityHydrated = useUIStore((s) => s.userIdentityHydrated);
  const activeUserName = useUIStore((s) => s.activeUserName);
  const askNameOnStart = useUIStore((s) => s.askNameOnStart);
  const setUserModalOpen = useUIStore((s) => s.setUserModalOpen);

  if (!userIdentityHydrated) return null;

  const firstName = activeUserName ? getVerticalDisplayName(activeUserName) : "";
  const displayName = firstName || "Select Name";
  const nameLengthTierClass = !firstName
    ? "text-[16px] lg:text-[18px] opacity-60"
    : firstName.length <= 6
      ? "text-[clamp(64px,11.6dvh,128px)]"
      : firstName.length <= 9
        ? "text-[clamp(58px,10.4dvh,112px)]"
        : "text-[clamp(40px,7.2dvh,80px)]";

  return (
    <div
      className="fixed right-1 md:right-1.5 lg:right-2 top-[calc(var(--app-header-height)+12px)] bottom-3 z-20 hidden md:flex items-end justify-center pointer-events-none"
    >
      <button
        type="button"
        onClick={() => setUserModalOpen(true)}
        className="vertical-owner-btn origin-bottom group pointer-events-auto relative flex max-h-full flex-col items-center justify-end px-0.5 py-1 transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 cursor-pointer"
        aria-label={
          activeUserName
            ? `Active user: ${activeUserName}. Click to change Case Owner or startup prompt setting.`
            : "No user selected. Click to choose your name from Case Owners."
        }
        title={
          activeUserName
            ? `${activeUserName} — Click to switch name or configure Ask Name First`
            : "Click to choose your name from Case Owners"
        }
      >
        {/* Bold white-to-fade reverse-vertical Designer watermark (First Name only) */}
        <span
          className={cn(
            "vertical-owner-watermark whitespace-nowrap uppercase tracking-[0.06em] leading-[1.12] select-none px-1",
            nameLengthTierClass
          )}
        >
          {displayName}
        </span>

        {/* Floating frosted hover hint on the left of the rail */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-full mr-2 top-1/2 -translate-y-1/2 flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200/80 dark:border-white/15 bg-white/95 dark:bg-[#080d19]/95 px-3 py-1.5 shadow-xl backdrop-blur-xl opacity-0 translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all duration-200"
        >
          <UserCheck className="h-3.5 w-3.5 text-sky-500 shrink-0" />
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[11px] font-extrabold text-slate-900 dark:text-white">
              {activeUserName || "Choose Case Owner"}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              Click to switch &bull; Ask on start: {askNameOnStart ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
