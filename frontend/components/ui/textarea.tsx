import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[104px] w-full rounded-xl border border-border/80 bg-card/90 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground shadow-xs transition-all duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50 resize-y dark:bg-[#06070a] dark:border-white/10 dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] dark:focus:border-primary/80 dark:focus:ring-primary/20",
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
