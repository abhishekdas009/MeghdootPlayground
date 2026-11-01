"use client";

import * as React from "react";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Prevent unformatted or benign rejections from triggering Next.js [object Object] dev overlay
      if (event.reason) {
        const reason = event.reason as any;
        const isCancelation = reason?.type === "cancelation";
        const isDomException = reason?.name === "DOMException";
        const isNonError = !(event.reason instanceof Error);
        const isStringObject = String(event.reason) === "[object Object]";

        if (isCancelation || isDomException || isNonError || isStringObject) {
          // Stop Next.js dev overlay from capturing this event and displaying [object Object]
          event.stopImmediatePropagation();
          event.preventDefault();
          console.warn("[AppProviders] Suppressed non-critical promise rejection:", event.reason);
        }
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection, { capture: true });
    return () => window.removeEventListener("unhandledrejection", handleUnhandledRejection, { capture: true });
  }, []);

  return (
    <QueryProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryProvider>
  );
}
