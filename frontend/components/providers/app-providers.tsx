"use client";

import * as React from "react";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Prevent unformatted or benign rejections from triggering Next.js [object Object] dev overlay
      if (event.reason) {
        console.warn("[AppProviders] Intercepted unhandled promise rejection:", event.reason);
        // Suppress dev-tools overlay for non-standard error throws and DOMExceptions
        if (!(event.reason instanceof Error) || (event.reason as any).name === "DOMException") {
          event.preventDefault();
        }
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  }, []);

  return (
    <QueryProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryProvider>
  );
}
