"use client";

import React from "react";
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from "react-error-boundary";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Card className="overflow-hidden rounded-3xl border border-rose-200/50 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/20 shadow-none backdrop-blur-xl transition-all duration-300 w-full max-w-lg mx-auto mt-8">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-black text-rose-800 dark:text-rose-300">Something went wrong</CardTitle>
            <CardDescription className="text-rose-600/80 dark:text-rose-400/80 font-medium">An error occurred in this component.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl bg-white/60 dark:bg-black/40 p-4 border border-rose-100 dark:border-rose-900/30 overflow-auto max-h-[200px]">
          <pre className="text-xs font-mono text-rose-700 dark:text-rose-400 break-words whitespace-pre-wrap">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
        <div className="flex justify-end">
          <Button 
            onClick={resetErrorBoundary} 
            variant="outline"
            className="gap-2 border-rose-200 hover:bg-rose-100 hover:text-rose-700 dark:border-rose-800 dark:hover:bg-rose-900/50 dark:hover:text-rose-300"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

export function ErrorBoundary({ children, onReset }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={onReset}
    >
      {children}
    </ReactErrorBoundary>
  );
}
