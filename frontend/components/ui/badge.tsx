import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-w-0 items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider leading-relaxed transition-all duration-150 border",
  {
    variants: {
      variant: {
        default:
          "border-border/80 bg-muted/70 text-foreground dark:bg-muted/40",
        secondary:
          "border-secondary/25 bg-secondary/10 text-secondary dark:border-secondary/30 dark:bg-secondary/15",
        outline:
          "border-border/90 bg-transparent text-foreground",
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 dark:border-emerald-500/25 dark:bg-emerald-500/15",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 dark:border-amber-500/25 dark:bg-amber-500/15",
        danger:
          "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 dark:border-rose-500/25 dark:bg-rose-500/15",
        primary:
          "border-primary/30 bg-primary/10 text-primary dark:border-primary/35 dark:bg-primary/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };