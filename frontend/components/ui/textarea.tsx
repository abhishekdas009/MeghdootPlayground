import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[96px] w-full rounded-xl border border-border/60 bg-background/50 px-3 py-2 text-[clamp(0.875rem,1vw,0.9375rem)] text-foreground placeholder:text-slate-400/50 dark:placeholder:text-slate-600/50 font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.22)] focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
